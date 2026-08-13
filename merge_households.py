import csv
import json
from pathlib import Path

# 读取现有 14 栋白名单
existing = json.loads(Path('server/data/households.json').read_text(encoding='utf-8'))

# 读取新楼栋 CSV（兼容 BOM）
new_ids = []
with open('户号信息.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        building = row['楼栋'].replace('栋', '').strip()
        unit = row['单元'].strip()
        room = row['房号'].strip().zfill(4)
        new_ids.append(f"{building}-{unit}-{room}")

# 合并并去重
all_ids = sorted(set(existing + new_ids))

# 保存 JSON
Path('server/data/households.json').write_text(
    json.dumps(all_ids, ensure_ascii=False, indent=2),
    encoding='utf-8'
)

# 生成 api/household-data.js
js_content = "module.exports = [\n" + ",\n".join(f'  "{h}"' for h in all_ids) + "\n];\n"
Path('api/household-data.js').write_text(js_content, encoding='utf-8')

print(f"原有: {len(existing)} 户")
print(f"新增: {len(new_ids)} 户")
print(f"合并去重后: {len(all_ids)} 户")
