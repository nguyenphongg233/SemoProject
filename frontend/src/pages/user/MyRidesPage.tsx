import { useEffect, useState } from 'react'
import { Bike, Clock, Calendar, CheckCircle, MessageSquare, Star, Activity, Sparkles, Send, TrendingUp, Search } from 'lucide-react'
import { SectionHeader, Card, Alert, Button, Modal, EmptyState } from '@/components'
import { getRentalHistory } from '@/features/rentals'
import { submitFeedback, getMyFeedbacks } from '@/features/feedback/api'
import { formatCurrency, formatDateTime, getApiErrorMessage } from '@/utils'

export default function MyRidesPage() {
  const [rentals, setRentals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<Set<number>>(new Set())

  // Feedback Modal State
  const [feedbackRentalId, setFeedbackRentalId] = useState<number | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const [data, feedbacksData] = await Promise.all([
        getRentalHistory(),
        getMyFeedbacks().catch(() => []) // Fallback to empty if feedback API fails
      ])
      
      const feedbackSet = new Set<number>()
      feedbacksData.forEach((f: any) => {
        if (f.rentalId) feedbackSet.add(f.rentalId)
      })
      setSubmittedFeedbacks(feedbackSet)

      // Sắp xếp mới nhất lên đầu
      const sorted = [...data].sort((a: any, b: any) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
      setRentals(sorted)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your rides.'))
    } finally {
      setLoading(false)
    }
  }

  // Lọc chỉ lấy những cuốc đã hoàn thành
  const completedRentals = rentals.filter(r => r.status === 'COMPLETED')

  const totalRides = completedRentals.length
  const totalSpent = completedRentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader
        eyebrow="History"
        title="My Rides"
        description="View your past scooter rentals and trip details."
        actions={<Bike size={24} strokeWidth={1.5} className="text-cyan-400" />}
      />

      {error && <Alert tone="error">{error}</Alert>}
      {successMsg && <Alert tone="success">{successMsg}</Alert>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-800/80 backdrop-blur-md border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs tracking-wider text-slate-400 uppercase font-semibold">Total Completed Rides</p>
            <span className="w-8 h-8 rounded-lg grid place-items-center bg-white/5 border border-white/10 text-cyan-400">
              <Activity size={16} />
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div className="text-3xl font-bold text-white">{totalRides}</div>
            <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-emerald-400 bg-emerald-400/10">
              <TrendingUp size={12} />
              Active user
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/80 backdrop-blur-md border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs tracking-wider text-slate-400 uppercase font-semibold">Total Spent</p>
            <span className="w-8 h-8 rounded-lg grid place-items-center bg-white/5 border border-white/10 text-emerald-400">
              <Sparkles size={16} />
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              {formatCurrency(totalSpent)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" /> Recent Trips
        </h3>

        {loading ? (
          <p className="text-slate-400 text-sm text-center py-10">Loading your rides...</p>
        ) : rentals.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="No rides found"
            description="You haven't taken any rides yet. Book a scooter to get started!"
            className="bg-slate-800/20 rounded-xl border border-white/5 border-dashed py-12"
          />
        ) : (
          <div className="grid gap-4">
            {rentals.map((rental) => (
              <Card key={rental.id} className="rounded-3xl border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors p-5 overflow-hidden relative group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
                      <Bike size={24} className={rental.status === 'IN_USE' ? "text-cyan-400" : "text-slate-400"} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        {rental.scooterName || `Scooter #${rental.scooterId}`}
                        {rental.status === 'COMPLETED' && <CheckCircle size={16} className="text-emerald-500" />}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatDateTime(rental.startTime)}
                        </span>
                        {rental.endTime && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1">
                              <CheckCircle size={12} /> Ended at {formatDateTime(rental.endTime)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
                        Rental ID: #{rental.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center pt-3 md:pt-0 border-t border-white/5 md:border-0 mt-2 md:mt-0 gap-2">
                    {rental.status === 'IN_USE' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-xs font-medium text-cyan-400 animate-pulse w-fit md:mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Riding Now
                      </span>
                    )}
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">
                        {rental.status === 'IN_USE' ? 'Current Fare' : 'Total Fare'}
                      </p>
                      <div className={`text-2xl font-black ${rental.status === 'IN_USE' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                        {formatCurrency(rental.totalPrice || 0)}
                      </div>
                    </div>
                    {rental.status === 'COMPLETED' && (
                      submittedFeedbacks.has(rental.id) ? (
                        <div className="text-xs text-emerald-400 flex items-center justify-end gap-1.5 font-semibold bg-emerald-400/10 px-3 py-2 rounded-lg">
                          <CheckCircle size={14} /> Feedback Submitted
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          leadingIcon={<MessageSquare size={14} />}
                          onClick={() => {
                            setFeedbackRentalId(rental.id)
                            setRating(5)
                            setComment('')
                          }}
                        >
                          Feedback
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!feedbackRentalId}
        onClose={() => setFeedbackRentalId(null)}
        title="Rate Your Ride"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            How was your trip with Rental #{feedbackRentalId}? Your feedback helps us improve our service!
          </p>

          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-sm font-semibold text-white">Select Rating</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    fill={star <= rating ? "#22d3ee" : "transparent"}
                    className={star <= rating ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "text-slate-600"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 mt-4">
            <label className="text-sm font-semibold text-white">Additional Comments (Optional)</label>
            <textarea
              className="w-full min-h-[5rem] p-4 border border-white/10 rounded-[14px] bg-[rgba(11,17,32,0.65)] text-white focus:outline-none focus:border-cyan-400"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or what could be better..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-2">
            <Button variant="secondary" onClick={() => setFeedbackRentalId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-500 border-none text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]"
              disabled={submittingFeedback}
              leadingIcon={<Send size={16} />}
              onClick={async () => {
                try {
                  setSubmittingFeedback(true)
                  await submitFeedback({ rentalId: feedbackRentalId, rating, comment })
                  setSuccessMsg('Thank you for your feedback!')
                  
                  setSubmittedFeedbacks(prev => new Set(prev).add(feedbackRentalId as number))
                  
                  setFeedbackRentalId(null)
                } catch (err) {
                  setError(getApiErrorMessage(err, 'Could not submit feedback.'))
                } finally {
                  setSubmittingFeedback(false)
                }
              }}
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
