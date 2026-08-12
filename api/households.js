const householdWhitelist = require('./household-data');

let surveys = [];

function isHouseholdSubmitted(householdId) {
  return surveys.some((s) => s.household === householdId);
}

function saveSurvey(survey) {
  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    submittedAt: new Date().toISOString(),
    ...survey,
  };
  surveys.push(record);
  return record;
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    total: householdWhitelist.length,
    households: householdWhitelist,
  }));
};
