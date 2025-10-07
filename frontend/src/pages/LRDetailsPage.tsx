import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { lrApi, customerApi } from '../lib/api'
import type { LR } from '../lib/api'

// Backend status values (authoritative)
const TRACKING_STEPS = ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

function Stepper({ current }: { current: string }) {
  const idx = TRACKING_STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-between w-full px-2 py-6">
      {TRACKING_STEPS.map((label, i) => {
        const isDone = i < idx;
        const isCurrent = i === idx;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${isDone ? 'bg-red-600 text-white' : isCurrent ? 'bg-red-700 text-white scale-105 shadow-lg' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {i + 1}
            </div>
            <div className="mt-2 text-sm text-center text-gray-700 dark:text-gray-300">{label}</div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`absolute top-5 right-0 w-full h-0.5 ${i < idx ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-700'}`} style={{ left: '50%', right: '-50%' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LRDetailsPage() {
  const navigate = useNavigate()
  const { lrId } = useParams()
  const [lr, setLr] = useState<LR | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update UI state for update status flow
  const [showStatusSelect, setShowStatusSelect] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!lrId) return
    setLoading(true)
    lrApi
      .getById(lrId)
      .then(d => {
        setLr(d)
        setError(null)
      })
      .catch(() => setError('Failed to fetch LR details'))
      .finally(() => setLoading(false))
  }, [lrId])

  const currentStatus = useMemo(() => (lr?.status as string) || 'Booked', [lr])

  if (loading) return <div className="flex justify-center items-center h-96"><span className="text-lg">Loading...</span></div>
  if (error) return <div className="flex justify-center items-center h-96"><span className="text-lg text-red-500">{error}</span></div>
  if (!lr) return <div className="flex justify-center items-center h-96"><span className="text-lg text-gray-500">LR not found</span></div>

  async function handleSaveStatus(e?: React.FormEvent) {
    e?.preventDefault()
    if (!lr) {
      setShowStatusSelect(false)
      return
    }
    if (!selectedStatus || selectedStatus === (lr.status as string)) {
      setShowStatusSelect(false)
      return
    }
    setUpdating(true)

    // Build backend-shaped payload using only fields we have on the frontend LR object

    const payload: any = {
      status: selectedStatus, // backend enum string
      consignor: {
        name: lr.consignor?.name || '',
        address: lr.consignor?.address || '',
        city: lr.consignor?.city || '',
        state: lr.consignor?.state || '',
        pin: lr.consignor?.pin || '',
        phone: lr.consignor?.phone || '',
        email: lr.consignor?.email || '',
        gstin: lr.consignor?.gstin || '',
      },
      consignee: {
        name: lr.consignee?.name || '',
        address: lr.consignee?.address || '',
        city: lr.consignee?.city || '',
        state: lr.consignee?.state || '',
        pin: lr.consignee?.pin || '',
        phone: lr.consignee?.phone || '',
        email: lr.consignee?.email || '',
        gstin: lr.consignee?.gstin || '',
      },
      charges: lr.charges ? { ...lr.charges } : undefined,
    }

    // try to preserve customer if present; backend expects an ObjectId in `customer`
    if ((lr as any).customer) {
      payload.customer = (lr as any).customer
    } else if ((lr as any).customerCode) {
      // Attempt to resolve customerCode -> customer _id so backend validation passes
      try {
        const customers = await customerApi.getAll()
        const match = customers.find((c: any) => c.code === (lr as any).customerCode || c._id === (lr as any).customerCode)
        if (match) payload.customer = match._id
        else {
          // fallback: include customerCode so `customer` field is present (avoids missing-field validation)
          payload.customer = (lr as any).customerCode
          console.warn('Could not resolve customer for code, falling back to customerCode', (lr as any).customerCode)
        }
      } catch (err) {
        // network error resolving customers -> include customerCode as fallback
        payload.customer = (lr as any).customerCode
        console.warn('Failed to fetch customers to resolve customerCode, falling back to customerCode', err)
      }
    }
    // optimistic UI
    const prev = lr
    setLr({ ...lr, status: selectedStatus } as LR)
    try {
      await lrApi.update((lr as any)._id, payload)
      setShowStatusSelect(false)
    } catch (err) {
      // revert
      setLr(prev)
      // Keep message minimal but useful for debugging
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="px-4 py-8 md:px-20 lg:px-40 xl:px-48 max-w-[1800px] mx-auto bg-gray-50 dark:bg-gray-950 min-h-full space-y-10 transition-colors">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white"
        >
          Back
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex-1 text-center">LR Details · <span className="font-mono">{lr.lrNumber}</span></h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={async () => {
              if (!lr) return;
              const token = localStorage.getItem('auth_token');
              try {
                const res = await fetch(`/api/lr/${lr._id}/download`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (!res.ok) throw new Error('Failed to download LR');
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `LR_${lr.lrNumber || lr._id}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert('Download failed. Please try again.');
              }
            }}
          >
            Download
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition"
            onClick={() => lr && navigate(`/edit-lr/${lr._id}`)}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            onClick={async () => {
              if (!lr) return;
              if (!window.confirm('Are you sure you want to delete this LR?')) return;
              try {
                await lrApi.delete(lr._id);
                alert('LR deleted successfully.');
                navigate('/lrs');
              } catch (err) {
                alert('Failed to delete LR.');
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow p-8 w-full transition-colors">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-800 dark:text-gray-300">Tracking</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Status: <span className="font-bold text-blue-600 dark:text-blue-400">{(lr.status as string) || 'Booked'}</span></div>
        </div>
        <Stepper current={currentStatus} />
        <div className="mt-6 flex flex-col items-center">
          {!showStatusSelect && (
            <button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => {
                setSelectedStatus((lr.status as string) || TRACKING_STEPS[0])
                setShowStatusSelect(true)
              }}
            >
              Update Status
            </button>
          )}

          {showStatusSelect && (
            <form onSubmit={handleSaveStatus} className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <select
                className="border rounded-lg px-3 py-2 text-base dark:bg-gray-800 dark:text-white"
                value={selectedStatus || ''}
                onChange={e => setSelectedStatus(e.target.value)}
                disabled={updating}
              >
                {TRACKING_STEPS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60" disabled={updating || !selectedStatus}>
                {updating ? 'Updating...' : 'Save'}
              </button>
              <button type="button" className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition dark:bg-gray-700 dark:text-white" onClick={() => setShowStatusSelect(false)} disabled={updating}>
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow p-8 w-full transition-colors">
        <div className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">Shipment Info</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Description of Goods</div>
            <div className="text-xl font-mono text-blue-700 dark:text-blue-300 mt-1">{lr.shipmentDetails?.descriptionOfGoods || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Weight</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-200 mt-1">{lr.shipmentDetails?.actualWeight ?? 'N/A'} kg</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow p-8 w-full transition-colors">
          <div className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-300">Consignor (Sender)</div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{lr.consignor?.name}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{lr.consignor?.address}{lr.consignor?.city ? ', ' + lr.consignor?.city : ''}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow p-8 w-full transition-colors">
          <div className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-300">Consignee (Receiver)</div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{lr.consignee?.name}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">{lr.consignee?.address}{lr.consignee?.city ? ', ' + lr.consignee?.city : ''}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow p-8 w-full max-w-3xl mx-auto transition-colors">
        <div className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">Freight Bill</div>
        <div className="flex flex-col gap-2">
          {lr.charges && (
            <>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Freight</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.freight ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Pickup Charge</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.pickupCharge ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Door Delivery Charge</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.doorDeliveryCharge ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Docket Charge</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.docketCharge ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Handling Charge</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.handlingCharge ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Transhipment Charge</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.transhipmentCharge ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Other</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.other ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.subTotal ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <span className="text-gray-600 dark:text-gray-400">GST Charge</span>
                <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">₹ {lr.charges.gstCharge ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-800 dark:text-gray-300 font-semibold">Total</span>
                <span className="text-gray-900 dark:text-white font-extrabold text-xl">₹ {lr.charges.total ?? 'N/A'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}