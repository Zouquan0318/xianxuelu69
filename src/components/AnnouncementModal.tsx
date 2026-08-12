import { useEffect, useState } from 'react'
import { X, Megaphone } from 'lucide-react'

const STORAGE_KEY = 'community-app-announcement-shown'

const ANNOUNCEMENT_TITLE = '致邻居'
const ANNOUNCEMENT_CONTENT = [
  '目前万科物业存在着诸多问题，核心包括：',
  '1. 地块共享物业资源（人力、物力），导致我们地块资源匹配不足，协商后也无改善。',
  '2. 各项基础服务不能满足业主要求（保洁、保安、绿化、管家、管理规范、基础设施响应等）。',
  '3. 无法落实业主反馈的一系列问题，有摆烂拖延等现象频繁发生。',
  '基于此，我和几个热心的业主希望通过调研，来了解我们业主的想法和意见。在不提高物业费的前提下，更换我们的物业，引进更好的物业和服务保障。请大家能够抽空填写问卷和提出自己的意见，谢谢大家。',
]

interface AnnouncementModalProps {
  onClose?: () => void
}

export default function AnnouncementModal({ onClose }: AnnouncementModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasShown = localStorage.getItem(STORAGE_KEY) === '1'
    if (!hasShown) {
      setVisible(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    onClose?.()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm max-h-full overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-5 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{ANNOUNCEMENT_TITLE}</h2>
              <p className="text-xs text-gray-500 mt-0.5">6-5 地块热心业主</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto">
          <div className="space-y-3">
            {ANNOUNCEMENT_CONTENT.map((paragraph, index) => (
              <p
                key={index}
                className={`text-sm leading-relaxed ${
                  paragraph.startsWith('基于此')
                    ? 'text-gray-700 font-medium bg-blue-50 rounded-lg p-3 border border-blue-100'
                    : 'text-gray-600'
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={handleClose}
            className="w-full bg-blue-600 text-white text-sm font-medium rounded-xl py-3 active:bg-blue-700 transition-colors shadow-sm"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}
