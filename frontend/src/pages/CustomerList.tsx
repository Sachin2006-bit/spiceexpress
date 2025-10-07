import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../lib/api';

interface Customer {
  _id: string;
  code: string;
  company: string;
  address?: string;
  state?: string;
  city?: string;
  pin?: string;
  phone?: string;
  fax?: string;
  email?: string;
  hsnCode?: string;
  cftRatio?: string;
  gst1?: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountNo?: string;
  micr?: string;
  ifsc?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  // Edit modal state
  const [editModal, setEditModal] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null });
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [editLoading, setEditLoading] = useState(false);
  // Delete loading state
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  // Edit handlers
  const openEdit = (customer: Customer) => {
    setEditForm({ ...customer });
    setEditModal({ open: true, customer });
  };
  const closeEdit = () => {
    setEditModal({ open: false, customer: null });
    setEditForm({});
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const saveEdit = async () => {
    if (!editModal.customer) return;
    setEditLoading(true);
    try {
      await customerApi.update(editModal.customer._id, editForm);
      setCustomers(cs => cs.map(c => c._id === editModal.customer!._id ? { ...c, ...editForm } : c));
      setFiltered(fs => fs.map(c => c._id === editModal.customer!._id ? { ...c, ...editForm } : c));
      closeEdit();
    } catch (err) {
      alert('Failed to update customer');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer?')) return;
    setDeleteLoadingId(id);
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers(cs => cs.filter(c => c._id !== id));
      setFiltered(fs => fs.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete customer');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(data);
        setFiltered(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!filter.trim()) {
      setFiltered(customers);
    } else {
      const q = filter.toLowerCase();
      setFiltered(
        customers.filter(
          c =>
            c.code.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            (c.state?.toLowerCase() || '').includes(q) ||
            (c.createdBy?.toLowerCase() || '').includes(q)
        )
      );
    }
    setPage(1);
  }, [filter, customers]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">List of Customers</h1>
        <button
          className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
          onClick={() => navigate('/admin/add-customer')}
        >
          Add New Customer
        </button>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Filter customers..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-3 py-2 w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
        />
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consignee Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consignee Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">State Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-red-600 dark:text-red-400">{error}</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No customers found.</td>
              </tr>
            ) : (
              paginated.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{c.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{c.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{c.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{c.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      onClick={() => openEdit(c)}
                      type="button"
                    >Edit</button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:opacity-50"
                      onClick={() => handleDelete(c._id)}
                      type="button"
                      disabled={deleteLoadingId === c._id}
                    >{deleteLoadingId === c._id ? 'Deleting...' : 'Delete'}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="text-gray-700 dark:text-gray-200">Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    {/* Edit Modal */}
    {editModal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md relative">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-900" onClick={closeEdit}>&times;</button>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Company</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="company" value={editForm.company || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Address</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="address" value={editForm.address || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">State</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="state" value={editForm.state || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">City</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="city" value={editForm.city || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Pin</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="pin" value={editForm.pin || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Phone</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="phone" value={editForm.phone || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Fax</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="fax" value={editForm.fax || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="email" value={editForm.email || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">HSN Code</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="hsnCode" value={editForm.hsnCode || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">CFT Ratio</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="cftRatio" value={editForm.cftRatio || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">GST 1</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="gst1" value={editForm.gst1 || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">GSTIN</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="gstin" value={editForm.gstin || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">PAN</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="pan" value={editForm.pan || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Bank Name</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="bankName" value={editForm.bankName || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Account No</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="accountNo" value={editForm.accountNo || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">MICR</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="micr" value={editForm.micr || ''} onChange={handleEditChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">IFSC</label>
              <input className="border rounded px-3 py-2 w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700" name="ifsc" value={editForm.ifsc || ''} onChange={handleEditChange} />
            </div>
          </div>
          <div className="flex gap-4 mt-6 justify-end">
            <button
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={closeEdit}
              type="button"
              disabled={editLoading}
            >Cancel</button>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={saveEdit}
              type="button"
              disabled={editLoading}
            >{editLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
