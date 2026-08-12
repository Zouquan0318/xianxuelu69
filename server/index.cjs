/**
 * 轻量级问卷数据后端服务器
 * 使用 Node.js 内置 http 模块，零外部依赖
 * 数据持久化存储在 JSON 文件中
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'surveys.json');
const HOUSEHOLDS_FILE = path.join(DATA_DIR, 'households.json');

// 加载户号白名单
let householdWhitelist = [];
function loadHouseholds() {
  if (fs.existsSync(HOUSEHOLDS_FILE)) {
    try {
      const raw = fs.readFileSync(HOUSEHOLDS_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        householdWhitelist = list;
        console.log(`已加载户号白名单: ${householdWhitelist.length} 个`);
      }
    } catch (err) {
      console.error('加载户号白名单失败:', err.message);
    }
  }
}

// 确保数据目录和文件存在
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// 读取所有问卷数据
function readSurveys() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 检查户号是否已提交
function isHouseholdSubmitted(householdId) {
  const surveys = readSurveys();
  return surveys.some((s) => s.household === householdId);
}

// 保存问卷数据
function saveSurvey(survey) {
  const surveys = readSurveys();
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    submittedAt: new Date().toISOString(),
    ...survey,
  };
  surveys.push(record);
  fs.writeFileSync(DATA_FILE, JSON.stringify(surveys, null, 2), 'utf-8');
  return record;
}

// 导出数据为 CSV 格式（便于 Excel 分析）
function exportToCSV() {
  const surveys = readSurveys();
  if (surveys.length === 0) return '';

  const headers = [
    'ID',
    '提交时间',
    '户号',
    'Q1_整体满意度',
    'Q2_存在问题',
    'Q3_更换看法',
    'Q4_希望改善',
    'Q5_有推荐公司',
    'Q5_公司名称',
    'Q6_业委会看法',
    'Q7_其他建议',
  ];

  const rows = surveys.map((s) => [
    s.id,
    s.submittedAt,
    s.household || '',
    s.q1_satisfaction || '',
    Array.isArray(s.q2_issues) ? s.q2_issues.join(';') : '',
    s.q3_support_change || '',
    Array.isArray(s.q4_improvements) ? s.q4_improvements.join(';') : '',
    s.q5_has_recommendation || '',
    s.q5_company_name || '',
    s.q6_committee || '',
    (s.q7_suggestions || '').replace(/\n/g, ' '),
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
}

// 统计概览
function getStats() {
  const surveys = readSurveys();
  const total = surveys.length;
  if (total === 0) return { total: 0 };

  const satisfactionCount = {};
  const viewCount = {};
  const unitCount = {};

  surveys.forEach((s) => {
    satisfactionCount[s.q1_satisfaction] = (satisfactionCount[s.q1_satisfaction] || 0) + 1;
    viewCount[s.q3_support_change] = (viewCount[s.q3_support_change] || 0) + 1;
    // 统计单元参与情况
    const parts = (s.household || '').split('-');
    if (parts.length >= 3) {
      const unit = parts[1];
      unitCount[unit] = (unitCount[unit] || 0) + 1;
    }
  });

  return {
    total,
    totalHouseholds: householdWhitelist.length,
    participationRate: ((total / householdWhitelist.length) * 100).toFixed(1) + '%',
    satisfactionDistribution: satisfactionCount,
    changeViewDistribution: viewCount,
    unitParticipation: unitCount,
  };
}

const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // GET /api/households - 获取户号白名单
  if (req.method === 'GET' && url.pathname === '/api/households') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      total: householdWhitelist.length,
      households: householdWhitelist,
    }));
    return;
  }

  // POST /api/survey - 提交问卷
  if (req.method === 'POST' && url.pathname === '/api/survey') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // 验证户号
        const household = data.household;
        if (!household) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '请选择户号' }));
          return;
        }
        if (!householdWhitelist.includes(household)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '户号不在白名单中，请确认输入正确' }));
          return;
        }
        if (isHouseholdSubmitted(household)) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '该户号已提交过问卷，请勿重复投票' }));
          return;
        }

        const record = saveSurvey(data);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: record.id, message: '问卷提交成功' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '数据格式错误' }));
      }
    });
    return;
  }

  // GET /api/surveys - 获取所有问卷
  if (req.method === 'GET' && url.pathname === '/api/surveys') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readSurveys(), null, 2));
    return;
  }

  // GET /api/stats - 获取统计概览
  if (req.method === 'GET' && url.pathname === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getStats(), null, 2));
    return;
  }

  // GET /api/export/csv - 导出 CSV
  if (req.method === 'GET' && url.pathname === '/api/export/csv') {
    const csv = exportToCSV();
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="survey_export.csv"',
    });
    res.end('\uFEFF' + csv); // BOM for Excel
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: '接口不存在' }));
});

loadHouseholds();
server.listen(PORT, () => {
  console.log(`问卷数据后端服务器已启动`);
  console.log(`http://localhost:${PORT}`);
  console.log('');
  console.log('可用接口：');
  console.log(`  GET  http://localhost:${PORT}/api/households  - 获取户号白名单`);
  console.log(`  POST http://localhost:${PORT}/api/survey      - 提交问卷`);
  console.log(`  GET  http://localhost:${PORT}/api/surveys     - 查看所有数据`);
  console.log(`  GET  http://localhost:${PORT}/api/stats       - 统计概览`);
  console.log(`  GET  http://localhost:${PORT}/api/export/csv  - 导出 CSV`);
  console.log('');
  console.log(`数据存储位置: ${DATA_FILE}`);
  console.log(`户号白名单: ${HOUSEHOLDS_FILE}`);
});
