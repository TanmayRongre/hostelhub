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
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f6f0] text-[#15232a] font-sans flex flex-col relative">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-white text-[#15232a] border-[#d6e0d7]'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP BREADCRUMB & WARDEN DESK BANNER ── */}
      <div className="relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d6e0d7] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] flex items-center justify-center text-[#128bc0] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif text-[#15232a] tracking-tight">Warden Control Desk</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] uppercase tracking-wider">
                  {navItems.find((n) => n.id === activeTab)?.label || 'Overview'}
                </span>
              </div>
              <p className="text-xs text-[#586d65] mt-0.5">Hostel residency, leave applications, disciplinary grievances, and daily attendance.</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadWardenData}
              title="Refresh Records"
              className="p-2 rounded-xl bg-white hover:bg-[#eef1ea] border border-[#d6e0d7] text-[#15232a] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#128bc0]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-[#e8f1f5] text-[#163a49] border border-[#bce4f6] hover:bg-[#d8effa]"
            >
              <QrCode className="w-3.5 h-3.5 text-[#128bc0]" />
              <span>Generate Daily QR</span>
            </button>

            <button
              onClick={() => setNoticeModal(true)}
              className="px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-[#152c36] text-white hover:bg-[#128bc0]"
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LEFT SIDEBAR (PERMANENT ON DESKTOP, DRAWER ON MOBILE) ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[#d6e0d7] shadow-[0_20px_50px_rgba(21,35,42,0.08)] p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:h-fit lg:rounded-2xl lg:border lg:border-[#d6e0d7] lg:bg-white lg:shadow-[0_4px_20px_rgba(21,35,42,0.04)] lg:sticky lg:top-24 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Warden Profile Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5ebe4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e8f1f5] border border-[#bce4f6] flex items-center justify-center text-[#128bc0]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#15232a] tracking-wide">Warden Desk</div>
                  <div className="text-[10px] text-[#586d65] font-mono">Administrative Control</div>
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

            {/* Profile Dossier */}
            <div className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0] font-serif font-bold text-base flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0) || 'W'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#15232a] truncate">{user?.name || 'Chief Warden'}</div>
                  <div className="text-[10px] font-mono text-[#128bc0] uppercase tracking-wide truncate">{hostels[0]?.name || 'Sahyadri Block A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#e5ebe4] text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-[#dce5dc]">
                  <div className="text-[9px] uppercase tracking-wider text-[#586d65] font-semibold">Residents</div>
                  <div className="font-bold text-[#15232a]">{students.length} Allotted</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#dce5dc]">
                  <div className="text-[9px] uppercase tracking-wider text-[#586d65] font-semibold">Active Leaves</div>
                  <div className="font-bold text-[#128bc0] truncate">{pendingLeaves.length} Pending</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#586d65] px-3 mb-2">
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
                      ? 'bg-[#152c36] text-white font-bold shadow-md'
                      : 'text-[#586d65] hover:text-[#15232a] hover:bg-[#eef1ea]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`${active ? 'text-white' : 'text-[#586d65] group-hover:text-[#128bc0] group-hover:scale-110'} transition-all`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : item.badgeColor || 'bg-[#e8f1f5] text-[#128bc0]'
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
        <main className="flex-1 space-y-6 min-w-0 font-sans">
          {/* Mobile Navigation Trigger Bar (Shown only on small screens) */}
          <div className="lg:hidden p-3 rounded-2xl bg-white border border-[#d6e0d7] flex items-center justify-between shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#fbfbf9] border border-[#d6e0d7] text-[#15232a] text-xs font-semibold"
            >
              <Menu className="w-4 h-4 text-[#128bc0]" />
              <span>Menu: {navItems.find((n) => n.id === activeTab)?.label || 'Overview'}</span>
            </button>
            <span className="text-[11px] text-[#128bc0] font-mono font-bold">{students.length} Residents</span>
          </div>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] hover:border-[#128bc0]/40 shadow-[0_4px_20px_rgba(21,35,42,0.04)] transition-all space-y-1">
                  <span className="text-xs text-[#586d65]">Total Residents</span>
                  <div className="text-2xl font-black text-[#15232a] font-serif">{students.length}</div>
                  <span className="text-[10px] text-[#128bc0] font-semibold">Allotted Students</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] hover:border-[#128bc0]/40 shadow-[0_4px_20px_rgba(21,35,42,0.04)] transition-all space-y-1">
                  <span className="text-xs text-[#586d65]">Pending Leaves</span>
                  <div className="text-2xl font-black text-[#128bc0] font-serif">{pendingLeaves.length}</div>
                  <span className="text-[10px] text-[#128bc0] font-semibold">Requires Clearance</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] hover:border-[#128bc0]/40 shadow-[0_4px_20px_rgba(21,35,42,0.04)] transition-all space-y-1">
                  <span className="text-xs text-[#586d65]">Open Complaints</span>
                  <div className="text-2xl font-black text-amber-800 font-serif">{pendingComplaints.length}</div>
                  <span className="text-[10px] text-amber-700 font-semibold">Maintenance & Room</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] hover:border-[#128bc0]/40 shadow-[0_4px_20px_rgba(21,35,42,0.04)] transition-all space-y-1">
                  <span className="text-xs text-[#586d65]">Today's Visitors</span>
                  <div className="text-2xl font-black text-emerald-800 font-serif">{visitors.length}</div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Guest Passes</span>
                </div>
              </div>

              {/* Pending Approvals Section */}
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#128bc0]" />
                  Leave Application Review Queue ({pendingLeaves.length})
                </h3>

                {pendingLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {pendingLeaves.map((l) => (
                      <div key={l._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-[#15232a] text-sm">{l.student?.name || 'Resident Student'} ({l.leaveType})</div>
                          <div className="text-[#586d65] mt-0.5">Destination: {l.destination} · Reason: {l.reason}</div>
                          <div className="text-[11px] text-[#586d65]">Departure: {new Date(l.fromDate).toLocaleDateString()}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateLeave(l._id, 'approved')}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            ✓ Approve Leave
                          </button>
                          <button
                            onClick={() => handleUpdateLeave(l._id, 'rejected')}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#586d65]">
                    All leave applications have been cleared.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LEAVE APPLICATIONS */}
          {activeTab === 'leaves' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dce5dc] pb-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#128bc0]" />
                      Student Leave Applications & Permissions
                    </h3>
                    <p className="text-xs text-[#586d65]">Review, verify, and approve resident leave applications</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] self-start sm:self-auto">
                    {pendingLeaves.length} Pending Review
                  </span>
                </div>

                {leaves.length > 0 ? (
                  <div className="space-y-3">
                    {leaves.map((l) => (
                      <div key={l._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-bold uppercase text-[10px]">
                              {l.leaveType}
                            </span>
                            <span className="font-bold text-[#15232a] text-sm">{l.student?.name || 'Resident Student'}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            l.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : l.status === 'rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {l.status === 'approved' ? 'Approved' : l.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>

                        <p className="text-[#15232a]">Destination: <strong className="text-[#15232a]">{l.destination}</strong> · Reason: {l.reason}</p>

                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#dce5dc] text-[11px] text-[#586d65] gap-2">
                          <div>
                            Departure Date: <strong className="text-[#15232a]">{new Date(l.fromDate).toLocaleDateString()}</strong> · Return Date: <strong className="text-[#15232a]">{new Date(l.toDate).toLocaleDateString()}</strong>
                          </div>

                          {l.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateLeave(l._id, 'approved')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
                              >
                                ✓ Approve Leave
                              </button>
                              <button
                                onClick={() => handleUpdateLeave(l._id, 'rejected')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs cursor-pointer transition-colors"
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
                  <div className="p-8 text-center text-xs text-[#586d65]">
                    No leave applications submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: VISITOR CLEARANCES */}
          {activeTab === 'visitors' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dce5dc] pb-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#128bc0]" />
                      Guest & Visitor Gatepass Clearances
                    </h3>
                    <p className="text-xs text-[#586d65]">Review parent and guest entrance requests submitted by hostel residents</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] self-start sm:self-auto">
                    {pendingVisitors.length} Pending Approval
                  </span>
                </div>

                {visitors.length > 0 ? (
                  <div className="space-y-3">
                    {visitors.map((v) => (
                      <div key={v._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-mono font-bold text-[10px]">
                              {v.passNumber}
                            </span>
                            <span className="font-bold text-[#15232a] text-sm">{v.visitorName} ({v.relationship})</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            v.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : v.status === 'rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {v.status === 'approved' ? 'Approved' : v.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </div>

                        <p className="text-[#15232a]">Purpose: {v.purpose}</p>

                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#dce5dc] text-[11px] text-[#586d65] gap-2">
                          <div>
                            Resident Host: <strong className="text-[#15232a]">{v.student?.name || 'Student'}</strong> · Phone: <strong className="text-[#15232a]">{v.phone}</strong> · Visit Date: <strong className="text-[#15232a]">{new Date(v.visitDate).toLocaleDateString()}</strong>
                          </div>

                          {v.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateVisitor(v._id, 'approved')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                ✓ Approve Pass
                              </button>
                              <button
                                onClick={() => handleUpdateVisitor(v._id, 'rejected')}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer"
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
                  <div className="p-8 text-center text-xs text-[#586d65]">
                    No visitor gatepass requests submitted yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Hostel Grievance & Maintenance Tickets
                </h3>

                {complaints.length > 0 ? (
                  complaints.map((c) => (
                    <div key={c._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase text-[10px]">
                            {c.category}
                          </span>
                          <span className="font-bold text-[#15232a] text-sm">{c.title}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <p className="text-[#15232a]">{c.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#dce5dc] text-[11px] text-[#586d65]">
                        <span>Resident: <strong className="text-[#15232a]">{c.student?.name || 'Student'}</strong></span>
                        <div className="flex items-center gap-2">
                          {c.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateComplaint(c._id, 'resolved')}
                              className="btn-arch-primary px-3 py-1 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              ✓ Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#586d65]">No active complaints.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dce5dc] pb-4">
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#128bc0]" />
                      Daily Floor Attendance Stream
                    </h3>
                    <p className="text-xs text-[#586d65] mt-0.5">
                      Generate and project the active hostel terminal QR code for residents to scan
                    </p>
                  </div>

                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="btn-arch-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Display Terminal QR</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {attendance.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#586d65]">
                      No attendance scans recorded today yet. Click "Display Terminal QR" to project the QR code.
                    </div>
                  ) : (
                    attendance.map((att) => (
                      <div key={att._id} className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-[#15232a]">{att.student?.name || 'Resident Student'}</div>
                          <div className="text-[11px] text-[#586d65]">{new Date(att.date).toLocaleString()} · {att.remarks || 'QR Code Verified'}</div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase text-[10px]">
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
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#128bc0]" />
                  Allotted Hostel Residents ({students.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map((s) => (
                    <div key={s._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs space-y-1">
                      <div className="font-bold text-[#15232a] text-sm">{s.user?.name || s.enrollmentNumber}</div>
                      <div className="text-[#586d65]">Roll: {s.enrollmentNumber} · Dept: {s.department}</div>
                      <div className="text-[#128bc0] font-semibold">Room #{s.room?.roomNumber || '101'} · Bed {s.bed?.bedNumber || 'B-1'}</div>
                      <div className="text-[#586d65] text-[11px] pt-1">Parent: {s.parentName || 'N/A'} ({s.parentPhone || 'N/A'})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-[#128bc0]" />
                  Hostel Room Allotments & Bed Vacancies
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {rooms.map((r) => (
                    <div key={r._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] hover:border-[#128bc0]/40 transition-all text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#15232a] text-sm font-mono">#{r.roomNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-bold uppercase">{r.type}</span>
                      </div>
                      <div className="text-[#586d65]">Floor {r.floor} · {r.capacity} Beds</div>
                      <div className="text-emerald-700 font-mono font-bold">₹{r.rentPerMonth?.toLocaleString('en-IN')}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#128bc0]" />
                    Hostel Circulars & Announcements
                  </h3>
                  <button
                    onClick={() => setNoticeModal(true)}
                    className="btn-arch-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post Notice</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {notices.map((n) => (
                    <div key={n._id} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#15232a] text-sm">{n.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase">{n.priority}</span>
                      </div>
                      <p className="text-[#15232a]">{n.content}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#128bc0]" />
                  Post Hostel Circular
                </h3>
                <button
                  type="button"
                  onClick={handleDemoNoticeFill}
                  className="px-2.5 py-1 rounded-lg bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d5e8f2] border border-[#bce4f6] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                  title="Autofill demonstration circular"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
              </div>
              <button onClick={() => setNoticeModal(false)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] text-[#586d65] hover:text-[#15232a] border border-[#d6e0d7] flex items-center justify-center transition-colors cursor-pointer text-xs">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Night Gate Closure at 10:00 PM"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  >
                    <option value="Rules & Discipline">Rules & Discipline</option>
                    <option value="General">General Notice</option>
                    <option value="Mess">Mess & Food</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Emergency">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Important (High)</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter circular details..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setNoticeModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0] font-medium cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingNotice}
                  className="btn-arch-primary px-5 py-2.5 rounded-xl disabled:opacity-50 text-xs font-bold cursor-pointer flex items-center gap-2"
                >
                  {postingNotice && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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
