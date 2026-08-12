// 共享数据存储模块（内存中）
// 注意：Serverless Function 冷启动时数据会重置

// 加载户号白名单（通过 require 确保 Vercel 打包时包含该文件）
const householdWhitelist = require('./household-data');

// 内存中的问卷数据
let surveys = [];

// 检查户号是否已提交
function isHouseholdSubmitted(householdId) {
  return surveys.some((s) => s.household === householdId);
}

// 保存问卷
function saveSurvey(survey) {
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    submittedAt: new Date().toISOString(),
    ...survey,
  };
  surveys.push(record);
  return record;
}

// 导出 CSV
function exportToCSV() {
  if (surveys.length === 0) return '';

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

// 统计
function getStats() {
  const total = surveys.length;
  if (total === 0) return { total: 0, totalHouseholds: householdWhitelist.length };

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
  surveys,
  isHouseholdSubmitted,
  saveSurvey,
  exportToCSV,
  getStats,
};
