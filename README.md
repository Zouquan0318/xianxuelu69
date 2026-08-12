# 万科朗拾花语 · 6-5 地块 物业服务小程序

> 面向开发者的项目说明文档。技术栈：React + TypeScript + Vite + Tailwind CSS，支持 Vercel Serverless 部署。

---

## 📁 目录结构

```
community-app/
├── index.html                    # 入口 HTML
├── src/
│   ├── main.tsx                  # React 应用入口（HashRouter）
│   ├── App.tsx                   # 根路由组件
│   ├── App.css                   # 组件样式
│   ├── index.css                 # Tailwind 基础样式 + 全局样式
│   ├── pages/
│   │   ├── Home.tsx              # 首页（小区动态 + 快捷入口）
│   │   ├── Survey.tsx            # 满意度调查问卷（户号选择 + 7题问卷）
│   │   └── Toolbox.tsx           # 工具箱（法律依据/流程/FAQ）
│   ├── components/
│   │   └── TabBar.tsx            # 底部 Tab 导航栏
│   ├── hooks/                    # 自定义 Hooks
│   ├── lib/                      # 工具函数
│   └── types/                    # TypeScript 类型定义
├── api/                          # Vercel Serverless Functions
│   ├── _data.js                  # 共享数据存储（内存 + 白名单加载）
│   ├── households.js             # GET /api/households — 户号白名单
│   ├── survey.js                 # POST /api/survey — 提交问卷
│   ├── surveys.js                # GET /api/surveys — 所有问卷数据
│   ├── stats.js                  # GET /api/stats — 统计概览
│   └── export-csv.js             # GET /api/export-csv — 导出 CSV
├── server/                       # 本地开发后端（Node.js HTTP）
│   ├── index.cjs                 # 本地服务器（端口 3002）
│   └── data/
│       ├── households.json       # 户号白名单（152个户号）
│       ├── surveys.json          # 本地问卷数据存储
│       └── test_survey.json      # API 测试用例
├── dist/                         # 生产构建产物（Vite 输出）
├── vercel.json                   # Vercel 部署路由配置
├── start.bat                     # Windows 一键启动脚本
├── package.json                  # 项目依赖
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── 14栋.xlsx                     # 原始户号 Excel（14幢业主）
├── parse_households.py           # Excel 解析脚本 → 生成白名单
├── test_api.py                   # 后端 API 测试脚本
├── 功能介绍.md                   # 面向业主的功能说明文档
└── README.md                     # 本文档
```

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|---|---|---|
| 前端框架 | React 19 + TypeScript | 函数组件 + Hooks |
| 构建工具 | Vite 7 | 开发服务器 + 生产构建 |
| 样式 | Tailwind CSS 3.4 | 原子化 CSS |
| UI 组件 | shadcn/ui | 预置 40+ 组件 |
| 路由 | React Router 7 | HashRouter（适配静态部署） |
| 图标 | Lucide React | 轻量级图标库 |
| 后端（本地）| Node.js HTTP | 零外部依赖 |
| 后端（云端）| Vercel Serverless Functions | API Routes |

---

## 🚀 本地开发

### 1. 安装依赖

```bash
npm install --ignore-scripts
```

> 注：`--ignore-scripts` 跳过 postinstall，因为 Windows 环境下 npm 的 spawn 有兼容性问题。esbuild 可通过 `npx esbuild` 直接使用。

### 2. 启动后端（数据服务）

```bash
cd server
node index.cjs
```

- 端口：`3002`
- 接口列表见下文「后端 API」

### 3. 启动前端（开发服务器）

```bash
npm run dev -- --port 7100
```

- 访问：`http://localhost:7100`

### 4. 一键启动（Windows）

双击项目根目录的 `start.bat`，同时启动前后端。

---

## 📦 构建与部署

### 构建生产包

```bash
npm run build
```

输出到 `dist/` 目录。

### Vercel 部署

