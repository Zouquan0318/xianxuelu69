// 面积对照表：{ "楼栋-单元-房号后缀": 面积 }
// 数据来源：面积信息.csv（第 2-23 行有效数据）
const areaData: Record<string, number> = {
  "14-26-01": 98.3,
  "14-26-02": 92.4,
  "14-27-01": 98.3,
  "14-27-02": 98.3,
  "14-27-03": 93.2,
  "14-27-04": 97.5,
  "15-18-01": 131.51,
  "15-18-02": 138.46,
  "16-16-01": 98.3,
  "16-16-02": 92.4,
  "16-17-01": 92.4,
  "16-17-02": 97.5,
  "17-10-01": 131.51,
  "17-10-02": 138.46,
  "18-11-01": 98.3,
  "18-11-02": 92.4,
  "18-12-01": 92.4,
  "18-12-02": 97.5,
  "20-1-01": 86,
  "20-1-02": 95,
  "20-2-01": 95,
  "20-2-02": 86,
};

// 各楼栋结构：{ 楼栋: { 单元: [房号后缀列表], 楼层数 } }
const buildingStructure: Record<string, { units: Record<string, string[]>; floors: number }> = {
  "14": {
    units: {
      "26": ["01", "02"],
      "27": ["01", "02", "03", "04"],
    },
    floors: 26,
  },
  "15": {
    units: {
      "18": ["01", "02"],
    },
    floors: 17,
  },
  "16": {
    units: {
      "16": ["01", "02"],
      "17": ["01", "02"],
    },
    floors: 18,
  },
  "17": {
    units: {
      "10": ["01", "02"],
    },
    floors: 17,
  },
  "18": {
    units: {
      "11": ["01", "02"],
      "12": ["01", "02"],
    },
    floors: 18,
  },
  "20": {
    units: {
      "1": ["01", "02"],
      "2": ["01", "02"],
    },
    floors: 17,
  },
};

// 计算小区理论总面积
export function calculateTotalArea(): number {
  let total = 0;
  for (const [building, info] of Object.entries(buildingStructure)) {
    for (const [unit, suffixes] of Object.entries(info.units)) {
      for (const suffix of suffixes) {
        const key = `${building}-${unit}-${suffix}`;
        const area = areaData[key] || 0;
        total += area * info.floors;
      }
    }
  }
  return total;
}

export default areaData;
