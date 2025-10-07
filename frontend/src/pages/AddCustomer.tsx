import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialForm = {
  code: '',
  name: '',
  company: '',
  address: '',
  state: '',
  city: '',
  pin: '',
  phone: '',
  fax: '',
  email: '',
  hsnCode: '',
  cftRatio: '',
  gst1: '',
  gstin: '',
  pan: '',
  bankName: '',
  accountNo: '',
  micr: '',
  ifsc: '',
};

export default function AddCustomer() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
  const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add customer');
      navigate('/admin/customer-list');
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Customer</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 max-w-4xl mx-auto space-y-8 border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-100">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Customer Code</label>
              <input name="code" value={form.code} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Customer Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Company Name</label>
              <input name="company" value={form.company} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-100">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">State</label>
              <select name="state" value={form.state} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select Here --</option>
                {/* Add state options here */}
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Delhi">Delhi</option>
                {/* ... */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Pin Code</label>
              <input name="pin" value={form.pin} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Fax</label>
              <input name="fax" value={form.fax} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">HSNCODE</label>
              <input name="hsnCode" value={form.hsnCode} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">CFT Ratio <span className="text-xs text-red-500">(Length/CBT/CBM Ratio)</span></label>
              <input name="cftRatio" value={form.cftRatio} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">GST1</label>
              <input name="gst1" value={form.gst1} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">GSTIN</label>
              <input name="gstin" value={form.gstin} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">PAN #</label>
              <input name="pan" value={form.pan} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-100">Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Bank Name</label>
              <input name="bankName" value={form.bankName} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Account No</label>
              <input name="accountNo" value={form.accountNo} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">MICR</label>
              <input name="micr" value={form.micr} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">IFSC</label>
              <input name="ifsc" value={form.ifsc} onChange={handleChange} className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-[#181C23] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="submit"
            className="px-6 py-2 rounded font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            onClick={() => navigate('/admin/customer-list')}
          >
            Back to Customer List
          </button>
        </div>
      </form>
    </div>
  );
}
