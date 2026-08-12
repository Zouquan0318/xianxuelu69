import pandas as pd
import json

df = pd.read_excel(r'14栋.xlsx')
cols = list(df.columns)

print("=== 列顺序分析 ===")
for i, col in enumerate(cols):
    vals = [v for v in df[col] if pd.notna(v)]
    nums = []
    for v in vals:
        try:
            n = int(float(v))
            if n >= 100:
                nums.append(n)
        except:
            pass
    range_str = f"{min(nums)}~{max(nums)} ({len(nums)}个)" if nums else "无数字"
    print(f"  [{i:2d}] '{col}' -> {range_str}")

# 根据列索引位置映射单元号
# Excel结构分析：
# [0] Unnamed: 0 = 楼层编号（跳过）
# [1~4] 27单元区域1（27号, Unnamed:2, Unnamed:3, Unnamed:4）
# [5~7] 26单元区域1（26号, Unnamed:6, Unnamed:7）
# [8] Unnamed: 8 = 楼层编号（跳过）
# [9~12] 27单元区域2（27号靠河, Unnamed:10, Unnamed:11, Unnamed:12）
# [13~14] 26单元区域2（26号靠高架, Unnamed:14）
# [15~19] 文字备注列（跳过）
index_to_unit = {}
for i in range(1, 5):   # 列1-4
    index_to_unit[i] = '27'
for i in range(5, 8):   # 列5-7
    index_to_unit[i] = '26'
for i in range(9, 13):  # 列9-12
    index_to_unit[i] = '27'
for i in range(13, 15): # 列13-14
    index_to_unit[i] = '26'

# 提取户号
households_26 = set()
households_27 = set()

for i, col in enumerate(cols):
    unit = index_to_unit.get(i)
    if not unit:
        continue
    
    for val in df[col]:
        if pd.isna(val):
            continue
        try:
            n = int(float(val))
            # 过滤：户号至少是3位数（101+），排除楼层编号（1-26）
            if n >= 100:
                if unit == '26':
                    households_26.add(n)
                else:
                    households_27.add(n)
        except (ValueError, TypeError):
            continue

# 格式化为完整户号
households = []
for n in sorted(households_26):
    households.append(f"14-26-{n:04d}")
for n in sorted(households_27):
    households.append(f"14-27-{n:04d}")
households.sort()

print(f"\n=== 提取结果 ===")
print(f"26单元户号: {len(households_26)} 个")
print(f"27单元户号: {len(households_27)} 个")
print(f"总计: {len(households)} 个")
print()
print("=== 26单元户号 ===")
for h in households:
    if '14-26-' in h:
        print(h)
print()
print("=== 27单元户号 ===")
for h in households:
    if '14-27-' in h:
        print(h)

# 保存为 JSON 白名单
with open(r'server/data/households.json', 'w', encoding='utf-8') as f:
    json.dump(households, f, ensure_ascii=False, indent=2)

print(f"\n白名单已保存: server/data/households.json")
