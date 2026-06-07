// Số dư hiển thị bằng định dạng VNĐ (vi-VN) qua utils/formatters.formatCurrency.
import { useState, useEffect } from 'react'
import type { SyntheticEvent, ChangeEvent } from 'react'
import {
  Wallet, Sparkles, Plus, ArrowUpRight, ArrowDownRight, Activity, Inbox
} from 'lucide-react'

import { SectionHeader, Alert, Button, Card, TextField, EmptyState } from '@/components'
import { useAuth } from '@/hooks/useAuth'
import { depositToWallet, getUserById } from '@/features/users'
import { getMyTransactionHistory } from '@/features/transactions'
import { formatCurrency, getApiErrorMessage, formatDateTime } from '@/utils'
import { ROLES } from '@/constants'

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000]

export default function WalletPage() {
  const { user, setBalance, updateUser } = useAuth()

  const [depositAmount, setDepositAmount] = useState('')
  const [loadingDeposit, setLoadingDeposit] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTx, setLoadingTx] = useState(true)

  // Fetch transactions and latest profile on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch latest balance
        if (user?.id) {
          const fetchedUser = await getUserById(user.id)
          if (fetchedUser) {
            updateUser({ ...user, ...fetchedUser })
          }
        }
        
        // Fetch transaction history
        const res = await getMyTransactionHistory()
        setTransactions(Array.isArray(res) ? res : (res?.data || []))
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoadingTx(false)
      }
    }
    
    if (user) {
      loadData()
    } else {
      setLoadingTx(false)
    }
  }, [user?.id])

  // FIX: Show 0 initially if balance is not yet defined, avoid "No data available"
  const balance = user?.balance ?? 0
  const balanceDisplay = formatCurrency(balance)

  async function handleDeposit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingDeposit(true)
    setError('')
    setSuccess('')

    try {
      const amount = Number(depositAmount)
      if (!Number.isFinite(amount) || amount < 10000) {
        setError('The minimum top-up amount is 10,000 VND.')
        return
      }

      const response = await depositToWallet({ amount })
      const newBalance = response?.newBalance

      if (typeof newBalance === 'number') {
        setBalance(newBalance)
      }

      const niceAmount = formatCurrency(amount)
      setSuccess(
        response?.message
          ? `${response.message} (+${niceAmount})`
          : `Successfully topped up ${niceAmount}.`,
      )
      setDepositAmount('')
      
      // Reload history
      const res = await getMyTransactionHistory()
      setTransactions(Array.isArray(res) ? res : (res?.data || []))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to deposit money into wallet.'))
    } finally {
      setLoadingDeposit(false)
    }
  }

  function pickQuickAmount(value: number) {
    setDepositAmount(String(value))
  }

  const roleLabel = user?.role === ROLES.ADMIN ? 'Administrator' : 'Customer'

  return (
    <div className="grid gap-6 pb-10">
      <SectionHeader
        eyebrow="Wallet Dashboard"
        title="Your Wallet"
        description="Manage your balance, top up your wallet, and view transaction history."/>
      
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex max-lg:flex-col gap-6 items-start">
        {/* Main Content: Wallet Hero, Top Up, History */}
        <div className="flex-1 grid gap-6 w-full">
          
          {/* Wallet hero */}
          <section className="relative p-8 rounded-3xl
            bg-[radial-gradient(circle_at_90%_0%,rgba(0,209,255,0.35),transparent_50%),linear-gradient(135deg,rgba(0,82,255,0.8)_0%,rgba(17,28,52,0.95)_100%)]
            border border-white/10 text-white overflow-hidden shadow-[0_0_40px_rgba(0,209,255,0.15)]
            before:content-[''] before:absolute before:-top-1/2 before:right-[-20%]
            before:w-96 before:h-96 before:rounded-full
            before:bg-[radial-gradient(circle,rgba(0,209,255,0.3),transparent_70%)] before:blur-[20px] before:pointer-events-none"
          >
            <p className="relative m-0 text-sm uppercase tracking-[0.2em] font-bold text-cyan-300">
              Current Balance
            </p>
            <p className="relative mt-2 mb-3 text-5xl font-extrabold tracking-tight">
              {balanceDisplay}
            </p>
            <p className="relative m-0 text-slate-300 text-sm">
              Currency: <strong className="text-white">VND</strong> &nbsp;•&nbsp;
              Account holder:{' '}
              <strong className="text-white">{user?.fullName || user?.email || '—'}</strong>
            </p>
            <span className="relative inline-flex items-center gap-1.5 mt-5
              px-3 py-1.5 rounded-full bg-black/30 border border-white/20
              text-xs tracking-widest font-semibold"
            >
              <Sparkles size={14} strokeWidth={1.9} /> SEMO • {roleLabel.toUpperCase()}
            </span>
          </section>

          {/* Deposit card */}
          <Card className="rounded-3xl border-white/5 bg-slate-900/50 backdrop-blur-md p-6">
            <SectionHeader
              eyebrow="Wallet"
              title="Top Up Wallet"
              description="Minimum top-up amount is 10,000 VND. Balance updates immediately after successful transaction."
              actions={<Wallet size={20} strokeWidth={1.7} className="text-cyan-400" />}
            />

            <form className="grid gap-5 mt-4" onSubmit={handleDeposit}>
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="px-4 py-2 rounded-full border border-white/10
                    bg-slate-800/50 text-slate-300 text-sm font-semibold
                    transition-all duration-200 hover:border-cyan-500/50
                    hover:text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => pickQuickAmount(v)}
                  >
                    + {formatCurrency(v)}
                  </button>
                ))}
              </div>

              <TextField
                label="Deposit Amount (VND)"
                type="number"
                min="10000"
                step="1000"
                name="depositAmount"
                value={depositAmount}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDepositAmount(event.target.value)}
                placeholder="e.g., 100000"
                required
                leadingIcon={<Wallet size={18} strokeWidth={1.7} />}
                helpText={
                  depositAmount && Number(depositAmount) >= 10000
                    ? `Will deposit ${formatCurrency(Number(depositAmount))} into your wallet.`
                    : 'Minimum 10,000 VND.'
                }
              />

              <Button
                type="submit"
                disabled={loadingDeposit}
                className="rounded-xl h-12 bg-cyan-600 hover:bg-cyan-500 text-white border-none shadow-[0_0_15px_rgba(8,145,178,0.3)]"
                leadingIcon={<Plus size={18} strokeWidth={1.8} />}
              >
                {loadingDeposit ? 'Processing...' : 'Confirm Top Up'}
              </Button>
            </form>
          </Card>
          
          {/* Transaction History Card */}
          <Card className="rounded-3xl border-white/5 bg-slate-900/50 backdrop-blur-md p-6">
            <SectionHeader
              eyebrow="History"
              title="Recent Transactions"
              description="Your latest wallet top-ups and ride payments."
              actions={<Activity size={20} className="text-cyan-400" />}
            />
            <div className="mt-6">
              {loadingTx ? (
                <p className="text-sm text-slate-400 py-4">Loading history...</p>
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon={<Inbox size={24} />}
                  title="No transactions yet"
                  description="Your wallet top-ups and ride payments will appear here."
                  className="bg-slate-800/20 rounded-2xl border border-white/5 border-dashed py-10"
                />
              ) : (
                <div className="grid gap-3">
                  {transactions.slice(0, 10).map((tx) => {
                    const isTopup = tx.amount > 0 || String(tx.type).toUpperCase() === 'DEPOSIT';
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${isTopup ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {isTopup ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-0.5">{tx.description || tx.reason || (isTopup ? 'Wallet Top-up' : 'Ride Payment')}</p>
                            <p className="text-xs text-slate-400">{formatDateTime(tx.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`text-base font-bold ${isTopup ? 'text-emerald-400' : 'text-white'}`}>
                          {isTopup ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}