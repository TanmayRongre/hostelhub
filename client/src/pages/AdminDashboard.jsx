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
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f6f0] text-[#15232a] font-sans flex flex-col relative">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-white text-[#15232a] border-[#d6e0d7]'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP BREADCRUMB & TELEMETRY BAR ── */}
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d6e0d7] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] flex items-center justify-center text-[#128bc0] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif text-[#15232a] tracking-tight">Admin Command Center</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] uppercase tracking-wider">
                  Global Control
                </span>
                <span className="text-xs text-[#586d65]">
                  • {navSections.flatMap((s) => s.items).find((n) => n.id === activeTab)?.label || 'Overview'}
                </span>
              </div>
              <p className="text-xs text-[#586d65] mt-0.5">System oversight, resident rosters, financial audits, and security telemetry.</p>
            </div>
          </div>

          {/* Right Telemetry Pills */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry Online</span>
            </div>

            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#d6e0d7] text-[#586d65] text-[11px] font-mono shadow-xs">
              <span>DB: {healthData?.database?.latencyMs || 3}ms</span>
            </div>

            <button
              onClick={loadAdminData}
              title="Refresh All Metrics"
              className="p-2 rounded-xl bg-white hover:bg-[#eef1ea] border border-[#d6e0d7] text-[#15232a] transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#128bc0]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN ADMIN WORKSPACE LAYOUT
          ════════════════════════════════════════════════ */}
      <div className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* ── Slide-Out Drawer Overlay Backdrop (Mobile Only) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LEFT ADMIN SIDEBAR (PERMANENT ON DESKTOP, DRAWER ON MOBILE) ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[#d6e0d7] shadow-[0_20px_50px_rgba(21,35,42,0.08)] p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:h-fit lg:rounded-2xl lg:border lg:border-[#d6e0d7] lg:bg-white lg:shadow-[0_4px_20px_rgba(21,35,42,0.04)] lg:sticky lg:top-24 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Admin Profile & Telemetry Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ebe4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e8f1f5] border border-[#bce4f6] flex items-center justify-center text-[#128bc0]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#15232a] tracking-wide">Command Center</div>
                  <div className="text-[10px] text-[#586d65] font-mono">Institutional Root</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-7 h-7 rounded-lg bg-[#f5f6f0] hover:bg-[#eef1ea] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs"
                title="Close Menu"
              >
                ✕
              </button>
            </div>

            {/* Profile Card */}
            <div className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0] font-serif font-bold text-base flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#15232a] truncate">{user?.name || 'Super Administrator'}</div>
                  <div className="text-[10px] font-mono text-[#128bc0] uppercase tracking-wide truncate">Main Campus HQ</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#e5ebe4] text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-[#dce5dc]">
                  <div className="text-[9px] uppercase tracking-wider text-[#586d65] font-semibold">Latency</div>
                  <div className="font-bold text-emerald-600">{healthData?.database?.latencyMs || 3}ms</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#dce5dc]">
                  <div className="text-[9px] uppercase tracking-wider text-[#586d65] font-semibold">Security</div>
                  <div className="font-bold text-[#128bc0] truncate">Zero-Trust</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#586d65] px-3 pb-1">
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
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                        active
                          ? 'bg-[#152c36] text-white font-bold shadow-md'
                          : 'text-[#586d65] hover:text-[#15232a] hover:bg-[#eef1ea]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`${active ? 'text-white' : 'text-[#128bc0] group-hover:scale-105'} transition-transform`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-white/20 text-white' : item.badgeColor || 'bg-[#e8f1f5] text-[#128bc0]'
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

          <div className="pt-2 border-t border-[#dce5dc] text-center shrink-0">
            <div className="text-[10px] text-[#586d65]">HostelHub Admin Suite v2.6</div>
          </div>
        </aside>

        {/* ── RIGHT MAIN CONTENT AREA (BESIDE PERMANENT SIDEBAR) ── */}
        <main className="flex-1 space-y-6 min-w-0 font-sans">
          {/* Mobile Navigation Trigger Bar (Shown only on small screens) */}
          <div className="lg:hidden p-3 rounded-2xl bg-white border border-[#d6e0d7] flex items-center justify-between shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#fbfbf9] border border-[#d6e0d7] text-[#15232a] text-xs font-semibold"
            >
              <Menu className="w-4 h-4 text-[#128bc0]" />
              <span>Menu: {navSections.flatMap((s) => s.items).find((n) => n.id === activeTab)?.label || 'Overview'}</span>
            </button>
            <span className="text-[11px] text-emerald-700 font-mono font-bold">Live Sync</span>
          </div>
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
