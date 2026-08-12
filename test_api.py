import urllib.request
import urllib.error
import json

BASE = 'http://localhost:3002'

def req(method, path, data=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    body = json.dumps(data).encode('utf-8') if data else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

print('=== 1. 查询白名单 ===')
status, result = req('GET', '/api/households')
print(f'状态: {status}, 户号总数: {result.get("total", 0)}')
print('前5个户号:', result.get('households', [])[:5])

print()
print('=== 2. 首次提交(14-26-0101) ===')
survey_data = {
    "household": "14-26-0101",
    "q1_satisfaction": "不满意",
    "q2_issues": ["卫生清洁不到位"],
    "q3_support_change": "现在就启动更换",
    "q4_improvements": ["降低物业费用"],
    "q5_has_recommendation": "否",
    "q5_company_name": "",
    "q6_committee": "希望尽快成立",
    "q7_suggestions": "测试提交"
}
status, result = req('POST', '/api/survey', survey_data)
print(f'状态: {status}, 结果: {result}')

print()
print('=== 3. 重复提交测试(应失败) ===')
status, result = req('POST', '/api/survey', survey_data)
print(f'状态: {status}, 结果: {result}')

print()
print('=== 4. 非法户号测试(应失败) ===')
status, result = req('POST', '/api/survey', {**survey_data, "household": "99-99-9999"})
print(f'状态: {status}, 结果: {result}')

print()
print('=== 5. 统计概览 ===')
status, result = req('GET', '/api/stats')
print(f'状态: {status}')
print(json.dumps(result, indent=2, ensure_ascii=False))
