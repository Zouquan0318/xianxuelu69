import pandas as pd
import json

df = pd.read_excel(r'14栋.xlsx')
print("=== Excel 原始数据 ===")
print(df.to_string())
print()
print("=== 列名 ===")
print(list(df.columns))
print()
print("=== 数据类型 ===")
print(df.dtypes)
