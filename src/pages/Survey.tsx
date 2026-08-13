import { useState, useEffect, useMemo } from 'react'
import { CheckCircle, ChevronLeft, Send, RotateCcw, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router'

interface SurveyData {
  household: string
  q1_satisfaction: string
  q2_issues: string[]
  q3_support_change: string
  q4_improvements: string[]
  q5_has_recommendation: string
  q5_company_name: string
  q6_committee: string
  q7_participate: string
  q8_suggestions: string
}

const initialData: SurveyData = {
  household: '',
  q1_satisfaction: '',
  q2_issues: [],
  q3_support_change: '',
  q4_improvements: [],
  q5_has_recommendation: '',
  q5_company_name: '',
  q6_committee: '',
  q7_participate: '',
  q8_suggestions: '',
}

const API_BASE = '/api'

const satisfactionOptions = ['非常满意', '满意', '一般', '不满意', '非常不满意']
const supportOptions = [
  '现在启动更换',
  '物业服务满两年后更换（2027.12.31）',
  '物业合同期满后更换（2028.9.30）',
  '不同意更换',
  '无所谓，随大流',
]
const committeeOptions = ['赞同成立业委会', '不赞同成立业委会', '无所谓']
const participateOptions = ['我愿意', '暂时没这个想法']
const issueOptions = [
  '卫生清洁不到位',
  '安保管理松懈',
  '设施维护不及时',
  '收费不透明',
  '服务态度差',
  '停车管理混乱',
  '绿化养护不足',
  '人员配备不足',
  '其他',
]
const improvementOptions = [
  '提升卫生清洁质量',
  '加强安保管理',
  '加快设施维修响应',
  '公开收费标准',
  '改善服务态度',
  '优化停车管理',
  '提升绿化环境',
  '降低物业费用',
]

export default function Survey() {
  const navigate = useNavigate()
  const [data, setData] = useState<SurveyData>(initialData)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 户号白名单
  const [households, setHouseholds] = useState<string[]>([])
  const [loadingHouseholds, setLoadingHouseholds] = useState(true)

  // 选择状态
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')

  // 页面加载时获取户号白名单
  useEffect(() => {
    fetch(`${API_BASE}/households`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.households)) {
          setHouseholds(result.households)
        }
      })
      .catch(() => {
        setError('无法加载户号数据，请确保后端服务已启动')
      })
      .finally(() => setLoadingHouseholds(false))
  }, [])

  // 解析楼栋列表（按数字排序）
  const buildings = useMemo(() => {
    const set = new Set<string>()
    households.forEach((h) => {
      const parts = h.split('-')
      if (parts.length >= 1) set.add(parts[0])
    })
    return Array.from(set).sort((a, b) => Number(a) - Number(b))
  }, [households])

  // 解析当前楼栋下的单元列表（按数字排序）
  const units = useMemo(() => {
    if (!selectedBuilding) return []
    const set = new Set<string>()
    households.forEach((h) => {
      const parts = h.split('-')
      if (parts.length >= 2 && parts[0] === selectedBuilding) {
        set.add(parts[1])
      }
    })
    return Array.from(set).sort((a, b) => Number(a) - Number(b))
  }, [households, selectedBuilding])

  // 解析当前单元下的房号列表（按数字排序）
  const rooms = useMemo(() => {
    if (!selectedBuilding || !selectedUnit) return []
    const prefix = `${selectedBuilding}-${selectedUnit}-`
    return households
      .filter((h) => h.startsWith(prefix))
      .map((h) => h.replace(prefix, ''))
      .sort((a, b) => Number(a) - Number(b))
  }, [households, selectedBuilding, selectedUnit])

  // 当楼栋改变时，清空单元和房号
  useEffect(() => {
    setSelectedUnit('')
    setSelectedRoom('')
    setData((prev) => ({ ...prev, household: '' }))
  }, [selectedBuilding])

  // 当单元改变时，清空房号
  useEffect(() => {
    setSelectedRoom('')
    setData((prev) => ({ ...prev, household: '' }))
  }, [selectedUnit])

  // 当房号改变时，更新完整户号
  useEffect(() => {
    if (selectedBuilding && selectedUnit && selectedRoom) {
      const fullId = `${selectedBuilding}-${selectedUnit}-${selectedRoom}`
      setData((prev) => ({ ...prev, household: fullId }))
    }
  }, [selectedBuilding, selectedUnit, selectedRoom])

  const updateField = <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const toggleMulti = (key: 'q2_issues' | 'q4_improvements', value: string) => {
    setData((prev) => {
      const arr = prev[key]
      const exists = arr.includes(value)
      return {
        ...prev,
        [key]: exists ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
    setError('')
  }

  const handleSubmit = async () => {
    if (!data.household || !data.q1_satisfaction || !data.q3_support_change) {
      setError('请完成户号选择、第1题和第3题')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || '提交失败')
      }

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (confirm('确定要清空所有答案吗？')) {
      setData(initialData)
      setSelectedBuilding('')
      setSelectedUnit('')
      setSelectedRoom('')
      setError('')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center w-full max-w-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">提交成功</h2>
          <p className="text-sm text-gray-500 mt-2">
            户号 <span className="font-medium text-gray-700">{data.household}</span> 的问卷已记录
          </p>
          <p className="text-sm text-gray-500 mt-1">感谢您的参与，您的意见对我们非常重要！</p>
          <button
            onClick={() => {
              setData(initialData)
              setSelectedBuilding('')
              setSelectedUnit('')
              setSelectedRoom('')
              setSubmitted(false)
              navigate('/')
            }}
            className="mt-6 w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium active:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 -ml-1">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold">物业满意度调查</h1>
          <p className="text-xs text-blue-100">万科朗拾花语 · 6-5 地块</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Household Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            <span className="text-red-500">*</span> 请选择您的户号
          </p>

          {loadingHouseholds ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 size={16} className="animate-spin" />
              正在加载户号数据...
            </div>
          ) : (
            <div className="space-y-3">
              {/* 楼栋选择 */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">楼栋</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">请选择楼栋</option>
                  {buildings.map((b) => (
                    <option key={b} value={b}>{b}栋</option>
                  ))}
                </select>
              </div>

              {/* 单元选择 */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">单元</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  disabled={!selectedBuilding}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{selectedBuilding ? '请选择单元' : '请先选择楼栋'}</option>
                  {units.map((u) => (
                    <option key={u} value={u}>{u}单元</option>
                  ))}
                </select>
              </div>

              {/* 房号选择 */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">房号</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  disabled={!selectedUnit}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{selectedUnit ? '请选择房号' : '请先选择单元'}</option>
                  {rooms.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* 完整户号显示 */}
              {data.household && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-700">
                  已选择户号：<span className="font-bold">{data.household}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Q1 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            <span className="text-red-500">*</span> 1. 您对当前物业服务的整体满意度？
          </p>
          <div className="grid grid-cols-1 gap-2">
            {satisfactionOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.q1_satisfaction === opt
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="q1"
                  className="w-4 h-4 text-blue-600"
                  checked={data.q1_satisfaction === opt}
                  onChange={() => updateField('q1_satisfaction', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q2 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            2. 您认为当前物业服务存在的主要问题？（可多选）
          </p>
          <div className="grid grid-cols-1 gap-2">
            {issueOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.q2_issues.includes(opt)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={data.q2_issues.includes(opt)}
                  onChange={() => toggleMulti('q2_issues', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q3 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            <span className="text-red-500">*</span> 3. 你对更换物业公司的看法是？
          </p>
          <div className="grid grid-cols-1 gap-2">
            {supportOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.q3_support_change === opt
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="q3"
                  className="w-4 h-4 text-blue-600"
                  checked={data.q3_support_change === opt}
                  onChange={() => updateField('q3_support_change', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q4 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            4. 您认为更换物业后，最希望改善的方面？（可多选）
          </p>
          <div className="grid grid-cols-1 gap-2">
            {improvementOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.q4_improvements.includes(opt)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={data.q4_improvements.includes(opt)}
                  onChange={() => toggleMulti('q4_improvements', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q5 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            5. 您是否有推荐的物业公司？
          </p>
          <div className="flex gap-3 mb-3">
            {['是', '否'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  data.q5_has_recommendation === opt
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="q5"
                  className="w-4 h-4 text-blue-600"
                  checked={data.q5_has_recommendation === opt}
                  onChange={() => updateField('q5_has_recommendation', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
          {data.q5_has_recommendation === '是' && (
            <input
              type="text"
              placeholder="请输入物业公司名称"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={data.q5_company_name}
              onChange={(e) => updateField('q5_company_name', e.target.value)}
            />
          )}
        </div>

        {/* Q6 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            6. 您对小区业主委员会成立的看法？
          </p>
          <div className="grid grid-cols-1 gap-2">
            {committeeOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.q6_committee === opt
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="q6"
                  className="w-4 h-4 text-blue-600"
                  checked={data.q6_committee === opt}
                  onChange={() => updateField('q6_committee', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q7 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            7. 是否愿意参与组织更换物业？
          </p>
          <div className="grid grid-cols-1 gap-2">
            {participateOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.q7_participate === opt
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="q7"
                  className="w-4 h-4 text-blue-600"
                  checked={data.q7_participate === opt}
                  onChange={() => updateField('q7_participate', opt)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q8 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">
            8. 其他意见或建议
          </p>
          <textarea
            placeholder="请输入您的其他意见或建议..."
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            value={data.q8_suggestions}
            onChange={(e) => updateField('q8_suggestions', e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 pb-6">
          <button
            onClick={handleReset}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 active:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            重置
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium active:bg-blue-700 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send size={16} />
                提交问卷
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
