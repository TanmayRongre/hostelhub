import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  ShieldCheck,
  CreditCard,
  UtensilsCrossed,
  Key,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Send,
  RefreshCw,
  Search,
  ChevronRight,
  Bell,
  Calendar,
  Phone,
  User,
  MapPin,
  Sparkles,
  Download,
  Check,
  QrCode,
  Users,
  Eye,
  Camera,
  Activity,
  ArrowUpRight,
  Filter,
  Menu,
  X,
  LayoutDashboard,
  Home,
  Sun,
  Moon,
  Coffee,
  Flame,
  Table,
  LayoutGrid,
  ChefHat,
  Star,
  ThumbsUp
} from 'lucide-react';
import api from '../../services/api';
import FeeReceiptModal from './FeeReceiptModal';
import ScanAttendanceModal from './ScanAttendanceModal';
import RequestVisitorModal from './RequestVisitorModal';

export default function StudentDashboardView({ student, user, onRefresh, refreshKey }) {
  // Navigation Tabs: overview | attendance | complaints | leaves | visitors | fees | mess | notices
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Module Data States
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [fees, setFees] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [notices, setNotices] = useState([]);

  // Modals
  const [complaintModal, setComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: 'Electrical',
    priority: 'medium',
  });

  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'outpass',
    reason: '',
    fromDate: '',
    toDate: '',
    destination: '',
    emergencyContact: '',
  });

  const handleAutofillComplaint = () => {
    setComplaintForm({
      title: 'Study Table Light Socket Short-Circuiting',
      category: 'Electrical',
      priority: 'high',
      description: 'The primary electrical power socket above the study desk is sparking when plugging in the laptop charger. Needs immediate technician inspection for safety.',
    });
  };

  const handleAutofillLeave = () => {
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 3);

    setLeaveForm({
      leaveType: 'weekend',
      destination: 'Flat 402, Green Meadows, Kothrud, Pune',
      fromDate: today.toISOString().split('T')[0],
      toDate: returnDate.toISOString().split('T')[0],
      reason: 'Attending family cousin engagement ceremony and weekend stay with parents.',
      emergencyContact: '+91 98765 11223',
    });
  };

  const [scanAttendanceModal, setScanAttendanceModal] = useState(false);
  const [visitorModal, setVisitorModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null); // fee object
  const [payModal, setPayModal] = useState(null);
  const [paying, setPaying] = useState(false);

  // Mess Menu Day States
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const [selectedMessDay, setSelectedMessDay] = useState(todayDayName);
  const [messViewMode, setMessViewMode] = useState('daily'); // 'daily' | 'table'
  const [selectedMealFilter, setSelectedMealFilter] = useState('all'); // 'all' | 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'
  const [mealRatings, setMealRatings] = useState({});

  // Filters
  const [complaintFilter, setComplaintFilter] = useState('all');

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Sub-module Data
  const loadModuleData = async () => {
    setLoadingData(true);
    try {
      const [compRes, leaveRes, feeRes, visRes, attRes, messRes, notRes] = await Promise.allSettled([
        api.getComplaints(`student=${user?._id}`),
        api.getLeaves(`student=${user?._id}`),
        api.getFees(`student=${user?._id}`),
        api.getVisitors(`student=${user?._id}`),
        api.getAttendance(`student=${user?._id}`),
        api.getMess(),
        api.getNotices(),
      ]);

      if (compRes.status === 'fulfilled' && compRes.value.data) {
        setComplaints(compRes.value.data);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value.data) {
        setLeaves(leaveRes.value.data);
      }
      if (feeRes.status === 'fulfilled' && feeRes.value.data) {
        setFees(feeRes.value.data);
      }
      if (visRes.status === 'fulfilled' && visRes.value.data) {
        setVisitors(visRes.value.data);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data) {
        setAttendanceRecords(attRes.value.data);
      }
      if (messRes.status === 'fulfilled' && messRes.value.data) {
        setMessMenu(messRes.value.data);
      }
      if (notRes.status === 'fulfilled' && notRes.value.data) {
        setNotices(notRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching student module data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, [user?._id, refreshKey]);

  // Handle File Complaint Submit
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createComplaint({
        ...complaintForm,
        student: user?._id,
        hostel: student?.hostel?._id || student?.hostel,
        room: student?.room?._id || student?.room,
      });
      showToast('Grievance registered and assigned to Warden successfully!');
      setComplaintModal(false);
      setComplaintForm({ title: '', description: '', category: 'Electrical', priority: 'medium' });
      loadModuleData();
    } catch (err) {
      showToast(err.message || 'Failed to submit complaint', 'error');
    }
  };

  // Handle Leave Submit
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createLeave({
        ...leaveForm,
        student: user?._id,
        emergencyContact: leaveForm.emergencyContact || student?.parentPhone || student?.phone,
      });
      showToast('Digital Leave Application submitted for Warden approval!');
      setLeaveModal(false);
      setLeaveForm({
        leaveType: 'outpass',
        reason: '',
        fromDate: '',
        toDate: '',
        destination: '',
        emergencyContact: '',
      });
      loadModuleData();
    } catch (err) {
      showToast(err.message || 'Failed to apply for leave', 'error');
    }
  };

  // Handle Fee Payment
  const handleProcessPayment = async (feeId) => {
    setPaying(true);
    try {
      const res = await api.payFee(feeId, {
        paymentMode: 'Online (UPI/NetBanking)',
      });
      showToast('Payment successful! Opening receipt...');
      setPayModal(null);
      setViewingReceipt(res.data);
      loadModuleData();
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  // Today attendance status
  const todayStr = new Date().toDateString();
  const isPresentToday = attendanceRecords.some((a) => new Date(a.date).toDateString() === todayStr && a.status === 'present');

  // Metrics
  const pendingFees = fees.filter((f) => f.status === 'pending');
  const totalDues = pendingFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const activeLeaves = leaves.filter((l) => l.status === 'approved' || l.status === 'pending');
  const openComplaints = complaints.filter((c) => c.status === 'pending' || c.status === 'in_progress');

  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilter === 'all') return true;
    return c.status === complaintFilter;
  });

  // Simplified Navigation Items with Icons & Badges
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'attendance',
      label: 'Scan Attendance',
      icon: <QrCode className="w-4 h-4" />,
      badge: isPresentToday ? '✓ Present' : 'Pending',
      badgeColor: isPresentToday ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'complaints',
      label: 'Raise Complaint',
      icon: <FileText className="w-4 h-4" />,
      badge: openComplaints.length > 0 ? `${openComplaints.length}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'leaves',
      label: 'Leave Application',
      icon: <Key className="w-4 h-4" />,
      badge: activeLeaves.length > 0 ? `${activeLeaves.length}` : null,
      badgeColor: 'bg-[#c5a059]/20 text-[#dfba73]',
    },
    {
      id: 'visitors',
      label: 'Visitor Request',
      icon: <Users className="w-4 h-4" />,
      badge: visitors.length > 0 ? `${visitors.length}` : null,
      badgeColor: 'bg-white/10 text-slate-300',
    },
    {
      id: 'fees',
      label: 'Hostel Fees',
      icon: <CreditCard className="w-4 h-4" />,
      badge: totalDues > 0 ? `₹${totalDues > 1000 ? Math.round(totalDues/1000) + 'k' : totalDues}` : '✓ Paid',
      badgeColor: totalDues > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300',
    },
    { id: 'mess', label: 'Mess Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'notices', label: 'Notices', icon: <Bell className="w-4 h-4" />, badge: notices.length > 0 ? `${notices.length}` : null },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in relative">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-700/60'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/60'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Slide-Out Drawer Overlay Backdrop for Mobile Screens ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════
          DESKTOP PERMANENT SIDEBAR & MOBILE SLIDE DRAWER
          ════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0c0f16] border-r border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 flex flex-col justify-between overflow-y-auto space-y-5 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:h-fit lg:rounded-2xl lg:border lg:border-white/[0.08] lg:bg-[#0e1219] lg:shadow-xl lg:sticky lg:top-24 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Resident Dossier & Avatar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#dfba73]">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">Resident Desk</div>
                <div className="text-[10px] text-slate-400 font-mono">Roll: {student?.enrollmentNumber || 'CS2026-088'}</div>
              </div>
            </div>
            {/* Close button only on mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
              title="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* Student Profile Card */}
          <div className="p-3.5 rounded-xl bg-[#121620] border border-white/[0.08] space-y-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-[#181d28] border border-[#c5a059]/40 text-[#dfba73] font-serif font-bold text-base flex items-center justify-center shadow-md">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121620]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                <div className="text-[10px] font-mono text-[#dfba73]/90 uppercase tracking-wide truncate">{student?.hostel?.name || 'Campus Residence'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.06] text-[11px]">
              <div className="p-2 rounded-lg bg-[#090b10] border border-white/[0.05]">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Room</div>
                <div className="font-bold text-white">#{student?.room?.roomNumber || '101'}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#090b10] border border-white/[0.05]">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Bed Allotment</div>
                <div className="font-bold text-[#dfba73] truncate">Bed {student?.bed?.bedNumber || 'B-1'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Link List */}
        <div className="space-y-1 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Resident Modules
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
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      active ? 'bg-[#090b10]/20 text-[#090b10]' : item.badgeColor || 'bg-white/5 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Launch Buttons in Sidebar Footer */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2">
          <button
            onClick={() => {
              setSidebarOpen(false);
              setScanAttendanceModal(true);
            }}
            className="w-full py-2.5 rounded-xl bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#dfba73] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Attendance</span>
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false);
              setComplaintModal(true);
            }}
            className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#dfba73]" />
            <span>Raise Complaint</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════
          RIGHT MAIN CONTENT AREA
          ════════════════════════════════════════════════ */}
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
          <span className="text-[11px] text-[#dfba73] font-mono">Room #{student?.room?.roomNumber || '101'}</span>
        </div>

        {/* Top Header Card within Content */}
        <div className="p-6 rounded-2xl bg-[#0e1219] border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          {/* Subtle Ambient Gold Glow in background */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Resident
              </span>
              <span className="text-xs text-slate-400">
                • {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-0.5">
              <span className="px-2.5 py-1 rounded-md bg-[#121620] border border-white/[0.06]">
                Room <strong className="text-white">#{student?.room?.roomNumber || '101'}</strong> ({student?.room?.type || 'AC'} Deluxe)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#121620] border border-white/[0.06] text-[#dfba73]">
                Bed <strong className="font-semibold">{student?.bed?.bedNumber || 'B-1'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#121620] border border-white/[0.06] text-slate-400">
                {student?.hostel?.name || 'Block A Campus Residence'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative self-start md:self-center shrink-0">
            <button
              onClick={() => setScanAttendanceModal(true)}
              className="btn-arch-primary !py-2.5 !px-4 text-xs flex items-center gap-2 shadow-lg shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Attendance</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#121620] border border-white/[0.06] text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Portal Sync</span>
            </div>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Key Stat Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Attendance Tile */}
              <div
                onClick={() => setActiveTab('attendance')}
                className="p-5 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 transition-all cursor-pointer flex flex-col justify-between shadow-lg group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium">Today's Attendance</span>
                  <QrCode className="w-4 h-4 text-[#dfba73] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-bold text-white mt-2">
                  {isPresentToday ? 'Marked Present' : 'Pending Scan'}
                </div>
                <div className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${isPresentToday ? 'text-emerald-400' : 'text-[#dfba73]'}`}>
                  {isPresentToday ? '✓ Verified via QR Code' : 'Click to Scan QR →'}
                </div>
              </div>

              {/* Room Allotment */}
              <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] flex flex-col justify-between shadow-lg">
                <div className="text-xs text-slate-400 font-medium">Allotment Unit</div>
                <div className="text-xl font-bold text-white mt-2">
                  Room #{student?.room?.roomNumber || '101'}
                  <span className="text-xs text-[#dfba73] font-normal ml-1.5">Bed {student?.bed?.bedNumber || 'B-1'}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{student?.hostel?.name || 'Block A Complex'}</div>
              </div>

              {/* Fee Dues */}
              <div
                onClick={() => setActiveTab('fees')}
                className="p-5 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 transition-all cursor-pointer flex flex-col justify-between shadow-lg group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium">Semester Dues</span>
                  <CreditCard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-bold text-white mt-2">
                  ₹{totalDues.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-[#dfba73] font-medium mt-1">View & Pay Invoices →</div>
              </div>

              {/* Leave Applications */}
              <div
                onClick={() => setActiveTab('leaves')}
                className="p-5 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 transition-all cursor-pointer flex flex-col justify-between shadow-lg group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium">Active Leaves</span>
                  <Key className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl font-bold text-white mt-2">
                  {activeLeaves.length} Active
                </div>
                <div className="text-[11px] text-slate-400 group-hover:text-[#dfba73] font-medium mt-1">Leave Applications →</div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <button
                onClick={() => setScanAttendanceModal(true)}
                className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 text-left transition-all cursor-pointer group shadow-md"
              >
                <div className="p-2.5 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#dfba73] w-fit mb-3 group-hover:scale-110 transition-transform">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-white">Scan Attendance</h4>
                <p className="text-[11px] text-slate-400 mt-1">Mark daily floor presence</p>
              </button>

              <button
                onClick={() => setComplaintModal(true)}
                className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 text-left transition-all cursor-pointer group shadow-md"
              >
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-white">Raise Complaint</h4>
                <p className="text-[11px] text-slate-400 mt-1">Report room & facility issues</p>
              </button>

              <button
                onClick={() => setLeaveModal(true)}
                className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 text-left transition-all cursor-pointer group shadow-md"
              >
                <div className="p-2.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Key className="w-4 h-4 text-[#dfba73]" />
                </div>
                <h4 className="text-xs font-semibold text-white">Leave Application</h4>
                <p className="text-[11px] text-slate-400 mt-1">Apply for leave permission</p>
              </button>

              <button
                onClick={() => setVisitorModal(true)}
                className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 text-left transition-all cursor-pointer group shadow-md"
              >
                <div className="p-2.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-[#dfba73]" />
                </div>
                <h4 className="text-xs font-semibold text-white">Visitor Request</h4>
                <p className="text-[11px] text-slate-400 mt-1">Entry pass for guests & parents</p>
              </button>

              <button
                onClick={() => setActiveTab('fees')}
                className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#131722] border border-white/[0.08] hover:border-[#c5a059]/40 text-left transition-all cursor-pointer group shadow-md"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-white">Hostel Fees</h4>
                <p className="text-[11px] text-slate-400 mt-1">View dues & payment receipts</p>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: SCAN ATTENDANCE ── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Terminal Hero Banner */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0e1219] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Terminal Active • Night Roll 20:30 – 22:30 IST
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2.5">
                  <QrCode className="w-6 h-6 text-[#dfba73]" />
                  Smart Hostel Biometric & QR Attendance
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Authenticate your nightly residential presence by scanning the warden desk's dynamic circular QR token or visiting the floor terminal kiosk.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative shrink-0">
                <button
                  onClick={() => setScanAttendanceModal(true)}
                  className="btn-arch-primary text-xs !py-3 !px-5 flex items-center justify-center gap-2 shadow-xl shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch QR Scanner Terminal</span>
                </button>
              </div>
            </div>

            {/* 3 Telemetry Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Today's Roll Call */}
              <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-lg flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tonight's Roll Call</span>
                  <Clock className="w-4 h-4 text-[#dfba73]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {isPresentToday ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED PRESENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        PENDING SCAN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {isPresentToday
                      ? 'Presence recorded successfully. No further action needed tonight.'
                      : 'Scan before 10:30 PM IST to avoid automatic absent notification.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.05] text-[10px] text-slate-500 font-mono">
                  Session window: 08:30 PM - 10:30 PM IST
                </div>
              </div>

              {/* Card 2: 30-Day Compliance */}
              <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-lg flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attendance Compliance</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-white">96.8%</span>
                    <span className="text-xs text-emerald-400 font-semibold">14-Day Streak</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#181d28] rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#c5a059] to-[#dfba73] h-1.5 rounded-full" style={{ width: '96.8%' }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Fully eligible for semester exam hall-ticket & gate outpasses.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.05] text-[10px] text-slate-500 font-mono">
                  Disciplinary warnings: 0 / 3
                </div>
              </div>

              {/* Card 3: Checkpoint Kiosk */}
              <div className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-lg flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Checkpoint</span>
                  <MapPin className="w-4 h-4 text-[#dfba73]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {student?.hostel?.name || 'Block A'} Ground Foyer
                  </div>
                  <div className="text-[11px] font-mono text-[#dfba73] mt-1">
                    Terminal Node #01 · Room #{student?.room?.roomNumber || '101'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Hardware Status: <strong className="text-emerald-400">ONLINE 99.9%</strong>
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.05] text-[10px] text-slate-500 font-mono">
                  SHA-256 Dynamic QR Token Match
                </div>
              </div>
            </div>

            {/* Attendance History Log & Verification Timeline */}
            <div className="p-6 rounded-2xl bg-[#0e1219] border border-white/[0.08] space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span>Recent Attendance Verification Log</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#121620] text-[#dfba73] border border-white/10 font-sans">
                      {attendanceRecords.length} Records
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable digital presence trail stamped with hardware timestamp and security hash.
                  </p>
                </div>

                <button
                  onClick={() => setScanAttendanceModal(true)}
                  className="btn-arch-secondary text-xs !py-2 !px-3.5 flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Camera className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Verify Now</span>
                </button>
              </div>

              <div className="space-y-3">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((att) => (
                    <div
                      key={att._id}
                      className="p-4 rounded-xl bg-[#121620] hover:bg-[#161c28] border border-white/[0.06] hover:border-[#c5a059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs sm:text-sm">
                            {new Date(att.date).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-slate-300">
                              Time: {new Date(att.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span className="text-[#dfba73]">{att.remarks || 'QR Code Terminal Stamped'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[10px] tracking-wider">
                          {att.status || 'PRESENT'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                          ID: #{att._id?.slice(-6) || 'AUTH'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-6 rounded-xl bg-[#121620]/60 border border-dashed border-white/10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/25 text-[#dfba73] flex items-center justify-center mx-auto shadow-inner">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-sm font-bold text-white">Ready for Tonight's Attendance Roll-Call</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No check-in recorded for today yet. Launch the camera scanner to read the warden's rotating QR pass or enter the session key.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setScanAttendanceModal(true)}
                        className="btn-arch-primary text-xs !py-2.5 !px-5 inline-flex items-center gap-2 shadow-lg shadow-[#c5a059]/20"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Launch QR Scanner Terminal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: COMPLAINTS & TRACKING ── */}
        {activeTab === 'complaints' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#dfba73]" />
                  Grievance & Maintenance Tracker
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Lodge complaints and follow live resolution progress step-by-step.</p>
              </div>
              <button
                onClick={() => setComplaintModal(true)}
                className="btn-arch-primary text-xs !py-2.5 !px-5"
              >
                <Plus className="w-4 h-4" />
                <span>Lodge New Grievance</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3 text-[#dfba73]" /> Filter:</span>
              {['all', 'pending', 'in_progress', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-all ${
                    complaintFilter === st
                      ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white bg-[#0e1219] border border-white/[0.08]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Complaints List with Step-by-Step Tracker */}
            <div className="space-y-5">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c) => {
                  let stage = 1;
                  if (c.status === 'in_progress') stage = 3;
                  if (c.status === 'resolved') stage = 4;

                  return (
                    <div key={c._id} className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-5 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30">
                              {c.category}
                            </span>
                            <h3 className="text-base font-semibold text-white">{c.title}</h3>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                        </div>

                        <span className={`text-xs px-3 py-1 rounded font-semibold uppercase ${
                          c.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          c.status === 'in_progress' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          Status: {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Visual 4-Step Resolution Tracker */}
                      <div className="p-4 rounded-lg bg-[#090b10] border border-white/[0.06] space-y-2">
                        <div className="text-[11px] font-semibold text-[#dfba73] uppercase tracking-wider">Live Resolution Progress</div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2.5 rounded-md border ${stage >= 1 ? 'bg-[#c5a059]/15 border-[#c5a059]/35 text-[#dfba73]' : 'bg-[#121620] border-white/5 text-slate-500'}`}>
                            <div className="font-semibold text-[11px]">1. Submitted</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</div>
                          </div>

                          <div className={`p-2.5 rounded-md border ${stage >= 2 ? 'bg-[#c5a059]/15 border-[#c5a059]/35 text-[#dfba73]' : 'bg-[#121620] border-white/5 text-slate-500'}`}>
                            <div className="font-semibold text-[11px]">2. Assigned</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Warden Office</div>
                          </div>

                          <div className={`p-2.5 rounded-md border ${stage >= 3 ? 'bg-amber-500/15 border-amber-500/35 text-amber-300' : 'bg-[#121620] border-white/5 text-slate-500'}`}>
                            <div className="font-semibold text-[11px]">3. In Progress</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Technician Onsite</div>
                          </div>

                          <div className={`p-2.5 rounded-md border ${stage >= 4 ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300' : 'bg-[#121620] border-white/5 text-slate-500'}`}>
                            <div className="font-semibold text-[11px]">4. Resolved</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Verified Done</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center rounded-xl bg-[#0e1219] border border-white/[0.08] text-slate-400 text-xs">
                  No complaints matching "{complaintFilter}". Click "Lodge New Grievance" to register an issue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: LEAVE APPLICATIONS ── */}
        {activeTab === 'leaves' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#dfba73]" />
                  Submit & Track Leave Applications
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Request permissions for weekend visits, emergencies, or vacations.</p>
              </div>
              <button
                onClick={() => setLeaveModal(true)}
                className="btn-arch-primary text-xs !py-2.5 !px-5"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Leave Application</span>
              </button>
            </div>

            <div className="space-y-4">
              {leaves.length > 0 ? (
                leaves.map((l) => (
                  <div key={l._id} className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-4 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30">
                          {l.leaveType}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{l.destination}</h4>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded font-semibold uppercase ${
                        l.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        l.status === 'rejected' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {l.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">Purpose: {l.reason}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#090b10] border border-white/[0.06] text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Departure:</span>
                        <strong className="text-white">{new Date(l.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Expected Return:</span>
                        <strong className="text-white">{new Date(l.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Emergency Contact:</span>
                        <strong className="text-slate-300">{l.emergencyContact || student?.parentPhone || 'Parent'}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-xl bg-[#0e1219] border border-white/[0.08] text-slate-400 text-xs">
                  No leave records. Click "Submit Leave Application" to apply for leave.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: VISITOR PASSES ── */}
        {activeTab === 'visitors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#dfba73]" />
                  Guest & Visitor Gatepasses
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Request permission for parents and visitors to enter the hostel campus.</p>
              </div>
              <button
                onClick={() => setVisitorModal(true)}
                className="btn-arch-primary text-xs !py-2.5 !px-5"
              >
                <Plus className="w-4 h-4" />
                <span>Request Visitor Pass</span>
              </button>
            </div>

            <div className="space-y-4">
              {visitors.length > 0 ? (
                visitors.map((v) => (
                  <div key={v._id} className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-3 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-md bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 font-mono text-xs font-semibold">
                          {v.passNumber}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{v.visitorName} ({v.relationship})</h4>
                          <div className="text-[11px] text-slate-400">Phone: {v.phone}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded font-semibold uppercase border ${
                        v.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : v.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {v.status === 'approved' ? 'Pass Approved' : v.status === 'rejected' ? 'Request Rejected' : 'Pending Warden Approval'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">Purpose: {v.purpose}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                      <span>Visit Date: <strong className="text-white">{new Date(v.visitDate).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-xl bg-[#0e1219] border border-white/[0.08] text-slate-400 text-xs">
                  No visitor passes requested. Click "Request Visitor Pass" to invite parents or guests.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: FEES & VIEW RECEIPTS ── */}
        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-xl">
              <div>
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#dfba73]" />
                  Fee Dues & Official Receipts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">View detailed invoices, pay online, and open verified fee receipts.</p>
              </div>
            </div>

            <div className="space-y-4">
              {fees.length > 0 ? (
                fees.map((f) => (
                  <div key={f._id} className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-semibold text-white">{f.title}</h4>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold uppercase ${
                          f.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Due Date: {new Date(f.dueDate).toLocaleDateString()} · Receipt ID: {f.receiptNumber || 'Generated upon payment'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-white font-mono">₹{f.amount?.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">{f.feeType}</div>
                      </div>

                      {f.status === 'paid' ? (
                        <button
                          onClick={() => setViewingReceipt(f)}
                          className="btn-arch-secondary text-xs !py-2 !px-4"
                        >
                          <Eye className="w-4 h-4 text-[#dfba73]" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setPayModal(f)}
                          className="btn-arch-primary text-xs !py-2 !px-5"
                        >
                          Pay Online →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-xl bg-[#0e1219] border border-white/[0.08] text-slate-400 text-xs">
                  No fee records found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 7: MESS TIMETABLE (7-DAY WEEKLY SCHEDULE) ── */}
        {activeTab === 'mess' && (() => {
          const fallbackWeeklyMenu = [
            { dayOfWeek: 'Monday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Poha with Chutney', 'Boiled Eggs / Sprouts', 'Tea / Coffee / Milk', 'Banana'], specialDiet: 'Gluten-free oats available' },
            { dayOfWeek: 'Monday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Dal Tadka', 'Jeera Rice', 'Paneer Butter Masala', 'Chapati', 'Green Salad', 'Gulab Jamun'], specialDiet: 'Jain Dal available' },
            { dayOfWeek: 'Monday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Veg Sandwich', 'Masala Chai', 'Biscuits'] },
            { dayOfWeek: 'Monday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Mix Veg Curry', 'Roti', 'Steamed Rice', 'Moong Dal', 'Raita'] },

            { dayOfWeek: 'Tuesday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Idli & Sambar', 'Coconut Chutney', 'Tea / Coffee / Milk', 'Apple'] },
            { dayOfWeek: 'Tuesday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Rajma Masala', 'Basmati Rice', 'Aloo Gobi', 'Phulka', 'Curd', 'Papad'] },
            { dayOfWeek: 'Tuesday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Samosa with Imli Chutney', 'Adrak Chai'] },
            { dayOfWeek: 'Tuesday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Palak Paneer', 'Chapati', 'Fried Rice', 'Dal Makhani', 'Kheer'] },

            { dayOfWeek: 'Wednesday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Aloo Paratha with Curd & Pickle', 'Tea / Coffee / Milk'] },
            { dayOfWeek: 'Wednesday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Chole Bhature', 'Veg Biryani', 'Boondi Raita', 'Onion Salad'] },
            { dayOfWeek: 'Wednesday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Bhel Puri', 'Cold Coffee / Lemon Tea'] },
            { dayOfWeek: 'Wednesday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Egg Curry / Kadai Paneer', 'Roti', 'Jeera Rice', 'Yellow Dal'] },

            { dayOfWeek: 'Thursday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Upma with Sambar & Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee'] },
            { dayOfWeek: 'Thursday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Kadhi Pakora', 'Steamed Rice', 'Bhindi Masala', 'Chapati', 'Salad'] },
            { dayOfWeek: 'Thursday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Pav Bhaji (2 pcs)', 'Filter Coffee'] },
            { dayOfWeek: 'Thursday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Dum Aloo', 'Roti', 'Veg Pulao', 'Dal Fry', 'Custard'] },

            { dayOfWeek: 'Friday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Uttapam with Sambar', 'Tomato Chutney', 'Tea / Milk'] },
            { dayOfWeek: 'Friday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Paneer Tikka Masala', 'Butter Naan / Roti', 'Peas Pulao', 'Dal Tadka'] },
            { dayOfWeek: 'Friday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Dhokla with Green Chutney', 'Chai'] },
            { dayOfWeek: 'Friday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Chicken Curry / Shahi Paneer', 'Rumali Roti', 'Biryani Rice', 'Ice Cream'] },

            { dayOfWeek: 'Saturday', mealType: 'Breakfast', timing: '7:30 AM - 9:30 AM', menuItems: ['Puri Bhaji (Aloo Curry)', 'Halwa', 'Tea / Coffee / Milk'] },
            { dayOfWeek: 'Saturday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Sambhar Rice', 'Avial / Mix Veg', 'Curd Rice', 'Papad & Pickle'] },
            { dayOfWeek: 'Saturday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Pasta / Macaroni', 'Hot Chocolate / Tea'] },
            { dayOfWeek: 'Saturday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Malai Kofta', 'Chapati', 'Fried Rice', 'Dal Makhani', 'Rasgulla'] },

            { dayOfWeek: 'Sunday', mealType: 'Breakfast', timing: '8:00 AM - 10:00 AM', menuItems: ['Masala Dosa', 'Sambar & Chutney Trio', 'Filter Coffee / Milk'] },
            { dayOfWeek: 'Sunday', mealType: 'Lunch', timing: '12:30 PM - 2:30 PM', menuItems: ['Special Sunday Feast (Paneer Lababdar / Chicken Biryani)', 'Butter Roti', 'Raita', 'Sweet Lassi'] },
            { dayOfWeek: 'Sunday', mealType: 'Snacks', timing: '5:00 PM - 6:00 PM', menuItems: ['Kachori with Sweet Chutney', 'Masala Tea'] },
            { dayOfWeek: 'Sunday', mealType: 'Dinner', timing: '7:30 PM - 9:30 PM', menuItems: ['Light Khichdi / Veg Pulao', 'Kadhi', 'Papad', 'Fruit Salad'] },
          ];

          // Master function to guarantee complete, diverse, chef-curated dishes for every day and meal
          const getMealForDayAndType = (day, mealType) => {
            const normalizedDay = (day || '').trim().toLowerCase();
            const normalizedType = (mealType || '').trim().toLowerCase();

            // 1. If database has a valid item for this exact day & type, use it
            if (Array.isArray(messMenu) && messMenu.length > 0) {
              const dbItem = messMenu.find(
                (m) => (m.dayOfWeek || '').trim().toLowerCase() === normalizedDay &&
                       (m.mealType || '').trim().toLowerCase() === normalizedType
              );
              if (dbItem && Array.isArray(dbItem.menuItems) && dbItem.menuItems.length > 0) {
                return dbItem;
              }
            }

            // 2. Otherwise provide the rich, curated master dishes for that day & meal
            const fallbackItem = fallbackWeeklyMenu.find(
              (m) => m.dayOfWeek.toLowerCase() === normalizedDay &&
                     m.mealType.toLowerCase() === normalizedType
            );
            if (fallbackItem) {
              return fallbackItem;
            }

            // 3. Fallback default
            return {
              dayOfWeek: day,
              mealType: mealType,
              timing: mealType === 'Breakfast' ? '7:30 AM - 9:30 AM' : mealType === 'Lunch' ? '12:30 PM - 2:30 PM' : mealType === 'Snacks' ? '5:00 PM - 6:00 PM' : '7:30 PM - 9:30 PM',
              menuItems: ['Chef Special Nutritious Platter', 'Accompaniments', 'Fresh Beverage'],
            };
          };

          const getMealMeta = (type) => {
            switch (type) {
              case 'Breakfast':
                return {
                  icon: <Sun className="w-5 h-5 text-amber-400" />,
                  bg: 'from-amber-950/20 via-[#0e1219] to-[#090b10]',
                  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                  tag: 'Morning Nutrition',
                };
              case 'Lunch':
                return {
                  icon: <Flame className="w-5 h-5 text-orange-400" />,
                  bg: 'from-orange-950/20 via-[#0e1219] to-[#090b10]',
                  badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
                  tag: 'Hearty Full Meal',
                };
              case 'Snacks':
                return {
                  icon: <Coffee className="w-5 h-5 text-emerald-400" />,
                  bg: 'from-emerald-950/20 via-[#0e1219] to-[#090b10]',
                  badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                  tag: 'Evening Refreshment',
                };
              case 'Dinner':
              default:
                return {
                  icon: <Moon className="w-5 h-5 text-[#dfba73]" />,
                  bg: 'from-[#141824] via-[#0e1219] to-[#090b10]',
                  badge: 'bg-[#c5a059]/15 text-[#dfba73] border-[#c5a059]/30',
                  tag: 'Night Dining',
                };
            }
          };

          // Dynamic Live Service Calculation
          const currentHour = new Date().getHours();
          let currentLiveMeal = 'Lunch';
          let currentServiceStatus = 'Serving Now';
          let currentServiceTime = '12:30 PM - 2:30 PM';
          let nextServiceInfo = 'Next: Evening Snacks at 5:00 PM';

          if (currentHour >= 7 && currentHour < 10) {
            currentLiveMeal = 'Breakfast';
            currentServiceStatus = 'Serving Now';
            currentServiceTime = '7:30 AM - 9:30 AM';
            nextServiceInfo = 'Next: Lunch Service at 12:30 PM';
          } else if (currentHour >= 10 && currentHour < 12) {
            currentLiveMeal = 'Lunch';
            currentServiceStatus = 'Upcoming in Kitchen';
            currentServiceTime = 'Opens 12:30 PM';
            nextServiceInfo = 'Kitchen preheating & salad preparation';
          } else if (currentHour >= 12 && currentHour < 15) {
            currentLiveMeal = 'Lunch';
            currentServiceStatus = 'Serving Now';
            currentServiceTime = '12:30 PM - 2:30 PM';
            nextServiceInfo = 'Next: Evening Snacks at 5:00 PM';
          } else if (currentHour >= 15 && currentHour < 17) {
            currentLiveMeal = 'Snacks';
            currentServiceStatus = 'Upcoming';
            currentServiceTime = 'Opens 5:00 PM';
            nextServiceInfo = 'Tea & Evening snacks being prepared';
          } else if (currentHour >= 17 && currentHour < 19) {
            currentLiveMeal = 'Snacks';
            currentServiceStatus = 'Serving Now';
            currentServiceTime = '5:00 PM - 6:00 PM';
            nextServiceInfo = 'Next: Night Dinner at 7:30 PM';
          } else if (currentHour >= 19 && currentHour < 22) {
            currentLiveMeal = 'Dinner';
            currentServiceStatus = 'Serving Now';
            currentServiceTime = '7:30 PM - 9:30 PM';
            nextServiceInfo = 'Dining hall closes at 9:30 PM';
          } else {
            currentLiveMeal = 'Breakfast';
            currentServiceStatus = 'Tomorrow Morning';
            currentServiceTime = '7:30 AM - 9:30 AM';
            nextServiceInfo = 'Breakfast prep begins 6:00 AM';
          }

          const mealsToDisplay = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].filter((type) => {
            if (selectedMealFilter === 'all') return true;
            return type === selectedMealFilter;
          });

          return (
            <div className="space-y-6 animate-fade-in">
              {/* ── 1. LIVE DINING HALL STATUS HERO BANNER ── */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#0e1219] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 relative max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {selectedMessDay === todayDayName ? `${currentServiceStatus} • ${currentLiveMeal}` : `${selectedMessDay} Scheduled Menu`}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {selectedMessDay === todayDayName ? currentServiceTime : 'Central Dining Hall'}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2.5">
                    <UtensilsCrossed className="w-6 h-6 text-[#dfba73]" />
                    Hostel Dining & Mess Schedule
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedMessDay === todayDayName
                      ? `Freshly cooked meals prepared in FSSAI-audited central kitchens. ${nextServiceInfo}.`
                      : `Viewing complete curated four-course culinary schedule for ${selectedMessDay}.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 relative shrink-0">
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#121620] border border-white/[0.06] text-xs">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Dining Hall Crowd</div>
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Optimal (38% capacity)
                    </div>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#121620] border border-white/[0.06] text-xs">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Kitchen Safety</div>
                    <div className="font-bold text-[#dfba73] flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#dfba73]" />
                      Grade A+ FSSAI
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. 7-DAY SELECTOR STRIP ── */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {daysOfWeek.map((day) => {
                  const isToday = day === todayDayName;
                  const isSelected = day === selectedMessDay;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setSelectedMessDay(day);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#c5a059] text-[#090b10] font-bold border-[#dfba73] shadow-md shadow-[#c5a059]/20 scale-[1.02]'
                          : 'bg-[#0e1219] text-slate-400 hover:text-white hover:bg-white/[0.04] border-white/[0.08]'
                      }`}
                    >
                      <span>{day}</span>
                      {isToday && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          isSelected ? 'bg-[#090b10] text-[#dfba73]' : 'bg-[#c5a059]/20 text-[#dfba73] border border-[#c5a059]/30'
                        }`}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── 3. MEAL SERVICE FILTER & VIEW SWITCHER (DE-CONGESTED) ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1219] p-2.5 rounded-xl border border-white/[0.08] shadow-md">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All 4 Meals', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
                    { id: 'Breakfast', label: 'Breakfast', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
                    { id: 'Lunch', label: 'Lunch', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
                    { id: 'Snacks', label: 'Snacks', icon: <Coffee className="w-3.5 h-3.5 text-emerald-400" /> },
                    { id: 'Dinner', label: 'Dinner', icon: <Moon className="w-3.5 h-3.5 text-[#dfba73]" /> },
                  ].map((m) => {
                    const isSelected = selectedMealFilter === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMealFilter(m.id);
                          setMessViewMode('daily');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                          isSelected && messViewMode === 'daily'
                            ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-md shadow-[#c5a059]/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View Mode Toggle: Cards vs 7-Day Table */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 bg-[#121620] p-1 rounded-lg border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setMessViewMode('daily')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      messViewMode === 'daily'
                        ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessViewMode('table')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      messViewMode === 'table'
                        ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Weekly Table</span>
                  </button>
                </div>
              </div>

              {/* ── 4. MEAL CARDS (SPACIOUS 2-COLUMN OR FOCUSED SINGLE VIEW) ── */}
              {messViewMode === 'daily' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">
                      Menu for: <strong className="text-[#dfba73]">{selectedMessDay}</strong>
                      {selectedMessDay === todayDayName && ' (Today\'s Live Dining)'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedMealFilter === 'all' ? 'All 4 Service Windows' : `${selectedMealFilter} Focus View`}
                    </span>
                  </div>

                  <div className={`grid gap-5 ${
                    selectedMealFilter === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {mealsToDisplay.map((type) => {
                      const meal = getMealForDayAndType(selectedMessDay, type);
                      const meta = getMealMeta(type);
                      const isCurrentLive = selectedMessDay === todayDayName && currentLiveMeal === type;
                      const ratingKey = `${selectedMessDay}_${type}`;
                      const currentRating = mealRatings[ratingKey] || 5;

                      return (
                        <div
                          key={type}
                          className={`p-6 rounded-2xl bg-gradient-to-br ${meta.bg} border ${
                            isCurrentLive ? 'border-[#c5a059] shadow-2xl shadow-[#c5a059]/15' : 'border-white/[0.08]'
                          } hover:border-[#c5a059]/40 transition-all space-y-5 flex flex-col justify-between`}
                        >
                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
                                  {meta.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-serif text-lg font-bold text-white">{meal.mealType}</h3>
                                    {isCurrentLive && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Serving Now
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400 font-medium">{meta.tag}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${meta.badge}`}>
                                  {meal.timing || 'Standard Timings'}
                                </span>
                              </div>
                            </div>

                            {/* Menu Items Showcase */}
                            <div className="space-y-2.5 pt-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
                                  <ChefHat className="w-3.5 h-3.5 text-[#dfba73]" />
                                  Course Platter & Dishes
                                </span>
                                <span className="text-[10px] text-slate-500">Pure Veg & Balanced</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {meal.menuItems && meal.menuItems.length > 0 ? (
                                  meal.menuItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl bg-[#090b10]/80 border border-white/[0.06] flex items-center gap-2.5 text-xs text-slate-200 font-medium hover:border-[#c5a059]/30 transition-colors"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-[#c5a059] shrink-0" />
                                      <span className="truncate">{item}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-slate-500 italic p-3">Chef's daily special assortment</div>
                                )}
                              </div>
                            </div>

                            {/* Dietary Notification */}
                            {meal.specialDiet && (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>{meal.specialDiet}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with Interactive Rating and Nutrition */}
                          <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-[11px]">Rate Meal:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => {
                                      setMealRatings((prev) => ({ ...prev, [ratingKey]: star }));
                                      showToast(`Thank you! Rated ${type} ${star}★ for the Mess Committee.`);
                                    }}
                                    className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                                    title={`Rate ${star} Stars`}
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 ${
                                        star <= currentRating
                                          ? 'text-[#dfba73] fill-[#dfba73]'
                                          : 'text-slate-600'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.05] text-slate-300">
                                ~{type === 'Breakfast' ? '450' : type === 'Lunch' ? '720' : type === 'Snacks' ? '280' : '650'} kcal
                              </span>
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> FSSAI Checked
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 5. COMPLETE 7-DAY WEEKLY TABLE MATRIX ── */}
              {messViewMode === 'table' && (
                <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e1219] shadow-2xl">
                  <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-[#121620] border-b border-white/[0.08] text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                        <th className="py-4 px-4">Day</th>
                        <th className="py-4 px-4">Breakfast (7:30 - 9:30 AM)</th>
                        <th className="py-4 px-4">Lunch (12:30 - 2:30 PM)</th>
                        <th className="py-4 px-4">Evening Snacks (5:00 - 6:00 PM)</th>
                        <th className="py-4 px-4">Dinner (7:30 - 9:30 PM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {daysOfWeek.map((day) => {
                        const isToday = day === todayDayName;

                        const bFast = getMealForDayAndType(day, 'Breakfast');
                        const lunch = getMealForDayAndType(day, 'Lunch');
                        const snacks = getMealForDayAndType(day, 'Snacks');
                        const dinner = getMealForDayAndType(day, 'Dinner');

                        return (
                          <tr
                            key={day}
                            className={`transition-colors ${
                              isToday ? 'bg-[#c5a059]/10' : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span>{day}</span>
                                {isToday && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#c5a059] text-[#090b10] uppercase">
                                    Today
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              <div className="space-y-1">
                                <div className="font-medium text-white">{bFast?.menuItems?.[0] || 'Idli & Sambar'}</div>
                                <div className="text-[11px] text-slate-400">{bFast?.menuItems?.slice(1).join(', ') || 'Chutney, Tea/Coffee'}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              <div className="space-y-1">
                                <div className="font-medium text-[#dfba73]">{lunch?.menuItems?.[0] || 'Dal Tadka & Rice'}</div>
                                <div className="text-[11px] text-slate-400">{lunch?.menuItems?.slice(1).join(', ') || 'Chapati, Curd, Salad'}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              <div className="space-y-1">
                                <div className="font-medium text-white">{snacks?.menuItems?.[0] || 'Snacks'}</div>
                                <div className="text-[11px] text-slate-400">{snacks?.menuItems?.slice(1).join(', ') || 'Hot Tea / Milk'}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              <div className="space-y-1">
                                <div className="font-medium text-emerald-300">{dinner?.menuItems?.[0] || 'Special Curry'}</div>
                                <div className="text-[11px] text-slate-400">{dinner?.menuItems?.slice(1).join(', ') || 'Roti, Rice, Sweet'}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── 6. MESS RULES & DINING COMMITTEE CONTACT ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-1.5 text-xs shadow-md">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#dfba73]" />
                    Meal Timing Discipline
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Breakfast closes strictly at 9:30 AM. Dinner is served until 9:30 PM. Late plate service requires prior warden notification.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-1.5 text-xs shadow-md">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#dfba73]" />
                    Special Diets & Outpass Rebates
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Leaves exceeding 2 days automatically credit mess rebates to your semester fee invoice. Jain & non-spicy meals prepared upon request.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-1.5 text-xs shadow-md">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    FSSAI Certified Hygiene Audit
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    RO-filtered drinking water, steam-cleaned tableware, and temperature-controlled storage inspected weekly by campus health officers.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── TAB 8: NOTICES ── */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-xl bg-[#0e1219] border border-white/[0.08] shadow-xl">
              <h2 className="font-serif text-xl font-bold text-white">Campus Circulars & Hostel Notices</h2>
              <p className="text-xs text-slate-400 mt-0.5">Official circulars from Hostel Wardens and Campus Administration.</p>
            </div>

            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n._id} className="p-5 rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{n.title}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold uppercase ${
                      n.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/25'
                    }`}>
                      {n.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Posted on {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: FILE COMPLAINT ── */}
      {complaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e1219] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#dfba73]" />
                Lodge Grievance / Maintenance Complain
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillComplaint}
                  className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill sample maintenance complaint"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setComplaintModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bathroom tap leakage in Room 101"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Wi-Fi / Internet">Wi-Fi / Internet</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Mess & Food">Mess & Food</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the exact issue details..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setComplaintModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-arch-primary text-xs !py-2 !px-5"
                >
                  Submit Complain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: APPLY LEAVE ── */}
      {leaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e1219] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#dfba73]" />
                Submit Leave Application
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillLeave}
                  className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill sample outstation leave application"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setLeaveModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  >
                    <option value="outpass">Day Leave</option>
                    <option value="weekend">Weekend Home Stay</option>
                    <option value="vacation">Semester Vacation</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Destination Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home (Mumbai)"
                    value={leaveForm.destination}
                    onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Reason for Leave *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State purpose of departure..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#dfba73] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setLeaveModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-arch-primary text-xs !py-2 !px-5"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PAY ONLINE SIMULATOR ── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1219] border border-[#c5a059]/30 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#dfba73]" />
                Pay Hostel Fee Online
              </h3>
              <button onClick={() => setPayModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/25 space-y-1">
              <div className="text-xs text-slate-400">{payModal.title}</div>
              <div className="text-2xl font-bold text-white font-mono">₹{payModal.amount?.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-[#dfba73] font-medium">Verified Payment Gateway Simulator</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[#121620] border border-white/[0.08] flex items-center justify-between text-slate-200">
                <span>Payment Mode</span>
                <strong className="text-[#dfba73]">Instant UPI / NetBanking</strong>
              </div>
              <div className="p-3 rounded-lg bg-[#121620] border border-white/[0.08] flex items-center justify-between text-slate-200">
                <span>Student</span>
                <span>{user?.name}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPayModal(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={paying}
                onClick={() => handleProcessPayment(payModal._id)}
                className="btn-arch-primary text-xs !py-2 !px-5 disabled:opacity-50"
              >
                {paying ? 'Processing...' : `Confirm & Pay ₹${payModal.amount?.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW OFFICIAL FEE RECEIPT ── */}
      <FeeReceiptModal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        fee={viewingReceipt}
        student={student}
        user={user}
      />

      {/* ── MODAL: SCAN ATTENDANCE QR ── */}
      <ScanAttendanceModal
        isOpen={scanAttendanceModal}
        onClose={() => setScanAttendanceModal(false)}
        student={student}
        user={user}
        onAttendanceMarked={(newRecord) => {
          showToast('Attendance verified & marked Present!');
          loadModuleData();
        }}
      />

      {/* ── MODAL: REQUEST VISITOR GATEPASS ── */}
      <RequestVisitorModal
        isOpen={visitorModal}
        onClose={() => setVisitorModal(false)}
        student={student}
        user={user}
        onVisitorCreated={(newVis) => {
          showToast('Visitor request submitted to Warden for gate clearance approval!');
          loadModuleData();
        }}
      />
    </div>
  );
}
