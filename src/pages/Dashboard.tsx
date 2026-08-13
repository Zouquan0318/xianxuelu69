import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const API_BASE = '/api'

// 与原 Python 看板保持一致的状态映射
const SC_MAP: Record<string, number> = {
  现在启动更换: 1,
  '物业服务满两年后更换（2027.12.31）': 2,
  '物业合同期满后更换（2028.9.30）': 3,
  '无所谓，随大流': 4,
  '': 0,
}
const SC_LABELS: Record<number, string> = {
  1: '现在启动更换',
  2: '满两年后更换',
  3: '合同期满更换',
  4: '无所谓/其他',
}
const SC_COLORS: Record<number, string> = {
  1: '#e74c3c',
  2: '#9b59b6',
  3: '#bdc3c7',
  4: '#3498db',
}

interface Survey {
  household: string
  q1_satisfaction: string
  q2_issues: string[]
  q3_support_change: string
  q4_improvements: string[]
  q5_has_recommendation: string
  q5_company_name: string
  q6_committee: string
  q7_suggestions: string
}

interface FloorInfo {
  floor: string
  units: string[]
}

interface BuildingInfo {
  building: string
  total: number
  units: string[]
  floors: FloorInfo[]
}

interface BuildingsResponse {
  success: boolean
  buildings: BuildingInfo[]
}

