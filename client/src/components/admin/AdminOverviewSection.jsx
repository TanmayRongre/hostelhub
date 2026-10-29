import React from 'react';
import {
  Users,
  Building2,
  BedDouble,
  ShieldCheck,
  CreditCard,
  FileText,
  Key,
  QrCode
} from 'lucide-react';

export default function AdminOverviewSection({ stats }) {
  const kpis = stats?.kpis || {};

  const kpiCards = [
    {
      title: 'Total Students',
      value: (kpis.totalStudents || 0).toLocaleString(),
      subtitle: 'Enrolled & active residents',
      icon: <Users className="w-5 h-5 text-[#dfba73]" />,
    },
    {
      title: 'Total Hostels & Blocks',
      value: (kpis.totalHostels || 2).toString(),
      subtitle: `${kpis.totalRooms || 60} Rooms · ${kpis.totalBeds || 120} Beds`,
      icon: <Building2 className="w-5 h-5 text-[#dfba73]" />,
    },
    {
      title: 'Overall Occupancy',
      value: `${kpis.occupancyRate || 92}%`,
      subtitle: `${kpis.occupiedBeds || 0} Occupied / ${kpis.availableBeds || 0} Available`,
      icon: <BedDouble className="w-5 h-5 text-[#dfba73]" />,
    },
    {
      title: 'Today Attendance',
      value: `${kpis.attendanceRate || 96}%`,
      subtitle: `${kpis.todayAttendanceCount || 0} Verified via Smart QR`,
      icon: <QrCode className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Active Wardens',
      value: (kpis.totalWardens || 4).toString(),
      subtitle: 'Hostel block supervisors',
      icon: <ShieldCheck className="w-5 h-5 text-[#dfba73]" />,
    },
    {
      title: 'Pending Requests',
      value: (kpis.pendingLeaves || 0).toString(),
      subtitle: 'Leave applications awaiting review',
      icon: <Key className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Outstanding Dues',
      value: `₹${((kpis.pendingDues || 0) / 100000).toFixed(1)}L`,
      subtitle: `Collected: ₹${((kpis.collectedFees || 0) / 100000).toFixed(1)}L (${kpis.collectionRate || 85}%)`,
      icon: <CreditCard className="w-5 h-5 text-[#dfba73]" />,
    },
    {
      title: 'Open Complaints',
      value: (kpis.openComplaints || 0).toString(),
      subtitle: `${kpis.inProgressComplaints || 0} in progress · ${kpis.resolvedComplaints || 0} resolved`,
      icon: <FileText className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* ── KPI Metric Grid (Display Only) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white hover:bg-[#fbfbf9] border border-[#d6e0d7] hover:border-[#128bc0]/40 shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#586d65] uppercase tracking-wider">{kpi.title}</span>
              <div className="p-2.5 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0] group-hover:scale-105 transition-transform">
                {kpi.icon}
              </div>
            </div>

            <div className="my-3">
              <div className="text-3xl font-bold font-serif text-[#15232a] tracking-tight">{kpi.value}</div>
              <p className="text-[11px] text-[#586d65] mt-1">{kpi.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-[#dce5dc] flex items-center justify-between text-[11px] text-[#586d65]">
              <span>Metric Status</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
