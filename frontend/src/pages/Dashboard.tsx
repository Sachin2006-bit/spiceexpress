import { useEffect, useMemo, useState } from 'react';
import { lrApi, invoiceApi } from '../lib/api';
import type { LR, Invoice } from '../lib/api';


import { Card as ShadCard } from "../components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { IndianRupee, BadgeCheck } from 'lucide-react';

export default function Dashboard() {
  const [lrs, setLrs] = useState<LR[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [lrsRes, invRes] = await Promise.all([
          lrApi.getAll(),
          invoiceApi.getAll(),
        ]);
        setLrs(lrsRes);
        setInvoices(invRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute today's date string in dd-mm-yyyy
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-GB').split('/').join('-');
  const todayIso = today.toISOString().slice(0, 10);

  // Compute today's totals
  const todaysTotals = useMemo(() => {
    const paid = invoices.filter(inv => inv.status === 'paid' && inv.createdAt && inv.createdAt.slice(0,10) === todayIso)
      .reduce((s, inv) => s + (inv.totalAmount || 0), 0);
    const topay = invoices.filter(inv => inv.status !== 'paid' && inv.createdAt && inv.createdAt.slice(0,10) === todayIso)
      .reduce((s, inv) => s + (inv.totalAmount || 0), 0);
    const tbb = lrs.filter(lr => lr.date && lr.date.slice(0,10) === todayIso)
      .reduce((s, lr) => s + (lr.amount || 0), 0);
    return { paid, topay, tbb, total: paid + topay + tbb };
  }, [todayIso, invoices, lrs]);

  // Last 8 days for chart
  const days = useMemo(() => {
    const out: string[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }, []);

  const chartData = useMemo(() => {
    return days.map(day => {
      const paid = invoices.filter(inv => inv.status === 'paid' && inv.createdAt && inv.createdAt.slice(0,10) === day)
        .reduce((s, inv) => s + (inv.totalAmount || 0), 0);
      const topay = invoices.filter(inv => inv.status !== 'paid' && inv.createdAt && inv.createdAt.slice(0,10) === day)
        .reduce((s, inv) => s + (inv.totalAmount || 0), 0);
      const tbb = lrs.filter(lr => lr.date && lr.date.slice(0,10) === day)
        .reduce((s, lr) => s + (lr.amount || 0), 0);
      return {
        date: new Date(day).toLocaleDateString('en-GB').slice(0,5),
        paid,
        topay,
        tbb,
      };
    });
  }, [days, invoices, lrs]);

  if (loading) return (<div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-full"><div className="flex items-center justify-center h-64"><div className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</div></div></div>);
  if (error) return (<div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-full"><div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-950 dark:border-red-900"><div className="text-red-800 font-medium dark:text-red-300">Error loading dashboard</div><div className="text-red-600 text-sm mt-1 dark:text-red-400">{error}</div></div></div>);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.4 }} className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 min-h-full font-publicsans">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-24">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Today's Booking */}
        <div className="relative">
          <ShadCard className={
            `p-6 rounded-2xl shadow-xl min-h-[180px] flex flex-col justify-between 
            bg-gradient-to-br from-pink-300 to-orange-200 
            dark:from-[#232b5c] dark:to-[#6a3093] dark:bg-gradient-to-br`
          }>
            <div className="absolute -top-8 left-4 w-16 h-16 flex items-center justify-center rounded-full border-4 border-white shadow-md bg-white" style={{zIndex:2}}>
              <IndianRupee className="w-10 h-10 text-yellow-500" />
            </div>
            <div className="mt-8">
              <div className="text-white text-lg font-semibold">Today's Booking</div>
              <div className="text-white text-sm opacity-90">(Paid + To Be Paid + TBB)</div>
              <div className="text-white text-base opacity-90 mt-1">{todayStr}</div>
            </div>
            <div className="text-white text-3xl font-bold mt-4">₹ {todaysTotals.total?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</div>
          </ShadCard>
        </div>

        {/* Card 2: Today's Book Source to Destination */}
        <div className="relative">
          <ShadCard className={
            `p-6 rounded-2xl shadow-xl min-h-[180px] flex flex-col justify-between 
            bg-gradient-to-br from-yellow-400 to-orange-400 
            dark:from-[#232b5c] dark:to-[#ffb347] dark:bg-gradient-to-br`
          }>
            <div className="absolute -top-6 left-4 w-14 h-14 flex items-center justify-center rounded-full border-4 border-white shadow-md bg-white" style={{zIndex:2}}>
              <BadgeCheck className="w-8 h-8 text-orange-500" />
            </div>
            
            <div className="mt-8">
              <div className="text-white text-lg font-semibold">Today's Book</div>
              <div className="text-white text-sm opacity-90">Source to Destination</div>
              <div className="text-white text-base opacity-90 mt-1">{todayStr}</div>
            </div>
            <div className="text-white text-3xl font-bold mt-4">₹ {todaysTotals.total?.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</div>
          </ShadCard>
        </div>
      </div>

      {/* Last Eight Days Booking Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Last Eight Days Booking</h3>
          <div className="flex items-center gap-6 text-base font-medium">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>Paid</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>To Be Paid</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-300 inline-block"></span>TBB</span>
          </div>
        </div>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 14 }} />
              <YAxis tickFormatter={v => v.toLocaleString()} />
              <Tooltip formatter={v => `₹ ${Number(v).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="paid" name="Paid" stackId="a" fill="#3b82f6" />
              <Bar dataKey="topay" name="To Be Paid" stackId="a" fill="#ef4444" />
              <Bar dataKey="tbb" name="TBB" stackId="a" fill="#7dd3fc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}