function useDashboardData() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [buildings, setBuildings] = useState<BuildingInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/surveys`),
        fetch(`${API_BASE}/households?format=buildings`),
      ])
      if (!sRes.ok || !bRes.ok) throw new Error('接口请求失败')
      const sData: Survey[] = await sRes.json()
      const bData: BuildingsResponse = await bRes.json()
      setSurveys(sData)
      setBuildings(bData.buildings || [])
      setUpdatedAt(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { surveys, buildings, loading, error, updatedAt, reload: load }
}

export default function Dashboard() {
  const { surveys, buildings, loading, error, updatedAt, reload } = useDashboardData()

  const stats = useMemo(() => {
    const totalHouses = buildings.reduce((sum, b) => sum + b.total, 0)
    const totalSurveyed = surveys.length
    const responseRate = totalHouses > 0 ? ((totalSurveyed / totalHouses) * 100).toFixed(1) : '0.0'

    const supportCount: Record<string, number> = {}
    const committeeCount: Record<string, number> = {}
    const issueCount: Record<string, number> = {}
    const recCount: Record<string, number> = {}

    const surveyMap = new Map<string, Survey>()
    for (const s of surveys) {
      surveyMap.set(s.household, s)
      supportCount[s.q3_support_change] = (supportCount[s.q3_support_change] || 0) + 1
      committeeCount[s.q6_committee] = (committeeCount[s.q6_committee] || 0) + 1
      for (const i of s.q2_issues || []) issueCount[i] = (issueCount[i] || 0) + 1
      if (s.q5_has_recommendation === '是' && s.q5_company_name) {
        recCount[s.q5_company_name] = (recCount[s.q5_company_name] || 0) + 1
      }
    }

    const supportNow = supportCount['现在启动更换'] || 0
    const supportNowPct = totalSurveyed > 0 ? ((supportNow / totalSurveyed) * 100).toFixed(1) : '0.0'
    const committeeWant = committeeCount['希望尽快成立'] || 0
    const committeePct = totalSurveyed > 0 ? ((committeeWant / totalSurveyed) * 100).toFixed(1) : '0.0'

    const issuesTop = Object.entries(issueCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const recsTop = Object.entries(recCount).sort((a, b) => b[1] - a[1]).slice(0, 8)

    return {
      totalHouses,
      totalSurveyed,
      responseRate,
      supportNow,
      supportNowPct,
      committeeWant,
      committeePct,
      supportCount,
      issuesTop,
      recsTop,
      surveyMap,
    }
  }, [surveys, buildings])

  if (loading && !updatedAt) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        正在加载看板数据...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-500">
        <p>数据加载失败：{error}</p>
        <button
          onClick={reload}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          <RefreshCw size={14} /> 重试
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-4">
      {/* 头部 */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">14栋 · 物业更换民意看板</h1>
          <p className="mt-1 text-xs text-gray-400">
            数据更新于 {updatedAt ? updatedAt.toLocaleString('zh-CN') : '-'}
            &nbsp;|&nbsp;{stats.totalSurveyed} 份有效问卷 &nbsp;|&nbsp;回收率 {stats.responseRate}%
          </p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* KPI 卡片 */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="text-xs text-gray-400">总户数</div>
          <div className="mt-1 text-3xl font-medium tabular-nums text-gray-900">{stats.totalHouses}</div>
          <div className="mt-1 text-xs text-gray-500">
            {buildings.map((b) => `${b.building}号楼`).join(' · ')}
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="text-xs text-gray-400">问卷回收</div>
          <div className="mt-1 text-3xl font-medium tabular-nums text-gray-900">{stats.totalSurveyed}</div>
          <div className="mt-1 text-xs text-gray-500">回收率 {stats.responseRate}%</div>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="text-xs text-gray-400">支持"现在启动更换"</div>
          <div className="mt-1 text-3xl font-medium tabular-nums text-red-600">
            {stats.supportNow}
            <span className="ml-1 text-base">户</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">占比 {stats.supportNowPct}%</div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="text-xs text-gray-400">希望尽快成立业委会</div>
          <div className="mt-1 text-3xl font-medium tabular-nums text-green-600">
            {stats.committeeWant}
            <span className="ml-1 text-base">户</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">占比 {stats.committeePct}%</div>
        </div>
      </div>

      {/* 核心区域：态度分布 + 楼栋地图 */}
      <div className="mb-5 grid gap-4 md:grid-cols-[340px_1fr]">
        {/* 态度分布 */}
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-900">物业更换态度分布</div>
          <DonutChart
            data={[
              { label: '现在启动更换', value: stats.supportCount['现在启动更换'] || 0, color: '#e74c3c' },
              { label: '满两年后更换', value: stats.supportCount['物业服务满两年后更换（2027.12.31）'] || 0, color: '#9b59b6' },
              { label: '无所谓/随大流', value: stats.supportCount['无所谓，随大流'] || 0, color: '#3498db' },
              { label: '合同期满更换', value: stats.supportCount['物业合同期满后更换（2028.9.30）'] || 0, color: '#bdc3c7' },
            ]}
            total={stats.totalSurveyed}
          />
        </div>

        {/* 楼栋地图 */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="px-4 pt-4">
            <div className="text-sm font-medium text-gray-900">楼栋问卷参与地图</div>
          </div>
          <div className="overflow-x-auto p-4">
            <div className="flex min-w-max gap-4">
              {buildings.map((b) => (
                <BuildingMap key={b.building} building={b} surveyMap={stats.surveyMap} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-gray-50 px-4 pb-4 pt-2">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="inline-block h-3 w-3 rounded" style={{ background: SC_COLORS[k] }} />
                {SC_LABELS[k]}
              </div>
            ))}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="inline-block h-3 w-3 rounded border border-dashed border-gray-300 bg-gray-100" />
              未参与问卷
            </div>
          </div>
        </div>
      </div>

      {/* 次要区域：问题TOP5 + 推荐物业 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-900">业主反映问题 TOP5</div>
          <BarChart data={stats.issuesTop} />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-900">推荐物业公司</div>
          {stats.recsTop.length === 0 ? (
            <p className="text-sm text-gray-400">暂无推荐</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.recsTop.map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <span className="text-sm text-gray-700">{name}</span>
                  <span className="text-xs tabular-nums text-gray-400">{count} 次推荐</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- 子组件 ---------- */

function DonutChart({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[]
  total: number
}) {
  const cx = 140
  const cy = 100
  const r = 70
  const ri = 44
  let startAngle = -Math.PI / 2

  const paths: { d: string; color: string }[] = []
  const legend: { label: string; value: number; pct: string; color: string }[] = []

  for (const item of data) {
    if (item.value <= 0 || total <= 0) continue
    const frac = item.value / total
    const angle = frac * 2 * Math.PI
    const endAngle = startAngle + angle
    const x1 = cx + Math.cos(startAngle) * r
    const y1 = cy + Math.sin(startAngle) * r
    const x2 = cx + Math.cos(endAngle) * r
    const y2 = cy + Math.sin(endAngle) * r
    const x3 = cx + Math.cos(endAngle) * ri
    const y3 = cy + Math.sin(endAngle) * ri
    const x4 = cx + Math.cos(startAngle) * ri
    const y4 = cy + Math.sin(startAngle) * ri
    const large = angle > Math.PI ? 1 : 0
    paths.push({
      d: `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${ri},${ri} 0 ${large},0 ${x4.toFixed(1)},${y4.toFixed(1)} Z`,
      color: item.color,
    })
    legend.push({ label: item.label, value: item.value, pct: (frac * 100).toFixed(1), color: item.color })
    startAngle = endAngle
  }

  return (
    <div className="text-center">
      <svg viewBox="0 0 280 200" className="mx-auto h-auto w-full max-w-[280px]">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth={2} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight={500} fill="#1a1a1a">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#888">
          份有效问卷
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: l.color }} />
            {l.label} {l.value}户 ({l.pct}%)
          </div>
        ))}
      </div>
    </div>
  )
}

function BuildingMap({
  building,
  surveyMap,
}: {
  building: BuildingInfo
  surveyMap: Map<string, Survey>
}) {
  const surveyedCount = building.floors.reduce((sum, f) => {
    return (
      sum +
      f.units.filter((u) => {
        const id = `14-${building.building.padStart(2, '0')}-${f.floor}${u}`
        return surveyMap.has(id)
      }).length
    )
  }, 0)
  const rate = building.total > 0 ? ((surveyedCount / building.total) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-w-[160px] shrink-0 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{building.building}号楼</span>
        <span className="text-xs tabular-nums text-gray-400">
          {surveyedCount}/{building.total} ({rate}%)
        </span>
      </div>
      {building.floors.map((f) => (
        <div key={f.floor} className="mb-1 flex items-center gap-1.5">
          <span className="w-5 text-right text-[10px] tabular-nums text-gray-400">{f.floor}</span>
          <div className="flex gap-1">
            {building.units.map((u) => {
              const exists = f.units.includes(u)
              if (!exists) {
                return <div key={u} className="h-[22px] w-[22px] rounded border border-gray-200 bg-gray-100" title="无此户型" />
              }
              const id = `14-${building.building.padStart(2, '0')}-${f.floor}${u}`
              const s = surveyMap.get(id)
              if (!s) {
                return (
                  <div
                    key={u}
                    className="h-[22px] w-[22px] rounded border border-dashed border-gray-300 bg-gray-100"
                    title={`${f.floor}${u} 未参与`}
                  />
                )
              }
              const code = SC_MAP[s.q3_support_change] ?? 4
              return (
                <div
                  key={u}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded text-[9px] text-white"
                  style={{ background: SC_COLORS[code] }}
                  title={`${f.floor}${u} ${SC_LABELS[code]}`}
                >
                  {u}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function BarChart({ data }: { data: [string, number][] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400">暂无数据</p>
  const max = data[0][1]
  const colors = ['#e74c3c', '#e74c3c', '#9b59b6', '#3498db', '#95a5a6']
  return (
    <div className="w-full">
      {data.map(([label, val], i) => (
        <div key={label} className="mb-2 flex items-center gap-2">
          <span className="w-[110px] shrink-0 truncate text-right text-xs text-gray-500" title={label}>
            {label}
          </span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-gray-100">
            <div
              className="flex h-full items-center justify-end rounded pr-1.5"
              style={{ width: `${((val / max) * 100).toFixed(1)}%`, background: colors[i] || '#95a5a6' }}
            >
              <span className="text-[11px] font-medium tabular-nums text-white">{val}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
