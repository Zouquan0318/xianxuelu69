// 共享数据存储模块
// 优先使用 Redis（REDIS_URL），其次 Vercel KV（REST），未配置时回退到内存数组

const householdWhitelist = require('./household-data');

const SURVEYS_KEY = 'surveys';

// 本地缓存，用于减少 Redis 读取次数（Serverless 单次请求内有效）
let localSurveys = null;
let redisClient = null;
let redisReady = false;

// 初始化 Redis 客户端
function initRedisClient() {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      const { createClient } = require('redis');
      redisClient = createClient({ url: redisUrl });
      redisClient.on('error', (err) => {
        console.error('Redis 连接错误:', err.message);
      });
      redisClient.connect().catch(() => {});
      redisReady = true;
      return redisClient;
    } catch (err) {
      console.error('Redis 初始化失败:', err.message);
    }
  }

  // 尝试 Vercel KV REST（兼容旧项目）
  try {
    const { kv: vercelKv } = require('@vercel/kv');
    redisClient = vercelKv;
    redisReady = true;
    return redisClient;
  } catch {
    // ignore
  }

  redisReady = false;
  return null;
}

// 获取 Redis 客户端（延迟初始化）
function getRedisClient() {
  if (!redisClient) {
    initRedisClient();
  }
  return redisReady ? redisClient : null;
}

// 从 Redis 或内存加载问卷数据
async function loadSurveys() {
  if (localSurveys) {
    return localSurveys;
  }

  const client = getRedisClient();

  if (client) {
    try {
      const raw = await client.get(SURVEYS_KEY);
      if (raw) {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
          localSurveys = data;
          return data;
        }
      }
    } catch (err) {
      console.error('Redis 加载失败，使用空数据:', err.message);
    }
  }

  localSurveys = [];
  return localSurveys;
}

// 保存问卷数据到 Redis 或内存
async function saveSurveys(surveys) {
  localSurveys = surveys;

  const client = getRedisClient();

  if (client) {
    try {
      await client.set(SURVEYS_KEY, JSON.stringify(surveys));
    } catch (err) {
      console.error('Redis 保存失败:', err.message);
    }
  }
}

// 检查户号是否已提交
async function isHouseholdSubmitted(householdId) {
  const surveys = await loadSurveys();
  return surveys.some((s) => s.household === householdId);
}

// 保存单条问卷
async function saveSurvey(survey) {
  const surveys = await loadSurveys();
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    submittedAt: new Date().toISOString(),
    ...survey,
  };
  surveys.push(record);
  await saveSurveys(surveys);
  return record;
}

// 导出数据为 CSV 格式
function exportToCSV(surveys) {
  if (!Array.isArray(surveys) || surveys.length === 0) return '';

  const headers = [
    'ID', '提交时间', '户号',
    'Q1_整体满意度', 'Q2_存在问题', 'Q3_更换看法',
    'Q4_希望改善', 'Q5_有推荐公司', 'Q5_公司名称',
    'Q6_业委会看法', 'Q7_其他建议',
  ];

  const rows = surveys.map((s) => [
    s.id, s.submittedAt, s.household || '',
    s.q1_satisfaction || '',
    Array.isArray(s.q2_issues) ? s.q2_issues.join(';') : '',
    s.q3_support_change || '',
    Array.isArray(s.q4_improvements) ? s.q4_improvements.join(';') : '',
    s.q5_has_recommendation || '',
    s.q5_company_name || '',
    s.q6_committee || '',
    (s.q7_suggestions || '').replace(/\n/g, ' '),
  ]);

  return [headers.join(','), ...rows.map((r) =>
    r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
  )].join('\n');
}

// 统计概览
function getStats(surveys) {
  const total = Array.isArray(surveys) ? surveys.length : 0;
  if (total === 0) {
    return { total: 0, totalHouseholds: householdWhitelist.length };
  }

  const satisfactionCount = {};
  const viewCount = {};
  const unitCount = {};

  surveys.forEach((s) => {
    satisfactionCount[s.q1_satisfaction] = (satisfactionCount[s.q1_satisfaction] || 0) + 1;
    viewCount[s.q3_support_change] = (viewCount[s.q3_support_change] || 0) + 1;
    const parts = (s.household || '').split('-');
    if (parts.length >= 3) {
      unitCount[parts[1]] = (unitCount[parts[1]] || 0) + 1;
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

module.exports = {
  householdWhitelist,
  loadSurveys,
  saveSurvey,
  isHouseholdSubmitted,
  exportToCSV,
  getStats,
};
