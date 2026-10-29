import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Table,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  CreditCard,
  FileText,
  Clock
} from 'lucide-react';
import api from '../../services/api';

export default function AdminReportsSection() {
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExportCSV = async (reportType, filename) => {
    setExporting(true);
    try {
      const res = await api.getAdminReports(reportType);
      const data = res.data || [];
      if (data.length === 0) {
        showToast('No records available to export for this report', 'error');
        return;
      }

      // Convert JSON to CSV
      const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${filename}.csv successfully!`);
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const reportModules = [
    {
      id: 'students',
      name: 'Student Residency Roster',
      desc: 'Complete directory of all admitted students, enrollment numbers, rooms, and guardian contacts.',
      icon: <Users className="w-5 h-5 text-[#dfba73]" />,
      filename: 'hostelhub_students_roster',
    },
    {
      id: 'occupancy',
      name: 'Hostel & Bed Occupancy Report',
      desc: 'Summary of all hostel complexes, room allotment states, capacity, and current vacancy counts.',
      icon: <Building2 className="w-5 h-5 text-[#dfba73]" />,
      filename: 'hostelhub_occupancy_report',
    },
    {
      id: 'finance',
      name: 'Financial Ledger & Invoices',
      desc: 'All student semester fee records, collected amounts, payment reference IDs, and outstanding dues.',
      icon: <CreditCard className="w-5 h-5 text-[#dfba73]" />,
      filename: 'hostelhub_financial_ledger',
    },
    {
      id: 'complaints',
      name: 'Grievance & Resolution Log',
      desc: 'Audit of all maintenance tickets, categories, turnaround times, and resolution logs.',
      icon: <FileText className="w-5 h-5 text-[#dfba73]" />,
      filename: 'hostelhub_complaints_log',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-['Inter',sans-serif]">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-950/95 text-rose-200 border-rose-700/60' : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/60'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div>
          <h2 className="text-xl font-bold text-[#15232a] font-sans flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-[#128bc0]" />
            Executive Reports & Data Export Center
          </h2>
          <p className="text-xs text-[#586d65] mt-1">Generate compliance-ready CSV datasets and administrative audit reports.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-arch-secondary text-xs px-4 py-2 flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#128bc0]" />
          <span>Print Summary</span>
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportModules.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-2xl bg-white border border-[#d6e0d7] space-y-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(21,35,42,0.04)]"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0]">
                  {rep.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#15232a] font-sans">{rep.name}</h3>
                  <span className="text-[10px] text-[#128bc0] font-mono">Format: .CSV / Excel</span>
                </div>
              </div>
              <p className="text-xs text-[#586d65] leading-relaxed">{rep.desc}</p>
            </div>

            <div className="pt-3 border-t border-[#dce5dc] flex justify-end">
              <button
                onClick={() => handleExportCSV(rep.id, rep.filename)}
                disabled={exporting}
                className="btn-arch-primary text-xs px-4 py-2 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dataset (.CSV)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