```bash
# 登录（首次需要浏览器认证）
npx vercel login

# 部署到生产环境
npx vercel --prod
```

**已知问题**：`.vercel.app` 域名在国内访问不稳定，建议绑定自定义域名（阿里云/腾讯云域名 + Vercel Domains 配置）。

---

## 🔌 后端 API

### 接口列表

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/households` | 获取户号白名单 |
| `POST` | `/api/survey` | 提交问卷 |
| `GET` | `/api/surveys` | 获取所有问卷数据 |
| `GET` | `/api/stats` | 统计概览 |
| `GET` | `/api/export-csv` | 导出 CSV（带 BOM，Excel 直接打开）|

### POST /api/survey 校验逻辑

```
1. 检查 household 字段是否存在 → 400 "请选择户号"
2. 检查户号是否在白名单中 → 403 "户号不在白名单中"
3. 检查该户号是否已提交 → 409 "该户号已提交过问卷，请勿重复投票"
4. 校验通过 → 201 保存数据
```

### 数据存储

- **本地开发**：`server/data/surveys.json`（JSON 文件持久化）
- **Vercel 云端**：内存存储（`_data.js` 中的变量）
  - ⚠️ 冷启动/重新部署后数据会丢失
  - 💡 测试阶段建议随时访问 `/api/export-csv` 备份数据

---

## 🏠 户号白名单管理

### 当前白名单

- **来源**：`14幢业主.xlsx`
- **解析脚本**：`parse_households.py`
- **生成文件**：`server/data/households.json`
- **格式**：`14-{单元}-{房号}`，如 `14-26-0101`、`14-27-2604`
- **数量**：152 个户号（26单元 52个 + 27单元 100个）

### 添加新楼栋/单元

1. 准备 Excel 文件，确保户号数据在数值列中
2. 修改 `parse_households.py` 中的 `index_to_unit` 映射（列索引 → 单元号）
3. 运行 `python parse_households.py` 重新生成白名单
4. 重新构建 + 部署

---

## 📝 问卷数据结构

```typescript
interface SurveyData {
  household: string           // 户号，如 "14-26-0101"
  q1_satisfaction: string     // 整体满意度
  q2_issues: string[]         // 存在问题（多选）
  q3_support_change: string   // 更换看法（核心字段）
  q4_improvements: string[]   // 希望改善（多选）
  q5_has_recommendation: string  // 是否有推荐公司
  q5_company_name: string     // 推荐公司名称
  q6_committee: string        // 业委会看法
  q7_suggestions: string      // 其他建议
}
```

后端保存时自动附加：
- `id`：唯一标识
- `submittedAt`：ISO 8601 时间戳

---

## 🧪 测试

### API 测试脚本

```bash
python test_api.py
```

覆盖场景：
1. 查询白名单
2. 首次提交（成功）
3. 重复提交（失败，409）
4. 非法户号（失败，403）
5. 统计概览

### 手动测试问卷提交

```bash
# 本地测试
curl -X POST http://localhost:3002/api/survey \
  -H 'Content-Type: application/json' \
  -d @server/data/test_survey.json
```

---

## 🔄 后续扩展建议

| 功能 | 方案 | 工作量 |
|---|---|---|
| 数据持久化（云端）| Vercel KV / Upstash Redis | 中等 |
| 数据可视化看板 | 新增 Dashboard 页面 + 图表库 | 中等 |
| 微信小程序（原生感）| web-view 套壳 / Taro 迁移 | 大 |
| 微信消息通知 | 小程序订阅消息 / 服务号 | 大 |
| 多楼栋支持 | 扩展 households.json + 前端选择器 | 小 |
| 业主身份验证 | 房号+手机号短信验证 | 中等 |

---

## 📄 相关文件

- `功能介绍.md` — 面向业主的说明书
- `vercel.json` — Vercel 路由配置（静态文件 + API Routes）
- `start.bat` — Windows 本地一键启动

---

**项目路径**：`D:\KimiData\kimi\workspace\community-app`
