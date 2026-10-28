import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Building,
  Phone,
  Home,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Receipt,
  Info
} from 'lucide-react';
import api from '../../services/api';

export default function AdmissionModal({ isOpen, onClose, onSuccess, initialUser }) {
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    hostelId: '',
    roomType: 'AC', // 'AC' | 'Non-AC' | 'Deluxe'
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    paymentOption: 'full', // 'full' | 'installment'
  });

  const [hostels, setHostels] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fee calculation logic
  const getFeeStructure = () => {
    let roomRentMonthly = 6500;
    if (formData.roomType === 'Non-AC') roomRentMonthly = 4500;
    if (formData.roomType === 'Deluxe') roomRentMonthly = 7500;

    const semesterMonths = 6;
    const roomRentSem = roomRentMonthly * semesterMonths;
    const messFeeSem = 24000; // 4000/mo
    const cautionDeposit = 5000; // Refundable
    const utilityFee = 2500; // Wi-Fi & Maintenance

    const totalFee = roomRentSem + messFeeSem + cautionDeposit + utilityFee;
    const firstInstallment = Math.round(totalFee * 0.6);

    return {
      roomRentMonthly,
      roomRentSem,
      messFeeSem,
      cautionDeposit,
      utilityFee,
      totalFee,
      firstInstallment,
    };
  };

  const feeCalc = getFeeStructure();

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (!formData.enrollmentNumber) {
        setFormData((prev) => ({
          ...prev,
          enrollmentNumber: `CS2026-${Math.floor(100 + Math.random() * 900)}`,
        }));
      }

      const fetchHostels = async () => {
        try {
          const res = await api.getHostels();
          if (res.data && res.data.length > 0) {
            setHostels(res.data);
            setFormData((prev) => ({ ...prev, hostelId: res.data[0]._id }));
          }
        } catch {
          // Fallback handled on backend
        }
      };
      fetchHostels();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.enrollmentNumber.trim()) {
      setError('Please provide a valid enrollment ID');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide student contact number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.admitStudent({
        ...formData,
        calculatedTotalFee: feeCalc.totalFee,
      });
      if (res.success) {
        onSuccess(res.student, res.message);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit admission details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofillAdmission = () => {
    setFormData((prev) => ({
      ...prev,
      phone: '+91 98765 12340',
      parentName: 'Rajesh Sharma',
      parentPhone: '+91 98765 09876',
      address: 'Plot 42, Green Avenue, Sector 5, Kothrud, Pune, Maharashtra 411038',
      roomType: 'AC',
      paymentOption: 'full',
      enrollmentNumber: prev.enrollmentNumber || `CS2026-${Math.floor(100 + Math.random() * 900)}`,
    }));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-[#0e1219] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-[#121620] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#dfba73]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-white tracking-tight flex items-center gap-2">
                Hostel Admission &amp; Allotment
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 font-sans font-semibold uppercase tracking-wider">
                  Session 2026
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Review fee breakdown and confirm admission to receive immediate room and bed allotment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutofillAdmission}
              className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Autofill demonstration student admission details"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Auto Fill Demo</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Account Summary */}
          <div className="p-3.5 bg-[#121620] border border-white/[0.08] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059] text-[#090b10] font-serif font-bold text-base flex items-center justify-center shadow-md shadow-[#c5a059]/20">
                {initialUser?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{initialUser?.name || 'Student Resident'}</div>
                <div className="text-xs text-slate-400">{initialUser?.email}</div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Eligible for Admission
            </span>
          </div>

          {/* Section 1: Academic & Hostel Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#dfba73] uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <BookOpen className="w-3.5 h-3.5 text-[#dfba73]" />
              1. Student & Hostel Allotment Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Enrollment ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enrollment / Roll ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS2026-084"
                  value={formData.enrollmentNumber}
                  onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73] focus:ring-1 focus:ring-[#dfba73]/20 uppercase"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department / Branch *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Electronics & Telecom">Electronics & Telecom</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Academic Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                </select>
              </div>

              {/* Preferred Hostel Block */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hostel Complex / Block *
                </label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                >
                  {hostels.length > 0 ? (
                    hostels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.gender === 'girls' ? 'Girls' : 'Boys'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Sahyadri Boys Hostel (Block A)</option>
                      <option value="">Nilgiri Girls Hostel (Block B)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Room Type Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Room Accommodation Type (Affects Fees)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'AC', label: 'AC Double Sharing', price: '₹6,500/mo', desc: 'Air Conditioning, 2 Study Tables, Attached Bath' },
                    { id: 'Non-AC', label: 'Non-AC Standard', price: '₹4,500/mo', desc: 'Ceiling Fan, Attached Balcony, 3 Sharing' },
                    { id: 'Deluxe', label: 'Deluxe Suite', price: '₹7,500/mo', desc: 'Premium AC, Attached Geyser, Balcony' },
                  ].map((rt) => (
                    <div
                      key={rt.id}
                      onClick={() => setFormData({ ...formData, roomType: rt.id })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.roomType === rt.id
                          ? 'bg-[#c5a059]/10 border-[#c5a059] shadow-md shadow-[#c5a059]/10 text-white'
                          : 'bg-[#121620] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{rt.label}</span>
                        <span className="text-[11px] font-extrabold text-[#dfba73] font-mono">{rt.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{rt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Guardian Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#dfba73] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#dfba73]" />
              2. Contact & Emergency Guardian Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Student Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Parent Emergency Contact
                </label>
                <input
                  type="tel"
                  placeholder="+91 91234 56789"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Permanent Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white text-xs focus:outline-none focus:border-[#dfba73]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: COMPLETE TRANSPARENT FEE BREAKDOWN */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#dfba73]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Itemized Hostel Fee Structure (Semester 1)
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Duration: 6 Months Academic Session
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.08]">
                <span className="text-slate-300 flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Room Accommodation ({formData.roomType} · ₹{feeCalc.roomRentMonthly.toLocaleString('en-IN')}/mo × 6 mos)</span>
                </span>
                <span className="font-mono font-bold text-white">₹{feeCalc.roomRentSem.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.08]">
                <span className="text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Central Mess & Meal Plan (4 Meals Daily · ₹4,000/mo × 6 mos)</span>
                </span>
                <span className="font-mono font-bold text-white">₹{feeCalc.messFeeSem.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.08]">
                <span className="text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refundable Caution Security Deposit (Returned on Graduation)</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">₹{feeCalc.cautionDeposit.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/[0.08]">
                <span className="text-slate-300 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>High-Speed Wi-Fi, Gym & Maintenance Utilities</span>
                </span>
                <span className="font-mono font-bold text-white">₹{feeCalc.utilityFee.toLocaleString('en-IN')}</span>
              </div>

              {/* Total Calculation Row */}
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#dfba73]" />
                  Total Admission Payable Dues:
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ₹{feeCalc.totalFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0e1219] border border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#dfba73] shrink-0" />
                Fee invoice will be automatically generated in your Student Portal upon admission.
              </span>
              <span className="text-emerald-400 font-medium">Digital Receipt Available</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-arch-primary px-7 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Processing Admission & Allotting Room...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Admission (₹{feeCalc.totalFee.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
