import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeft, ChevronDown, ChevronRight, Scale, ListOrdered, AlertTriangle, HelpCircle, BookOpen } from 'lucide-react'

interface AccordionItemProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionItem({ title, icon, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-800">{title}</span>
        </div>
        {open ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-50 pt-3">{children}</div>}
    </div>
  )
}

const steps = [
  {
    num: '01',
    title: '成立业主委员会或者由居委会组织',
    desc: '由业主大会选举产生，代表全体业主行使权利。需满足：专有部分面积占比2/3以上且人数占比2/3以上的业主参与表决。',
    tips: ['业委会由街道办/乡镇政府组织，业委会成员一般为 5-11 人单数，任期不超过 5 年', '居委会是朗拾花语居委会筹备组'],
  },
  {
    num: '02',
    title: '召开业主大会',
    desc: '由业主委员会召集，就是否解聘现有物业进行表决。',
    tips: ['提前15日通知全体业主', '需经参与表决专有部分面积过半数的业主且参与表决人数过半数的业主同意', '表决结果应当公示'],
  },
  {
    num: '03',
    title: '提前通知现有物业',
    desc: '作出解聘决定后，应提前60日书面通知物业服务人，合同另有约定的除外。',
    tips: ['通知书应载明解聘理由', '保存送达凭证', '注意合同约定的解除条件'],
  },
  {
    num: '04',
    title: '选聘新物业公司',
    desc: '通过公开招投标或协议方式选聘新的物业服务企业。',
    tips: ['住宅物业应当通过招投标方式选聘', '投标人少于3个或住宅规模较小的，可经批准采用协议方式', '应当对候选物业公司进行考察'],
  },
  {
    num: '05',
    title: '签订新物业服务合同',
    desc: '由业主委员会代表全体业主与新物业公司签订物业服务合同。',
    tips: ['合同应明确服务内容、标准、费用等', '报相关部门备案', '向全体业主公示合同内容'],
  },
  {
    num: '06',
    title: '交接与进驻',
    desc: '原物业退出，新物业进驻，完成资料、设施设备、场地等交接工作。',
    tips: ['交接过程应当有业委会监督', '原物业应移交相关资料和财物', '交接期间应保证物业服务不中断'],
  },
]

const faqs = [
  {
    q: '一般物业更换流程需要多久？',
    a: '整个更换流程通常需要 3 到 8 个月不等，主要取决于业主委员会成立速度、业主大会组织效率、招投标程序以及新旧物业交接的顺利程度。其中，成立业委会可能需要 1-3 个月，召开业主大会和表决约 1-2 个月，提前通知现有物业需 60 日，选聘新物业的招投标程序约 1-2 个月，最后交接进驻约 1 个月。',
  },
  {
    q: '业主个人可以要求更换物业吗？',
    a: '单个业主不能直接更换物业。更换物业属于业主共同决定事项，必须依法召开业主大会并经法定比例业主同意。',
  },
  {
    q: '更换物业需要多少业主同意？',
    a: '根据《民法典》第278条，解聘物业服务企业属于"业主共同决定事项"，应当由专有部分面积占比三分之二以上的业主且人数占比三分之二以上的业主参与表决，并经参与表决专有部分面积过半数的业主且参与表决人数过半数的业主同意。',
  },
  {
    q: '物业公司不配合交接怎么办？',
    a: '原物业服务人拒不退出或不移交资料的，业主委员会可以向人民法院提起诉讼，或请求街道办事处、乡镇人民政府协调解决。',
  },
  {
    q: '没有业主委员会能换物业吗？',
    a: '没有业委会的情况下，可以由街道办事处、乡镇人民政府组织业主成立业主大会并选举业委会，或者由居民委员会临时代行业委会职责来组织相关工作。',
  },
  {
    q: '更换物业期间服务会中断吗？',
    a: '法律规定物业服务合同终止后、新物业接管前，原物业应当继续处理物业服务事项，不得中断服务。业主也应按约定支付该期间的物业费。',
  },
  {
    q: '我的物业券怎么办？',
    a: '<b>新物业公司在招标时要提供物业券的解决方案</b>，物业券属合同补充约定，仅约束原物业公司。原物业未履约即退场构成违约，应赔偿剩余物业费；新物业无义务承接。建议：固定物业券及缴费证据，先协商/投诉，无果则起诉原物业追偿。若原物业预收费用已移交新物业，可主张新物业在承接范围内继续抵扣。以上回答参考《民法典》第577条（违约责任），《民法典》第949条（退场交接义务）和最高法《关于审理物业服务纠纷案件适用法律若干问题的解释》第3条',
  },
]

export default function Toolbox() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1 -ml-1">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold">工具箱</h1>
          <p className="text-xs text-emerald-100">万科朗拾花语 · 6-5 地块</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Important Notice */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-bold text-red-600 text-center">
            成立业委会不是更换物业的必要条件！
          </p>
        </div>

        {/* Legal Basis */}
        <AccordionItem
          title="法律依据"
          icon={<Scale size={16} />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">《中华人民共和国民法典》</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                第二百七十八条：业主共同决定事项及表决规则。选聘和解聘物业服务企业或者其他管理人，应当由业主共同决定。
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">《物业管理条例》</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                第十一条、第十二条：业主大会的职责和表决程序。业主大会会议可以采用集体讨论或书面征求意见的形式。
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">《物业服务收费管理办法》</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                规范物业服务收费行为，保障业主和物业服务企业的合法权益。
              </p>
            </div>
          </div>
        </AccordionItem>

        {/* Process Steps */}
        <AccordionItem
          title="更换流程（仅作参考）"
          icon={<ListOrdered size={16} />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="border border-gray-100 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                  className="w-full flex items-center gap-3 p-3 text-left bg-gray-50/50"
                >
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {step.num}
                  </span>
                  <span className="text-sm font-medium text-gray-800 flex-1">{step.title}</span>
                  {activeStep === idx ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>
                {activeStep === idx && (
                  <div className="px-3 pb-3 pt-2">
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{step.desc}</p>
                    <div className="space-y-1.5">
                      {step.tips.map((tip, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                          <p className="text-xs text-gray-500">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Notes */}
        <AccordionItem
          title="注意事项"
          icon={<AlertTriangle size={16} />}
        >
          <div className="space-y-2.5">
            {[
              '更换物业应当依法进行，避免程序瑕疵导致决定无效',
              '保留好所有会议记录、表决票、通知送达凭证等资料',
              '注意查看现有物业服务合同的期限和解除条款',
              '新物业选聘过程应公开透明，接受业主监督',
              '交接过程中注意公共设施设备的状态确认和记录',
              '物业费结算应清楚明白，避免产生经济纠纷',
              '业主大会决议应及时向街道办事处备案',
            ].map((note, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 bg-orange-50 text-orange-500 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* FAQ */}
        <AccordionItem
          title="常见问题（例如我的物业券怎么办）"
          icon={<HelpCircle size={16} />}
        >
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-800 mb-1 flex items-start gap-1.5">
                  <span className="text-blue-500 shrink-0">Q:</span>
                  {faq.q}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed flex items-start gap-1.5">
                  <span className="text-emerald-500 shrink-0">A:</span>
                  <span dangerouslySetInnerHTML={{ __html: faq.a }} />
                </p>
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* Resources */}
        <AccordionItem
          title="相关资源"
          icon={<BookOpen size={16} />}
        >
          <div className="space-y-2.5">
            {[
              { name: '《中华人民共和国民法典》全文', source: '全国人大网' },
              { name: '《物业管理条例》（2018修订）', source: '国务院' },
              { name: '《业主大会和业主委员会指导规则》', source: '住房和城乡建设部' },
              { name: '《物业服务合同（示范文本）》', source: '住房和城乡建设部' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-gray-700">{item.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">来源：{item.source}</p>
                </div>
                <span className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                  参考
                </span>
              </div>
            ))}
          </div>
        </AccordionItem>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-8">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          以上内容仅供参考，具体操作请以当地最新法规政策为准。
          如有法律问题，建议咨询专业律师。
        </p>
      </div>
    </div>
  )
}
