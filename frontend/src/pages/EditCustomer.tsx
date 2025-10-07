import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerApi } from '../lib/api';

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

export default function EditCustomer() {
  const { id } = useParams();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCustomer() {
      setLoading(true);
      setError(null);
      try {
        const data = await customerApi.getById(id!);
        setForm({ ...initialForm, ...data });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customer');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCustomer();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await customerApi.update(id!, form);
      navigate('/admin/customer-list');
    } catch (err: any) {
      setError(err.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Customer</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 max-w-4xl mx-auto space-y-8 border border-gray-200 dark:border-gray-700">
        {/* ...same fields as AddCustomer, copy-paste the JSX for all fields here... */}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="submit"
            className="px-6 py-2 rounded font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            onClick={() => navigate('/admin/customer-list')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
