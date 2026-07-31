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
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/20 to-accent/20 border border-brand/30 flex items-center justify-center text-brand shrink-0">
        {initial ? (
          <span className="text-xs font-bold">{initial}</span>
        ) : (
          <UserIcon size={14} />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-text-strong truncate max-w-[150px]">
          {displayName}
        </span>
        {email && userName && (
          <span className="text-xs text-text-muted truncate max-w-[150px]">
            {email}
          </span>
        )}
      </div>
    </div>
  )
}
