import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  QrCode,
  FileText,
  Key,
  CreditCard,
  Bell,
  UtensilsCrossed,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  DoorOpen,
  Search,
  Filter,
  Check,
  X,
  Phone,
  Plus,
  Menu,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import WardenAttendanceQRModal from '../components/warden/WardenAttendanceQRModal';

export default function WardenDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Warden Module States
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Post Notice Modal
  const [noticeModal, setNoticeModal] = useState(false);
  const [postingNotice, setPostingNotice] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'Rules & Discipline',
    priority: 'normal',
    targetAudience: 'students',
  });

  const handleDemoNoticeFill = () => {
    setNoticeForm({
      title: 'Night Gate Closure & Attendance Verification at 10:00 PM',
      content: 'All block residents are advised that hostel gates will be locked strictly at 10:00 PM tonight. Please ensure your digital floor attendance is marked on time.',
      category: 'Rules & Discipline',
      priority: 'high',
      targetAudience: 'students',
    });
  };

  const loadWardenData = async () => {
    setLoading(true);
    try {
      const [hostelsRes, roomsRes, studentsRes, compRes, leaveRes, visRes, attRes, notRes] = await Promise.allSettled([
        api.getHostels(),
        api.getRooms(),
        api.getStudents(),
        api.getComplaints(),
        api.getLeaves(),
        api.getVisitors(),
        api.getAttendance(),
        api.getNotices(),
      ]);

      if (hostelsRes.status === 'fulfilled' && hostelsRes.value.data) setHostels(hostelsRes.value.data);
      if (roomsRes.status === 'fulfilled' && roomsRes.value.data) setRooms(roomsRes.value.data);
      if (studentsRes.status === 'fulfilled' && studentsRes.value.data) setStudents(studentsRes.value.data);
      if (compRes.status === 'fulfilled' && compRes.value.data) setComplaints(compRes.value.data);
      if (leaveRes.status === 'fulfilled' && leaveRes.value.data) setLeaves(leaveRes.value.data);
      if (visRes.status === 'fulfilled' && visRes.value.data) setVisitors(visRes.value.data);
      if (attRes.status === 'fulfilled' && attRes.value.data) setAttendance(attRes.value.data);
      if (notRes.status === 'fulfilled' && notRes.value.data) setNotices(notRes.value.data);
    } catch (err) {
      showToast(err.message || 'Failed to load warden data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWardenData();
  }, []);

  const handleUpdateComplaint = async (id, status) => {
    setActionLoading(true);
    try {
      await api.updateComplaint(id, { status });
      showToast(`Complaint status updated to ${status}`);
      loadWardenData();
    } catch (err) {
      showToast(err.message || 'Failed to update complaint', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLeave = async (id, status) => {
    setActionLoading(true);
    try {
      await api.updateLeave(id, { status });
      showToast(`Leave application marked as ${status}`);
      loadWardenData();
    } catch (err) {
      showToast(err.message || 'Failed to update leave application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateVisitor = async (id, status) => {
    setActionLoading(true);
    try {
      await api.updateVisitor(id, { status });
      showToast(`Visitor gatepass request marked as ${status}`);
      loadWardenData();
    } catch (err) {
      showToast(err.message || 'Failed to update visitor pass', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      showToast('Please enter both notice title and content', 'error');
      return;
    }
    setPostingNotice(true);
    try {
      await api.createNotice(noticeForm);
      showToast('Hostel circular published successfully!');
      setNoticeModal(false);
      setNoticeForm({ title: '', content: '', category: 'Rules & Discipline', priority: 'normal', targetAudience: 'students' });
      await loadWardenData();
    } catch (err) {
      showToast(err.message || 'Failed to publish notice', 'error');
    } finally {
      setPostingNotice(false);
    }
  };

  const pendingComplaints = complaints.filter((c) => c.status !== 'resolved');
  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const pendingVisitors = visitors.filter((v) => v.status === 'pending');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <QrCode className="w-4 h-4" />, badge: attendance.length > 0 ? `${attendance.length}` : null },
    { id: 'complaints', label: 'Complaints', icon: <FileText className="w-4 h-4" />, badge: pendingComplaints.length > 0 ? `${pendingComplaints.length}` : null, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'leaves', label: 'Leave Applications', icon: <Key className="w-4 h-4" />, badge: pendingLeaves.length > 0 ? `${pendingLeaves.length}` : null, badgeColor: 'bg-[#c5a059]/20 text-[#dfba73]' },
    { id: 'visitors', label: 'Visitors', icon: <Users className="w-4 h-4" />, badge: pendingVisitors.length > 0 ? `${pendingVisitors.length}` : null, badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" />, badge: students.length > 0 ? `${students.length}` : null },
    { id: 'rooms', label: 'Rooms', icon: <DoorOpen className="w-4 h-4" /> },
    { id: 'notices', label: 'Notices', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#090b10] text-slate-100 font-sans flex flex-col relative">
      {/* Ambient Architectural Gradient Glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(197,160,89,0.06),transparent)] pointer-events-none" />

      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-950/95 text-rose-200 border-rose-700/60' : 'bg-[#0e1219] text-[#dfba73] border-[#c5a059]/40'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP BREADCRUMB & WARDEN DESK BANNER ── */}
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#dfba73] shadow-md shadow-[#c5a059]/10">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif text-white tracking-tight">Warden Control Desk</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 uppercase tracking-wider">
                  {navItems.find((n) => n.id === activeTab)?.label || 'Overview'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Hostel residency, leave applications, disciplinary grievances, and daily attendance.</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadWardenData}
              title="Refresh Records"
              className="p-2 rounded-lg bg-[#0e1219] hover:bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#dfba73]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="btn-arch-secondary px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Generate Daily QR</span>
            </button>

            <button
              onClick={() => setNoticeModal(true)}
              className="btn-arch-primary px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Circular</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* ── Slide-Out Drawer Overlay Backdrop (Mobile Only) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LEFT SIDEBAR (PERMANENT ON DESKTOP, DRAWER ON MOBILE) ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0c0f16] border-r border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:h-fit lg:rounded-2xl lg:border lg:border-white/[0.08] lg:bg-[#0e1219] lg:shadow-xl lg:sticky lg:top-24 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Warden Profile Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#dfba73]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">Warden Desk</div>
                  <div className="text-[10px] text-slate-400 font-mono">Administrative Control</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
                title="Close Menu"
              >
                ✕
              </button>
            </div>

            {/* Profile Dossier */}
            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/[0.08] space-y-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#181d28] border border-[#c5a059]/40 text-[#dfba73] font-serif font-bold text-base flex items-center justify-center shadow-md">
                    {user?.name?.charAt(0) || 'W'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121620]" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user?.name || 'Chief Warden'}</div>
                  <div className="text-[10px] font-mono text-[#dfba73]/90 uppercase tracking-wide truncate">{hostels[0]?.name || 'Sahyadri Block A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-[11px]">
                <div className="p-2 rounded-lg bg-[#090b10] border border-white/[0.05]">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Residents</div>
                  <div className="font-bold text-white">{students.length} Allotted</div>
                </div>
                <div className="p-2 rounded-lg bg-[#090b10] border border-white/[0.05]">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Active Leaves</div>
                  <div className="font-bold text-[#dfba73] truncate">{pendingLeaves.length} Pending</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Warden Modules
            </div>
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                    active
                      ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-md shadow-[#c5a059]/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`${active ? 'text-[#090b10]' : 'text-slate-400 group-hover:text-[#dfba73] group-hover:scale-110'} transition-all`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active ? 'bg-[#090b10]/20 text-[#090b10]' : item.badgeColor || 'bg-white/[0.06] text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/[0.08] space-y-2 shrink-0">
            <button
              onClick={() => {
                setSidebarOpen(false);
                setQrModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#dfba73] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Generate Daily QR</span>
            </button>

            <button
              onClick={() => {
                setSidebarOpen(false);
                setNoticeModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Broadcast Circular</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT (BESIDE PERMANENT SIDEBAR) ── */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Mobile Navigation Trigger Bar (Shown only on small screens) */}
          <div className="lg:hidden p-3 rounded-xl bg-[#0e1219] border border-white/[0.08] flex items-center justify-between shadow-md">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#121620] border border-white/10 text-slate-200 text-xs font-semibold"
            >
              <Menu className="w-4 h-4 text-[#dfba73]" />
              <span>Menu: {navItems.find((n) => n.id === activeTab)?.label || 'Overview'}</span>
            </button>
            <span className="text-[11px] text-[#dfba73] font-mono">{students.length} Residents</span>
          </div>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] hover:border-[#c5a059]/30 transition-all space-y-1">
                  <span className="text-xs text-slate-400">Total Residents</span>
                  <div className="text-2xl font-black text-white">{students.length}</div>
                  <span className="text-[10px] text-[#dfba73]">Allotted Students</span>
                </div>
                <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] hover:border-[#c5a059]/30 transition-all space-y-1">
                  <span className="text-xs text-slate-400">Pending Leaves</span>
                  <div className="text-2xl font-black text-[#dfba73]">{pendingLeaves.length}</div>
                  <span className="text-[10px] text-[#dfba73]">Requires Clearance</span>
                </div>
                <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] hover:border-[#c5a059]/30 transition-all space-y-1">
                  <span className="text-xs text-slate-400">Open Complaints</span>
                  <div className="text-2xl font-black text-amber-400">{pendingComplaints.length}</div>
                  <span className="text-[10px] text-amber-400">Maintenance & Room</span>
                </div>
                <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] hover:border-[#c5a059]/30 transition-all space-y-1">
                  <span className="text-xs text-slate-400">Today's Visitors</span>
                  <div className="text-2xl font-black text-emerald-400">{visitors.length}</div>
                  <span className="text-[10px] text-emerald-400">Guest Passes</span>
                </div>
              </div>

              {/* Pending Approvals Section */}
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#dfba73]" />
                  Leave Application Review Queue ({pendingLeaves.length})
                </h3>

                {pendingLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {pendingLeaves.map((l) => (
                      <div key={l._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-white text-sm">{l.student?.name || 'Resident Student'} ({l.leaveType})</div>
                          <div className="text-slate-400 mt-0.5">Destination: {l.destination} · Reason: {l.reason}</div>
                          <div className="text-[11px] text-slate-500">Departure: {new Date(l.fromDate).toLocaleDateString()}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateLeave(l._id, 'approved')}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            ✓ Approve Leave
                          </button>
                          <button
                            onClick={() => handleUpdateLeave(l._id, 'rejected')}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    All leave applications have been cleared.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LEAVE APPLICATIONS */}
          {activeTab === 'leaves' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#dfba73]" />
                      Student Leave Applications & Permissions
                    </h3>
                    <p className="text-xs text-slate-400">Review, verify, and approve resident leave applications</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 self-start sm:self-auto">
                    {pendingLeaves.length} Pending Review
                  </span>
                </div>

                {leaves.length > 0 ? (
                  <div className="space-y-3">
                    {leaves.map((l) => (
                      <div key={l._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 font-bold uppercase text-[10px]">
                              {l.leaveType}
                            </span>
                            <span className="font-bold text-white text-sm">{l.student?.name || 'Resident Student'}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            l.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : l.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {l.status === 'approved' ? 'Approved' : l.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>

                        <p className="text-slate-300">Destination: <strong className="text-white">{l.destination}</strong> · Reason: {l.reason}</p>

                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/[0.08] text-[11px] text-slate-400 gap-2">
                          <div>
                            Departure Date: <strong className="text-white">{new Date(l.fromDate).toLocaleDateString()}</strong> · Return Date: <strong className="text-white">{new Date(l.toDate).toLocaleDateString()}</strong>
                          </div>

                          {l.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateLeave(l._id, 'approved')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                              >
                                ✓ Approve Leave
                              </button>
                              <button
                                onClick={() => handleUpdateLeave(l._id, 'rejected')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold text-xs cursor-pointer transition-colors"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No leave applications submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: VISITOR CLEARANCES */}
          {activeTab === 'visitors' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#dfba73]" />
                      Guest & Visitor Gatepass Clearances
                    </h3>
                    <p className="text-xs text-slate-400">Review parent and guest entrance requests submitted by hostel residents</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                    {pendingVisitors.length} Pending Approval
                  </span>
                </div>

                {visitors.length > 0 ? (
                  <div className="space-y-3">
                    {visitors.map((v) => (
                      <div key={v._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 font-mono font-bold text-[10px]">
                              {v.passNumber}
                            </span>
                            <span className="font-bold text-white text-sm">{v.visitorName} ({v.relationship})</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            v.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : v.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {v.status === 'approved' ? 'Approved' : v.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>

                        <p className="text-slate-300">Purpose: {v.purpose}</p>

                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/[0.08] text-[11px] text-slate-400 gap-2">
                          <div>
                            Resident Host: <strong className="text-white">{v.student?.name || 'Student'}</strong> · Phone: <strong className="text-slate-300">{v.phone}</strong> · Visit Date: <strong className="text-white">{new Date(v.visitDate).toLocaleDateString()}</strong>
                          </div>

                          {v.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateVisitor(v._id, 'approved')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                              >
                                ✓ Approve Pass
                              </button>
                              <button
                                onClick={() => handleUpdateVisitor(v._id, 'rejected')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No visitor gatepass requests submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Hostel Grievance & Maintenance Tickets
                </h3>

                {complaints.length > 0 ? (
                  complaints.map((c) => (
                    <div key={c._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
                            {c.category}
                          </span>
                          <span className="font-bold text-white text-sm">{c.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <p className="text-slate-300">{c.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[11px] text-slate-400">
                        <span>Resident: <strong className="text-white">{c.student?.name || 'Student'}</strong></span>
                        <div className="flex items-center gap-2">
                          {c.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateComplaint(c._id, 'resolved')}
                              className="btn-arch-primary px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              ✓ Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">No active complaints.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <div>
                    <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#dfba73]" />
                      Daily Floor Attendance Stream
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Generate and project the active hostel terminal QR code for residents to scan
                    </p>
                  </div>

                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="btn-arch-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Display Terminal QR</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {attendance.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No attendance scans recorded today yet. Click "Display Terminal QR" to project the QR code.
                    </div>
                  ) : (
                    attendance.map((att) => (
                      <div key={att._id} className="p-3.5 rounded-lg bg-[#121620] border border-white/[0.08] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{att.student?.name || 'Resident Student'}</div>
                          <div className="text-[11px] text-slate-500">{new Date(att.date).toLocaleString()} · {att.remarks || 'QR Code Verified'}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold uppercase text-[10px]">
                          ✓ {att.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: RESIDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#dfba73]" />
                  Allotted Hostel Residents ({students.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map((s) => (
                    <div key={s._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] text-xs space-y-1">
                      <div className="font-bold text-white text-sm">{s.user?.name || s.enrollmentNumber}</div>
                      <div className="text-slate-400">Roll: {s.enrollmentNumber} · Dept: {s.department}</div>
                      <div className="text-[#dfba73] font-semibold">Room #{s.room?.roomNumber || '101'} · Bed {s.bed?.bedNumber || 'B-1'}</div>
                      <div className="text-slate-500 text-[11px] pt-1">Parent: {s.parentName || 'N/A'} ({s.parentPhone || 'N/A'})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-[#dfba73]" />
                  Hostel Room Allotments & Bed Vacancies
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {rooms.map((r) => (
                    <div key={r._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] hover:border-[#c5a059]/30 transition-all text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm font-mono">#{r.roomNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 font-bold uppercase">{r.type}</span>
                      </div>
                      <div className="text-slate-400">Floor {r.floor} · {r.capacity} Beds</div>
                      <div className="text-emerald-400 font-mono font-bold">₹{r.rentPerMonth?.toLocaleString('en-IN')}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#dfba73]" />
                    Hostel Circulars & Announcements
                  </h3>
                  <button
                    onClick={() => setNoticeModal(true)}
                    className="btn-arch-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Notice</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {notices.map((n) => (
                    <div key={n._id} className="p-4 rounded-lg bg-[#121620] border border-white/[0.08] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{n.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">{n.priority}</span>
                      </div>
                      <p className="text-slate-300">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL: POST NOTICE ── */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0e1219] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-white tracking-tight flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#dfba73]" />
                  Post Hostel Circular
                </h3>
                <button
                  type="button"
                  onClick={handleDemoNoticeFill}
                  className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Autofill demonstration circular"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Auto Fill Demo</span>
                </button>
              </div>
              <button onClick={() => setNoticeModal(false)} className="w-7 h-7 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Night Gate Closure at 10:00 PM"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full p-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  >
                    <option value="Rules & Discipline">Rules & Discipline</option>
                    <option value="General">General Notice</option>
                    <option value="Mess">Mess & Food</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full p-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Important (High)</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter circular details..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full p-2.5 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setNoticeModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingNotice}
                  className="btn-arch-primary px-5 py-2.5 rounded-lg disabled:opacity-50 text-xs font-bold cursor-pointer flex items-center gap-2"
                >
                  {postingNotice && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                  <span>{postingNotice ? 'Publishing...' : 'Broadcast Circular'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WARDEN ATTENDANCE QR TERMINAL MODAL ── */}
      <WardenAttendanceQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        hostel={hostels[0]}
        attendanceList={attendance}
      />
    </div>
  );
}
