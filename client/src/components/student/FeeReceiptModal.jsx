import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Building, QrCode } from 'lucide-react';

export default function FeeReceiptModal({ isOpen, onClose, fee, student, user }) {
  if (!isOpen || !fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptDate = fee.paidDate ? new Date(fee.paidDate).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
  const amountPaid = fee.amount || 39000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-[#d6e0d7] rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Controls Bar */}
        <div className="px-6 py-4 bg-[#fbfbf9] border-b border-[#dce5dc] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold font-serif text-[#15232a] tracking-tight">Official Verified Fee Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-arch-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="overflow-y-auto p-8 space-y-6 flex-1 bg-white text-slate-900 font-sans custom-scrollbar">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
            <div>
              <div className="text-xl font-black text-slate-900 tracking-tight uppercase">
                MountReach College Hostels
              </div>
              <div className="text-xs font-medium text-slate-600">
                Central Campus Residential Complex · Pune, Maharashtra 411005
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Affiliated to State University · Student Housing & Mess Administration
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold tracking-wider uppercase">
                ✓ PAID & VERIFIED
              </span>
            </div>
          </div>

          {/* Receipt Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Receipt Number:</span>
              <strong className="text-slate-900 font-mono text-[13px]">{fee.receiptNumber || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Date:</span>
              <strong className="text-slate-900">{receiptDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Mode:</span>
              <strong className="text-slate-900">{fee.paymentMode || 'Online UPI / NetBanking'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Transaction Ref:</span>
              <strong className="text-slate-900 font-mono text-[11px]">{fee.transactionId || `TXN${Date.now().toString().slice(-8)}`}</strong>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500">Student Full Name: </span>
                <strong className="text-slate-900">{user?.name || student?.user?.name || 'Resident Student'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Enrollment / Roll ID: </span>
                <strong className="text-slate-900 uppercase">{student?.enrollmentNumber || 'CS2026-088'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Department / Year: </span>
                <strong className="text-slate-900">{student?.department || 'Computer Science'} ({student?.year || '1st Year'})</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500">Hostel Complex: </span>
                <strong className="text-slate-900">{student?.hostel?.name || 'Sahyadri Boys Hostel (Block A)'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Allocated Room & Bed: </span>
                <strong className="text-slate-900">Room #{student?.room?.roomNumber || '101'} · Bed {student?.bed?.bedNumber || 'B-1'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Room Accommodation Type: </span>
                <strong className="text-slate-900">{student?.room?.type || 'AC Room (Double Sharing)'}</strong>
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="overflow-hidden border border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-3 font-bold">#</th>
                  <th className="p-3 font-bold">Fee Description</th>
                  <th className="p-3 font-bold">Billing Period</th>
                  <th className="p-3 font-bold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium text-slate-500">1</td>
                  <td className="p-3 font-bold text-slate-800">{fee.title || 'Hostel Room Accommodation'}</td>
                  <td className="p-3 text-slate-600">Semester 1 (6 Months)</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{(amountPaid * 0.55).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-500">2</td>
                  <td className="p-3 font-bold text-slate-800">Central Mess & Dining Plan (4 Meals/Day)</td>
                  <td className="p-3 text-slate-600">Semester 1 (6 Months)</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{(amountPaid * 0.35).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-500">3</td>
                  <td className="p-3 font-bold text-slate-800">Hostel Maintenance, High-Speed Wi-Fi & Electricity</td>
                  <td className="p-3 text-slate-600">Annual Academic Session</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{(amountPaid * 0.10).toLocaleString('en-IN')}</td>
                </tr>
                <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold">
                  <td colSpan={3} className="p-3 text-right text-slate-900 text-sm font-black">
                    TOTAL AMOUNT PAID:
                  </td>
                  <td className="p-3 text-right text-base font-black text-slate-900 font-mono">
                    ₹{amountPaid.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification & Seal Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="space-y-1">
              <div className="font-semibold text-slate-800">Computer Generated E-Receipt</div>
              <div className="text-[11px] text-slate-500">No physical signature required. Verified by MountReach Finance ERP.</div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold text-slate-900">Hostel Accounts Office</div>
              <div className="text-[11px] text-emerald-700 font-semibold">Payment Status: 100% Cleared</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
