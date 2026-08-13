// GET /api/buildings — 从户号白名单反推楼栋楼层结构，供看板使用
const householdWhitelist = require('./household-data');

// 将 "14-26-0101" 解析为 { building: '26', floor: '01', unit: '01' }
function parseHousehold(id) {
  const parts = id.split('-');
  if (parts.length !== 3) return null;
  return {
    building: parts[1].replace(/^0+/, '') || '0',
    floor: parts[2].slice(0, 2),
    unit: parts[2].slice(2),
  };
}

function buildStructure() {
  const buildings = {};
  for (const id of householdWhitelist) {
    const p = parseHousehold(id);
    if (!p) continue;
    if (!buildings[p.building]) buildings[p.building] = { floors: {}, units: new Set() };
    const b = buildings[p.building];
    b.units.add(p.unit);
    if (!b.floors[p.floor]) b.floors[p.floor] = new Set();
    b.floors[p.floor].add(p.unit);
  }

  return Object.entries(buildings)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, data]) => {
      const floors = Object.entries(data.floors)
        .sort(([a], [b]) => Number(b) - Number(a)) // 楼层从高到低
        .map(([floor, units]) => ({
          floor,
          units: [...units].sort(),
        }));
      return {
        building: num,
        total: householdWhitelist.filter((id) => id.split('-')[1].replace(/^0+/, '') === num).length,
        units: [...data.units].sort(),
        floors,
      };
    });
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

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: '方法不允许' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: true, buildings: buildStructure() }));
};
