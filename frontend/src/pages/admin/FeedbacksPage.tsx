import { useEffect, useState } from 'react'
import { Star, Search, RefreshCw, Inbox } from 'lucide-react'
import { SectionHeader, Card, Table, Alert, TextField, Button, EmptyState, UserCell } from '@/components'
import { getAllFeedbacks } from '@/features/feedback/api'
import { formatDateTime, getApiErrorMessage } from '@/utils'
import type { TableColumn } from '@/components/ui/Table'

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllFeedbacks()
      // Sắp xếp mới nhất lên đầu
      const sorted = [...data].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setFeedbacks(sorted)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch feedbacks.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const filtered = feedbacks.filter(f => {
    if (query) {
      const lowerQuery = query.toLowerCase()
      const userName = (f.userName || '').toLowerCase()
      const comment = (f.comment || '').toLowerCase()
      if (!userName.includes(lowerQuery) && !comment.includes(lowerQuery)) {
        return false
      }
    }
    return true
  })

  const columns: TableColumn<any>[] = [
    {
      label: 'ID',
      key: 'id',
      render: (f: any) => <span className="text-text-strong font-mono font-bold">#{f.id}</span>
    },
    {
      label: 'User',
      key: 'userName',
      render: (f: any) => <UserCell userId={f.userId} userName={f.userName} />
    },
    {
      label: 'Rental ID',
      key: 'rentalId',
      render: (f: any) => <span className="text-text-strong font-mono font-bold">#{f.rentalId}</span>
    },
    {
      label: 'Rating',
      key: 'rating',
      render: (f: any) => (
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < (f.rating || 0) ? "currentColor" : "none"} className={i < (f.rating || 0) ? "" : "text-border"} />
          ))}
        </div>
      )
    },
    {
      label: 'Comment',
      key: 'comment',
      render: (f: any) => <span className="text-sm text-text-strong font-semibold max-w-[300px] block" title={f.comment}>{f.comment || <em className="text-text-muted">No comment</em>}</span>
    },
    {
      label: 'Date',
      key: 'createdAt',
      render: (f: any) => <span className="text-sm text-text-muted font-medium">{formatDateTime(f.createdAt)}</span>
    }
  ]

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="User Voice"
        title="Customer Feedbacks"
        description="Review ratings and comments from customers about their rides."
        actions={
          <Button variant="secondary" onClick={fetchFeedbacks} leadingIcon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        }
      />

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <TextField
            name="search"
            placeholder="Search by User Name or Comment..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<Search size={18} />}
          />
        </div>
      </Card>

      {error && <Alert tone="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : (
          <Table 
            columns={columns} 
            rows={filtered}
            rowKey={(row: any) => row.id}
            emptyState={
              <EmptyState
                icon={<Inbox size={24} />}
                title="No feedbacks found"
                description="There are currently no customer feedbacks matching your criteria."
              />
            }
          />
        )}
      </Card>
    </div>
  )
}
