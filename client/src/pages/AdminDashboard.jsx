import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  Building2,
  BedDouble,
  Activity,
  CreditCard,
  Bell,
  UtensilsCrossed,
  FileSpreadsheet,
  Server,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Key,
  QrCode,
  Sliders,
  DollarSign,
  Inbox
} from 'lucide-react';

// Modular Admin Sections
import AdminOverviewSection from '../components/admin/AdminOverviewSection';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminHostelManagement from '../components/admin/AdminHostelManagement';
import AdminOperationsSection from '../components/admin/AdminOperationsSection';
import AdminFinanceSection from '../components/admin/AdminFinanceSection';
import AdminNoticesSection from '../components/admin/AdminNoticesSection';
import AdminMessSection from '../components/admin/AdminMessSection';
import AdminAuditLogsSection from '../components/admin/AdminAuditLogsSection';
import AdminSystemHealthSection from '../components/admin/AdminSystemHealthSection';
import AdminReportsSection from '../components/admin/AdminReportsSection';
import AdminContactInquiries from '../components/admin/AdminContactInquiries';

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live Admin Overview Data
  const [overviewStats, setOverviewStats] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, healthRes] = await Promise.allSettled([
        api.getAdminOverview(),
        api.getSystemHealth(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data) {
        setOverviewStats(overviewRes.value.data);
      }
      if (healthRes.status === 'fulfilled' && healthRes.value.data) {
        setHealthData(healthRes.value.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      showToast(err.message || 'Failed to refresh admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Categorized Sidebar Navigation Items
  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      group: 'USER GOVERNANCE',
      items: [
        { id: 'users', label: 'Students & Wardens', icon: <Users className="w-4 h-4" />, badge: overviewStats?.kpis?.totalStudents },
      ],
    },
    {
      group: 'INFRASTRUCTURE',
      items: [
        { id: 'hostels', label: 'Hostels & Blocks', icon: <Building2 className="w-4 h-4" />, badge: overviewStats?.kpis?.totalHostels },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { id: 'complaints', label: 'Complaints', icon: <FileText className="w-4 h-4" />, badge: overviewStats?.kpis?.openComplaints, badgeColor: 'bg-amber-500/20 text-amber-300' },
        { id: 'leaves', label: 'Leave Applications', icon: <Key className="w-4 h-4" />, badge: overviewStats?.kpis?.pendingLeaves, badgeColor: 'bg-[#c5a059]/20 text-[#dfba73]' },
        { id: 'visitors', label: 'Visitor Permits', icon: <Users className="w-4 h-4" /> },
        { id: 'attendance', label: 'Global Attendance', icon: <QrCode className="w-4 h-4" /> },
      ],
    },
    {
      group: 'FINANCE & BILLING',
      items: [
        { id: 'finance', label: 'Fees & Revenue', icon: <CreditCard className="w-4 h-4" /> },
      ],
    },
    {
      group: 'COMMUNICATION & HELPDESK',
      items: [
        { id: 'inquiries', label: 'Contact Inquiries', icon: <Inbox className="w-4 h-4" />, badge: overviewStats?.kpis?.openContactTickets, badgeColor: 'bg-[#c5a059]/20 text-[#dfba73]' },
        { id: 'notices', label: 'Announcements Hub', icon: <Bell className="w-4 h-4" /> },
        { id: 'mess', label: 'Mess & Dining Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
      ],
    },
    {
      group: 'ANALYTICS & COMPLIANCE',
      items: [
        { id: 'reports', label: 'Reports & Export', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: 'audit-logs', label: 'Security Audit Logs', icon: <Activity className="w-4 h-4" /> },
        { id: 'health', label: 'System Health', icon: <Server className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#090b10] text-slate-100 font-sans flex flex-col relative">
      {/* Ambient Architectural Gradient Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(197,160,89,0.06),transparent)] pointer-events-none" />

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-700/60'
              : 'bg-[#0e1219] text-[#dfba73] border-[#c5a059]/40'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP BREADCRUMB & TELEMETRY BAR ── */}
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0e1219] hover:bg-[#141923] border border-white/10 hover:border-[#c5a059]/40 text-slate-200 transition-all cursor-pointer shadow-md group active:scale-95 shrink-0"
              aria-label="Toggle admin command menu"
              title="Open Admin Command Menu"
            >
              <div className="w-7 h-7 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#dfba73] flex items-center justify-center group-hover:bg-[#c5a059]/25 transition-all">
                <Menu className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Command Menu</div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{navSections.flatMap((s) => s.items).find((n) => n.id === activeTab)?.label || 'Overview'}</span>
                  <ChevronRight className="w-3 h-3 text-[#dfba73]" />
                </div>
              </div>
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#dfba73] shadow-md shadow-[#c5a059]/10">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif text-white tracking-tight">Admin Command Center</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 uppercase tracking-wider">
                  Global Control
                </span>
              </div>
              <p className="text-xs text-slate-400">System oversight, resident rosters, financial audits, and security telemetry.</p>
            </div>
          </div>

          {/* Right Telemetry Pills */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Online</span>
            </div>

            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1219] border border-white/[0.08] text-slate-400 text-[11px] font-mono">
              <span>DB: {healthData?.database?.latencyMs || 3}ms</span>
            </div>

            <button
              onClick={loadAdminData}
              title="Refresh All Metrics"
              className="p-2 rounded-lg bg-[#0e1219] hover:bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#dfba73]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN ADMIN WORKSPACE LAYOUT
          ════════════════════════════════════════════════ */}
      <div className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* ── Slide-Out Drawer Overlay Backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LEFT ADMIN SIDEBAR DRAWER ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0c0f16] border-r border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 flex flex-col justify-between overflow-y-auto space-y-4 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#dfba73]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">Command Center Menu</div>
                <div className="text-[10px] text-slate-400 font-mono">Global Administration</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
              title="Close Menu"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
                  {sec.group}
                </div>

                {sec.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                        active
                          ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-md shadow-[#c5a059]/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`${active ? 'text-[#090b10]' : 'text-[#dfba73] group-hover:scale-105'} transition-transform`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-[#090b10]/20 text-[#090b10]' : item.badgeColor || 'bg-white/[0.06] text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.08] text-center shrink-0">
            <div className="text-[10px] text-slate-500">HostelHub Admin Suite v2.6</div>
          </div>
        </aside>

        {/* ── RIGHT MAIN CONTENT AREA (FULL WIDTH) ── */}
        <main className="w-full space-y-6 min-w-0">
          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <AdminOverviewSection stats={overviewStats} />
          )}

          {activeTab === 'users' && (
            <AdminUserManagement onUserUpdated={loadAdminData} />
          )}

          {activeTab === 'hostels' && (
            <AdminHostelManagement onHostelsUpdated={loadAdminData} />
          )}

          {(activeTab === 'complaints' || activeTab === 'leaves' || activeTab === 'visitors' || activeTab === 'attendance') && (
            <AdminOperationsSection
              key={activeTab}
              initialSubTab={activeTab}
              onSubTabChange={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'finance' && (
            <AdminFinanceSection onFinanceUpdated={loadAdminData} />
          )}

          {activeTab === 'inquiries' && (
            <AdminContactInquiries />
          )}

          {activeTab === 'notices' && (
            <AdminNoticesSection onNoticesUpdated={loadAdminData} />
          )}

          {activeTab === 'mess' && (
            <AdminMessSection />
          )}

          {activeTab === 'reports' && (
            <AdminReportsSection />
          )}

          {activeTab === 'audit-logs' && (
            <AdminAuditLogsSection />
          )}

          {activeTab === 'health' && (
            <AdminSystemHealthSection />
          )}
        </main>
      </div>
    </div>
  );
}
