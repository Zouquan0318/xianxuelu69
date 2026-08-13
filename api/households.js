const householdWhitelist = require('./household-data');

// 从 "14-26-0101" 解析出楼栋、楼层、单元
function parseHousehold(id) {
  const parts = id.split('-');
  if (parts.length !== 3) return null;
  return {
    building: parts[1].replace(/^0+/, '') || '0',
    floor: parts[2].slice(0, 2),
    unit: parts[2].slice(2),
  };
}

// 反推楼栋楼层结构
function buildStructure() {
  const buildings = {};
  for (const id of householdWhitelist) {
    const p = parseHousehold(id);
    if (!p) continue;
    if (!buildings[p.building]) buildings[p.building] = { floors: {}, units: new Set(), total: 0 };
    const b = buildings[p.building];
    b.units.add(p.unit);
    b.total += 1;
    if (!b.floors[p.floor]) b.floors[p.floor] = new Set();
    b.floors[p.floor].add(p.unit);
  }

  return Object.entries(buildings)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, data]) => ({
      building: num,
      total: data.total,
      units: [...data.units].sort(),
      floors: Object.entries(data.floors)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([floor, units]) => ({ floor, units: [...units].sort() })),
    }));
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

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // GET /api/households/buildings — 返回楼栋楼层结构（供看板使用）
  if (pathname === '/api/households/buildings' || url.searchParams.get('format') === 'buildings') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, buildings: buildStructure() }));
    return;
  }

  // GET /api/households — 返回户号白名单
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    total: householdWhitelist.length,
    households: householdWhitelist,
  }));
};
