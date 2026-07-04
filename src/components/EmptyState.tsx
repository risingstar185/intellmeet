import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionPath?: string
}

/**
 * EmptyState component.
 * Renders a standardized, visually pleasing layout for empty views.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionPath,
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-400">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-5">{description}</p>
      
      {actionLabel && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-500/10 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
