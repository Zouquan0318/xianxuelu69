import { useNavigate } from 'react-router'
import { ClipboardList, Wrench, Shield, MessageSquare, Users, FileText } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <div className="bg-blue-600 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">万科朗拾花语 · 6-5 地块</h1>
        <p className="text-blue-100 text-sm mt-1">共建美好家园，从了解您的需求开始</p>
        <p className="text-blue-200 text-[10px] mt-1 opacity-80">本小程序仅限万科朗拾花语 6-5 地块业主使用</p>
        
        <div className="mt-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">当前关注：物业满意度调查</p>
              <p className="text-xs text-blue-100">诚邀各位业主参与，您的意见很重要</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">快捷入口</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/survey')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <ClipboardList size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">满意度调查</p>
              <p className="text-xs text-gray-400">参与问卷</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/toolbox')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
              <Wrench size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">工具箱</p>
              <p className="text-xs text-gray-400">换物业指南</p>
            </div>
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">小区动态</h2>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">物业满意度调查进行中</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                为全面了解业主对当前物业服务的真实评价，现开展满意度调查。您的反馈将作为小区物业管理改进的重要参考依据。
              </p>
              <button
                onClick={() => navigate('/survey')}
                className="mt-2 text-xs text-blue-600 font-medium"
              >
                立即参与 →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 shrink-0 mt-0.5">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">关于更换物业的说明</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                更换物业需要遵循法定程序，包括业主大会表决、业主委员会组织等流程。详细规则可在工具箱中查看。
              </p>
              <button
                onClick={() => navigate('/toolbox')}
                className="mt-2 text-xs text-blue-600 font-medium"
              >
                查看流程 →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800">业主权益须知</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                根据《物业管理条例》和《民法典》相关规定，业主享有选聘和解聘物业服务企业的权利。重大事项需由业主共同决定。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-6 pb-8 text-center">
        <p className="text-[10px] text-gray-400">本小程序仅限万科朗拾花语 6-5 地块业主使用</p>
      </div>
    </div>
  )
}
