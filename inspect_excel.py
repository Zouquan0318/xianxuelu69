import pandas as pd
import json

df = pd.read_excel(r'14栋.xlsx')

print("=== 各列数据概览 ===")
for col in df.columns:
    print(f"\n列名: '{col}'")
    vals = [v for v in df[col] if pd.notna(v)]
    # 只显示前10个值
    print(f"  样本值: {vals[:10]}")
    # 判断数据类型
    nums = []
    for v in vals:
        try:
            n = int(float(v))
            nums.append(n)
        except:
            pass
    if nums:
        print(f"  数字范围: {min(nums)} ~ {max(nums)} (共{len(nums)}个)")
