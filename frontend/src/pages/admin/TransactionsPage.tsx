import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, RefreshCw, Search, Inbox, CheckCircle, XCircle } from 'lucide-react'
import { SectionHeader, Card, Table, Alert, TextField, Button, EmptyState, UserCell } from '@/components'
import { getAllTransactions, approveTransaction, rejectTransaction } from '@/features/transactions'
import { formatCurrency, formatDateTime, getApiErrorMessage, cn } from '@/utils'
import type { TableColumn } from '@/components/ui/Table'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllTransactions()
      // Sắp xếp mới nhất lên đầu
      const sorted = [...data].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setTransactions(sorted)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch transactions.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleApprove = async (id: number) => {
    try {
      await approveTransaction(id)
      fetchTransactions()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to approve transaction.'))
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectTransaction(id)
      fetchTransactions()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reject transaction.'))
    }
  }

  const filtered = transactions.filter(t => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false
    if (query) {
      const lowerQuery = query.toLowerCase()
      const userName = (t.userName || '').toLowerCase()
      const desc = (t.description || '').toLowerCase()
      if (!userName.includes(lowerQuery) && !desc.includes(lowerQuery) && !String(t.id).includes(lowerQuery)) {
        return false
      }
    }
    return true
  })

  const columns: TableColumn<any>[] = [
    {
      label: 'Transaction ID',
      key: 'id',
      render: (t: any) => <span className="text-text-strong font-mono font-bold">#{t.id}</span>
    },
    {
      label: 'User',
      key: 'userName',
      render: (t: any) => <UserCell userId={t.userId} userName={t.userName} />
    },
    {
      label: 'Type',
      key: 'type',
      render: (t: any) => {
        const isDeposit = t.type === 'DEPOSIT'
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
            isDeposit 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}>
            {isDeposit ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {t.type}
          </span>
        )
      }
    },
    {
      label: 'Amount',
      key: 'amount',
      align: 'right',
      render: (t: any) => {
        const isDeposit = t.type === 'DEPOSIT'
        return (
          <span className={cn(
            "font-bold font-mono",
            isDeposit ? "text-emerald-400" : "text-rose-400"
          )}>
            {isDeposit ? '+' : '-'}{formatCurrency(t.amount)}
          </span>
        )
      }
    },
    {
      label: 'Description',
      key: 'description',
      render: (t: any) => <span className="text-text-strong font-medium text-sm max-w-[200px] truncate block" title={t.description}>{t.description}</span>
    },
    {
      label: 'Date',
      key: 'createdAt',
      render: (t: any) => <span className="text-sm text-text-muted font-medium">{formatDateTime(t.createdAt)}</span>
    },
    {
      label: 'Status',
      key: 'status',
      render: (t: any) => {
        if (t.status === 'PENDING') {
          return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">PENDING</span>
        }
        if (t.status === 'REJECTED') {
          return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">REJECTED</span>
        }
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">COMPLETED</span>
      }
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (t: any) => {
        if (t.type === 'DEPOSIT' && t.status === 'PENDING') {
          return (
            <div className="flex gap-2">
              <button 
                onClick={() => handleApprove(t.id)}
                className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                title="Approve"
              >
                <CheckCircle size={16} />
              </button>
              <button 
                onClick={() => handleReject(t.id)}
                className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                title="Reject"
              >
                <XCircle size={16} />
              </button>
            </div>
          )
        }
        return null
      }
    }
  ]

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Financials"
        title="Transactions"
        description="Monitor all system deposits and rental payments."
        actions={
          <Button variant="secondary" onClick={fetchTransactions} leadingIcon={<RefreshCw size={16} />}>
            Refresh
          </Button>
        }
      />

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <TextField
            name="search"
            placeholder="Search by User Name or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<Search size={18} />}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-white/10 shrink-0">
            {['ALL', 'DEPOSIT', 'PAYMENT'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  typeFilter === type 
                    ? "bg-cyan-500/20 text-cyan-400" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>
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
                title="No transactions found"
                description="There are currently no transactions matching your criteria."
              />
            }
          />
        )}
      </Card>
    </div>
  )
}
