async function downloadLR(id: string) {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`/api/lr/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });
  if (!res.ok) {
    alert('Failed to download LR');
    return;
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lr-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
import { useEffect, useState } from 'react'

type LR = {
  _id: string
  lrNumber: string
}

export default function LRs() {
  const [lrs, setLrs] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [lrNumber, setLrNumber] = useState<string>('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/lr')
    const data = await res.json()
    setLrs(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function createLR(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/lr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lrNumber }),
    })
    setLrNumber('')
    await load()
  }

  return (
    <div>
      <h2>LRs</h2>
      <form onSubmit={createLR} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="LR Number" value={lrNumber} onChange={(e) => setLrNumber(e.target.value)} />
        <button type="submit" disabled={!lrNumber || loading}>Create</button>
      </form>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th>LR No</th>
              <th>Date</th>
              <th>Consignor City</th>
              <th>Consignee City</th>
              <th>Charged Weight</th>
              <th>Grand Total</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {lrs.map((lr) => (
              <tr key={lr._id}>
                <td>{lr.lrNumber}</td>
                <td>{lr.bookingDate ? new Date(lr.bookingDate).toLocaleDateString() : ''}</td>
                <td>{lr.consignor?.city || '-'}</td>
                <td>{lr.consignee?.city || '-'}</td>
                <td>{lr.shipmentDetails?.chargedWeight ?? '-'}</td>
                <td>{(lr.charges?.total ?? lr.charges?.grandTotal)?.toFixed(2) ?? '0.00'}</td>
                <td><button onClick={() => downloadLR(lr._id)}>Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}


