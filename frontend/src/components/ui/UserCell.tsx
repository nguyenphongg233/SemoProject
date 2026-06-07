import { User as UserIcon } from 'lucide-react'

interface UserCellProps {
  userId: number | string
  userName?: string
  email?: string
}

export default function UserCell({ userId, userName, email }: UserCellProps) {
  const displayName = userName || email || `User #${userId}`
  const initial = displayName !== `User #${userId}` ? displayName.charAt(0).toUpperCase() : null

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
        {initial ? (
          <span className="text-xs font-bold">{initial}</span>
        ) : (
          <UserIcon size={14} />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-200 truncate max-w-[150px]">
          {displayName}
        </span>
        {email && userName && (
          <span className="text-xs text-slate-500 truncate max-w-[150px]">
            {email}
          </span>
        )}
      </div>
    </div>
  )
}
