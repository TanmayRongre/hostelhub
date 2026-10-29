import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

export default function AdminFinanceSection({ onFinanceUpdated }) {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Fee Modal
  const [createModal, setCreateModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    student: '',
    title: 'Semester 1 Hostel Fee',
    amount: 39000,
    feeType: 'Hostel Fee',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleAutofillFee = () => {
    const firstStudentId = students[0]?.user?._id || students[0]?.user || students[0]?._id || '';
    setFeeForm({
      student: firstStudentId,
      title: 'Semester 2 Residence & Dining Fee',
      amount: 39000,
      feeType: 'Hostel Fee',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [feesRes, studentsRes] = await Promise.allSettled([
        api.getFees(),
        api.getStudents(),
      ]);

      if (feesRes.status === 'fulfilled' && feesRes.value.data) setFees(feesRes.value.data);
      if (studentsRes.status === 'fulfilled' && studentsRes.value.data) setStudents(studentsRes.value.data);
    } catch (err) {
      showToast(err.message || 'Failed to load financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (!feeForm.student) {
      showToast('Please select a student', 'error');
      return;
    }
    try {
      await api.createFee(feeForm);
      showToast('Fee invoice created successfully!');
      setCreateModal(false);
      loadFinanceData();
      if (onFinanceUpdated) onFinanceUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to create fee invoice', 'error');
    }
  };

  const totalInvoiced = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + (f.amount || 0), 0);
  const rate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;

  const filteredFees = fees.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return f.title?.toLowerCase().includes(term) || f.student?.name?.toLowerCase().includes(term) || f.receiptNumber?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#586d65] uppercase tracking-wider text-[11px]">Total Invoiced</span>
          <div className="text-2xl font-bold text-[#15232a] font-serif mt-1">₹{totalInvoiced.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-[#586d65] mt-1">{fees.length} Total Invoices</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#128bc0] uppercase tracking-wider text-[11px]">Collected Revenue</span>
          <div className="text-2xl font-bold text-[#128bc0] font-serif mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">✓ Verified Payments</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider text-[11px]">Outstanding Dues</span>
          <div className="text-2xl font-bold text-amber-800 font-serif mt-1">₹{totalPending.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Pending clearance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#128bc0] uppercase tracking-wider text-[11px]">Collection Rate</span>
          <div className="text-2xl font-bold text-[#15232a] font-serif mt-1">{rate}%</div>
          <div className="text-[11px] text-[#586d65] mt-1">Efficiency benchmark</div>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#586d65] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, invoice title, or receipt ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-xs text-[#15232a] placeholder-[#586d65]/60 focus:outline-none focus:border-[#128bc0] transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#f5f6f0] p-1 rounded-xl border border-[#d6e0d7]">
            {['all', 'pending', 'paid'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-[#152c36] text-white font-bold shadow-xs' : 'text-[#586d65] hover:text-[#15232a]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCreateModal(true)}
            className="btn-arch-primary text-xs px-4 py-2 flex items-center gap-1.5 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden border border-[#d6e0d7] rounded-2xl bg-white shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#fbfbf9] border-b border-[#dce5dc] text-[#586d65] uppercase text-[10px] tracking-wider font-semibold">
              <th className="p-4">Student</th>
              <th className="p-4">Invoice Title</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Receipt Ref</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dce5dc] text-[#15232a]">
            {filteredFees.length > 0 ? (
              filteredFees.map((f) => (
                <tr key={f._id} className="hover:bg-[#fbfbf9] transition-colors">
                  <td className="p-4 font-bold text-[#15232a]">{f.student?.name || 'Resident Student'}</td>
                  <td className="p-4 text-[#586d65]">{f.title}</td>
                  <td className="p-4 font-bold text-[#15232a] font-mono">₹{f.amount?.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-[#586d65]">{new Date(f.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-[11px] text-[#128bc0] font-semibold">{f.receiptNumber || 'Pending'}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      f.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#586d65]">No fee records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: GENERATE INVOICE ── */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="text-base font-bold font-serif text-[#15232a] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#128bc0]" />
                Generate Student Fee Invoice
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillFee}
                  className="px-2.5 py-1 rounded-lg bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d5e8f2] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Autofill fee invoice demo details"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setCreateModal(false)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs">✕</button>
              </div>
            </div>

            <form onSubmit={handleCreateFee} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#15232a] mb-1">Target Student *</label>
                <select
                  required
                  value={feeForm.student}
                  onChange={(e) => setFeeForm({ ...feeForm, student: e.target.value })}
                  className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s.user?._id || s._id} value={s.user?._id || s.user}>
                      {s.user?.name || s.enrollmentNumber} ({s.enrollmentNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#15232a] mb-1">Invoice Title *</label>
                <input
                  type="text"
                  required
                  value={feeForm.title}
                  onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0] font-medium cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-arch-primary text-xs px-5 py-2.5 rounded-xl"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
