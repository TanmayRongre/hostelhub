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
  // Simplified Navigation Items with Icons & Badges
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
    {
      id: 'attendance',
      label: 'Scan Attendance',
      icon: <Camera className="w-4 h-4" />,
      badge: isPresentToday ? '✓ Present' : 'Pending',
      badgeClass: isPresentToday ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-sky-50 text-sky-600 border border-sky-100',
    },
    {
      id: 'complaints',
      label: 'Raise Complaint',
      icon: <FileText className="w-4 h-4" />,
      badge: openComplaints.length > 0 ? `${openComplaints.length}` : '12',
      badgeClass: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'leaves',
      label: 'Leave Application',
      icon: <Clock className="w-4 h-4" />,
      badge: activeLeaves.length > 0 ? `${activeLeaves.length}` : '1',
      badgeClass: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'visitors',
      label: 'Visitor Request',
      icon: <User className="w-4 h-4" />,
      badge: visitors.length > 0 ? `${visitors.length}` : '1',
      badgeClass: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'fees',
      label: 'Hostel Fees',
      icon: <CreditCard className="w-4 h-4" />,
      badge: totalDues > 0 ? `₹${totalDues > 1000 ? Math.round(totalDues/1000) + 'k' : totalDues}` : '✓ Paid',
      badgeClass: totalDues > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    },
    { id: 'mess', label: 'Mess Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    {
      id: 'notices',
      label: 'Notices',
      icon: <Bell className="w-4 h-4" />,
      badge: notices.length > 0 ? `${notices.length}` : '3',
      badgeClass: 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 animate-fade-in relative text-slate-800">
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════
          DESKTOP PERMANENT SIDEBAR & MOBILE SLIDE DRAWER
          ════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:h-fit lg:rounded-2xl lg:border lg:border-slate-200/80 lg:shadow-[0_2px_12px_rgba(0,0,0,0.03)] lg:sticky lg:top-20 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Resident Desk & Student Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 tracking-wide">Resident Desk</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Roll : {student?.enrollmentNumber || 'CS2026-139'}
                </div>
              </div>
            </div>
            {/* Close button only on mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer text-xs"
              title="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* Student Profile Card */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Demo Student'}</div>
                <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {student?.hostel?.name ? student.hostel.name.toUpperCase() : 'NILGIRI GIRLS HOSTEL (BLOCK B)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
              <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">ROOM</div>
                <div className="font-bold text-slate-800">#{student?.room?.roomNumber || '201'}</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">BED ALLOTMENT</div>
                <div className="font-bold text-sky-600 truncate">Bed {student?.bed?.bedNumber || 'Bed-2'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Link List */}
        <div className="space-y-1 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            RESIDENT MODULES
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
                    ? 'bg-sky-100 text-sky-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${active ? 'text-sky-700' : 'text-slate-400 group-hover:text-sky-600 group-hover:scale-110'} transition-all`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/80 text-sky-700' : item.badgeClass || 'bg-slate-100 text-slate-600'
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
        <div className="pt-3 border-t border-slate-100 space-y-2 relative">
          <button
            onClick={() => {
              setSidebarOpen(false);
              setScanAttendanceModal(true);
            }}
            className="w-full py-2.5 rounded-xl bg-[#bae6fd] hover:bg-[#7dd3fc] text-[#0369a1] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Attendance</span>
          </button>

          <button
            onClick={() => {
              setSidebarOpen(false);
              setComplaintModal(true);
            }}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Raise Complaint</span>
          </button>

          {/* Sparkle doodle at bottom left */}
          <span className="absolute -bottom-1 -left-3 text-sky-400 text-xs opacity-70 select-none pointer-events-none">✨</span>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════
          RIGHT MAIN CONTENT AREA
          ════════════════════════════════════════════════ */}
      <main className="flex-1 space-y-6 min-w-0">
        {/* Mobile Navigation Trigger Bar (Shown only on small screens) */}
        <div className="lg:hidden p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold"
          >
            <Menu className="w-4 h-4 text-sky-600" />
            <span>Menu: {navItems.find((n) => n.id === activeTab)?.label || 'Overview'}</span>
          </button>
          <span className="text-[11px] text-slate-600 font-mono font-semibold">Room #{student?.room?.roomNumber || '201'}</span>
        </div>

        {/* ── Top Hero Banner Card ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 relative max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ✓ ACTIVE RESIDENT
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                Welcome back,{' '}
                <span className="relative inline-block">
                  {user?.name || 'Demo Student'}
                  <svg className="absolute -bottom-2 left-0 w-full h-2.5 text-sky-500 fill-none" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M 0,5 Q 25,1 50,5 T 100,5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Stay connected. Stay informed. Make the most of your hostel life.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center gap-2 shadow-xs">
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>Room <strong className="text-slate-800">#{student?.room?.roomNumber || '201'}</strong></span>
                <span className="text-slate-400 text-[11px]">{student?.room?.type ? `${student.room.type} Deluxe` : 'Deluxe Deluxe'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center gap-2 shadow-xs">
                <BedDouble className="w-3.5 h-3.5 text-sky-600" />
                <span>Bed <strong className="text-sky-600 font-semibold">{student?.bed?.bedNumber || 'Bed-2'}</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-slate-200/80 flex items-center gap-2 shadow-xs">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500 font-medium">{student?.hostel?.name || 'Nilgiri Girls Hostel (Block B)'}</span>
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setScanAttendanceModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#7dd3fc] hover:bg-[#38bdf8] text-[#0369a1] font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR Attendance</span>
                <span className="text-sm font-semibold">→</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">Live Portal Sync</span>
              </div>
            </div>
          </div>

          {/* Architectural line-art Sketch Illustration on Right */}
          <div className="hidden lg:flex flex-col items-center justify-center relative shrink-0 w-80 h-48 select-none pointer-events-none">
            <svg viewBox="0 0 320 180" className="w-full h-full text-slate-700 fill-none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {/* Clouds */}
              <path d="M 40,30 Q 50,20 65,25 Q 80,18 95,28 Q 105,25 110,32" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.2" />
              <path d="M 230,22 Q 242,14 258,18 Q 272,12 285,20" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.2" />

              {/* Ground horizon / lawn lines */}
              <path d="M 10,145 C 80,140 180,146 310,142" stroke="#64748b" strokeWidth="1.5" />
              <path d="M 25,152 C 90,148 160,154 280,150" stroke="#cbd5e1" strokeWidth="1" />

              {/* Main Hostel Residence Building */}
              <rect x="75" y="48" width="130" height="92" rx="2" fill="#ffffff" stroke="#334155" strokeWidth="1.8" />
              <polygon points="68,48 140,24 212,48" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
              <line x1="90" y1="41" x2="190" y2="41" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="110" y1="34" x2="170" y2="34" stroke="#cbd5e1" strokeWidth="1" />

              {/* Upper Floor Windows */}
              <rect x="88" y="58" width="16" height="22" stroke="#334155" strokeWidth="1.4" fill="#f0f9ff" />
              <line x1="96" y1="58" x2="96" y2="80" stroke="#38bdf8" strokeWidth="1" />
              <line x1="88" y1="69" x2="104" y2="69" stroke="#38bdf8" strokeWidth="1" />

              <rect x="114" y="58" width="16" height="22" stroke="#334155" strokeWidth="1.4" fill="#f0f9ff" />
              <line x1="122" y1="58" x2="122" y2="80" stroke="#38bdf8" strokeWidth="1" />
              <line x1="114" y1="69" x2="130" y2="69" stroke="#38bdf8" strokeWidth="1" />

              <rect x="150" y="58" width="16" height="22" stroke="#334155" strokeWidth="1.4" fill="#f0f9ff" />
              <line x1="158" y1="58" x2="158" y2="80" stroke="#38bdf8" strokeWidth="1" />
              <line x1="150" y1="69" x2="166" y2="69" stroke="#38bdf8" strokeWidth="1" />

              <rect x="176" y="58" width="16" height="22" stroke="#334155" strokeWidth="1.4" fill="#f0f9ff" />
              <line x1="184" y1="58" x2="184" y2="80" stroke="#38bdf8" strokeWidth="1" />
              <line x1="176" y1="69" x2="192" y2="69" stroke="#38bdf8" strokeWidth="1" />

              <line x1="75" y1="90" x2="205" y2="90" stroke="#334155" strokeWidth="1.6" />

              {/* Ground Floor Windows & Arched Entry Door */}
              <rect x="88" y="100" width="16" height="24" stroke="#334155" strokeWidth="1.4" fill="#f0f9ff" />
              <line x1="96" y1="100" x2="96" y2="124" stroke="#38bdf8" strokeWidth="1" />
              <line x1="88" y1="112" x2="104" y2="112" stroke="#38bdf8" strokeWidth="1" />

              <path d="M 130,140 L 130,108 A 10,10 0 0 1 150,108 L 150,140 Z" fill="#e0f2fe" stroke="#334155" strokeWidth="1.6" />
              <line x1="140" y1="108" x2="140" y2="140" stroke="#0284c7" strokeWidth="1.2" />

              <rect x="176" y="100" width="16" height="24" stroke="#334155" strokeWidth="1.4" fill="#f0f9ff" />
              <line x1="184" y1="100" x2="184" y2="124" stroke="#38bdf8" strokeWidth="1" />
              <line x1="176" y1="112" x2="192" y2="112" stroke="#38bdf8" strokeWidth="1" />

              {/* Trees & Shrubs on sides */}
              <path d="M 45,142 C 35,130 32,110 42,95 C 48,85 62,88 66,98 C 72,110 68,135 55,142" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 52,142 L 52,120" stroke="#047857" strokeWidth="1.4" />
              <path d="M 62,144 C 60,136 68,132 72,136 C 76,134 80,140 76,145" fill="#f0fdf4" stroke="#10b981" strokeWidth="1.2" />

              <path d="M 220,142 C 212,128 215,105 228,94 C 238,84 252,90 254,102 C 258,118 250,138 235,142" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 233,142 L 233,122" stroke="#047857" strokeWidth="1.4" />

              {/* Sparkles / Stars ✦ */}
              <path d="M 30,55 Q 32,60 37,62 Q 32,64 30,69 Q 28,64 23,62 Q 28,60 30,55 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
              <path d="M 275,85 Q 277,88 281,89 Q 277,91 275,94 Q 273,91 269,89 Q 273,88 275,85 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />

              {/* Hand-drawn doodle: Good Vibes Only ☺ */}
              <g className="font-sans" transform="translate(262, 38) rotate(4)">
                <text x="0" y="0" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700" fontFamily="sans-serif">Good</text>
                <text x="0" y="14" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700" fontFamily="sans-serif">Vibes</text>
                <text x="0" y="28" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700" fontFamily="sans-serif">Only</text>
                <circle cx="0" cy="42" r="5" fill="none" stroke="#64748b" strokeWidth="1.2" />
                <circle cx="-1.5" cy="40.5" r="0.6" fill="#64748b" />
                <circle cx="1.5" cy="40.5" r="0.6" fill="#64748b" />
                <path d="M -2.5,43 Q 0,46 2.5,43" stroke="#64748b" strokeWidth="1" fill="none" strokeLinecap="round" />
                <circle cx="-12" cy="18" r="1" fill="#38bdf8" />
                <circle cx="14" cy="30" r="1.2" fill="#38bdf8" />
              </g>
            </svg>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Key 4 Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Tile 1: Today's Attendance */}
              <div
                onClick={() => setActiveTab('attendance')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Today's Attendance</span>
                  </div>
                  <span className="text-sky-400 font-bold text-sm">✨</span>
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {isPresentToday ? 'Marked Present' : 'Pending Scan'}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                    {isPresentToday ? '✓ Verified via QR Code' : 'Click to scan QR →'}
                  </div>
                </div>
              </div>

              {/* Tile 2: Allotment Unit */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Allotment Unit</span>
                  </div>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-400 fill-none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 3,9 L 12,2 L 21,9 L 21,20 A 2,2 0 0 1 19,22 L 5,22 A 2,2 0 0 1 3,20 Z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                    <span>Room #{student?.room?.roomNumber || '201'}</span>
                    <span className="text-sm font-bold text-sky-600">Bed {student?.bed?.bedNumber || 'Bed-2'}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-400 mt-1 truncate">
                    {student?.hostel?.name || 'Nilgiri Girls Hostel (Block B)'}
                  </div>
                </div>
              </div>

              {/* Tile 3: Semester Dues */}
              <div
                onClick={() => setActiveTab('fees')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-sm font-bold">
                      ₹
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Semester Dues</span>
                  </div>
                  <span className="text-[11px] font-sans font-bold text-slate-400 -rotate-6">
                    Pay Soon ✍
                  </span>
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    ₹{totalDues.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                    View & Pay Invoices →
                  </div>
                </div>
              </div>

              {/* Tile 4: Active Leaves */}
              <div
                onClick={() => setActiveTab('leaves')}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Active Leaves</span>
                  </div>
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-400 fill-none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {activeLeaves.length || 1} Active
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                    Leave Applications →
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">Quick Access</h2>
                  <div className="relative inline-block text-xs text-slate-400 mt-0.5 font-medium">
                    Common services at your fingertips
                    <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-sky-400 fill-none" viewBox="0 0 100 8" preserveAspectRatio="none">
                      <path d="M 0,4 Q 25,1 50,4 T 100,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <svg viewBox="0 0 36 24" className="w-7 h-5 text-slate-400 fill-none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M 28,4 C 20,4 8,8 6,18 M 6,18 L 12,16 M 6,18 L 6,12" />
                  </svg>
                  <div className="italic text-slate-500 text-[11px] leading-tight">
                    Everything you need,<br />right here ✨
                  </div>
                </div>
              </div>

              {/* 8 Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Scan Attendance */}
                <div
                  onClick={() => setScanAttendanceModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Scan Attendance</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mark daily floor presence</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 2. Raise Complaint */}
                <div
                  onClick={() => setComplaintModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Raise Complaint</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Report room & facility issues</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 3. Leave Application */}
                <div
                  onClick={() => setLeaveModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Leave Application</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Apply for leave permission</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 4. Visitor Request */}
                <div
                  onClick={() => setVisitorModal(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Visitor Request</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Entry pass for guests & parents</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 5. Hostel Fees */}
                <div
                  onClick={() => setActiveTab('fees')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Hostel Fees</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">View dues & payment receipts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 6. Mess Menu */}
                <div
                  onClick={() => setActiveTab('mess')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Mess Menu</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Check today's menu</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 7. Notices */}
                <div
                  onClick={() => setActiveTab('notices')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Notices</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">View latest announcements and updates</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* 8. Doodle Card: Better Living Together */}
                <div className="p-4 rounded-2xl border border-dashed border-sky-200/80 bg-sky-50/30 flex items-center justify-center text-center relative overflow-hidden select-none">
                  <div className="space-y-1 relative z-10 -rotate-2">
                    <div className="text-slate-600 font-bold text-sm tracking-tight italic">
                      Better Living
                    </div>
                    <div className="text-slate-500 font-bold text-xs tracking-tight italic flex items-center justify-center gap-1.5">
                      <span>Together</span>
                      <span className="text-sky-400 text-xs">✦</span>
                    </div>
                    <svg className="w-20 h-2 mx-auto text-sky-400 fill-none" viewBox="0 0 80 8">
                      <path d="M 0,4 Q 20,1 40,4 T 80,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="absolute top-2 right-3 text-sky-400 text-xs">✨</span>
                  <span className="absolute bottom-2 left-3 text-sky-400 text-xs">✦</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SCAN ATTENDANCE ── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Terminal Hero Banner */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_8px_24px_rgba(21,35,42,0.04)] relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#128bc0]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terminal Active • Night Roll 20:30 – 22:30 IST
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#15232a] flex items-center gap-2.5">
                  <QrCode className="w-6 h-6 text-[#128bc0]" />
                  Smart Hostel Biometric & QR Attendance
                </h2>
                <p className="text-xs text-[#586d65] leading-relaxed">
                  Authenticate your nightly residential presence by scanning the warden desk's dynamic circular QR token or visiting the floor terminal kiosk.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative shrink-0">
                <button
                  onClick={() => setScanAttendanceModal(true)}
                  className="btn-arch-primary text-xs !py-3 !px-5 flex items-center justify-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch QR Scanner Terminal</span>
                </button>
              </div>
            </div>

            {/* 3 Telemetry Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Today's Roll Call */}
              <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#586d65] uppercase tracking-wider">Tonight's Roll Call</span>
                  <Clock className="w-4 h-4 text-[#128bc0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {isPresentToday ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED PRESENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        PENDING SCAN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#586d65] mt-2">
                    {isPresentToday
                      ? 'Presence recorded successfully. No further action needed tonight.'
                      : 'Scan before 10:30 PM IST to avoid automatic absent notification.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#dce5dc] text-[10px] text-slate-400 font-mono">
                  Session window: 08:30 PM - 10:30 PM IST
                </div>
              </div>

              {/* Card 2: 30-Day Compliance */}
              <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#586d65] uppercase tracking-wider">Attendance Compliance</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-[#15232a]">96.8%</span>
                    <span className="text-xs text-emerald-700 font-semibold">14-Day Streak</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#e8f1f5] rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div className="bg-[#128bc0] h-1.5 rounded-full" style={{ width: '96.8%' }} />
                  </div>
                  <p className="text-[11px] text-[#586d65] mt-2">
                    Fully eligible for semester exam hall-ticket & gate outpasses.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#dce5dc] text-[10px] text-slate-400 font-mono">
                  Disciplinary warnings: 0 / 3
                </div>
              </div>

              {/* Card 3: Checkpoint Kiosk */}
              <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#586d65] uppercase tracking-wider">Assigned Checkpoint</span>
                  <MapPin className="w-4 h-4 text-[#128bc0]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#15232a]">
                    {student?.hostel?.name || 'Block A'} Ground Foyer
                  </div>
                  <div className="text-[11px] font-mono text-[#128bc0] mt-1 font-semibold">
                    Terminal Node #01 · Room #{student?.room?.roomNumber || '101'}
                  </div>
                  <p className="text-[11px] text-[#586d65] mt-2">
                    Hardware Status: <strong className="text-emerald-700 font-semibold">ONLINE 99.9%</strong>
                  </p>
                </div>
                <div className="pt-2 border-t border-[#dce5dc] text-[10px] text-slate-400 font-mono">
                  SHA-256 Dynamic QR Token Match
                </div>
              </div>
            </div>

            {/* Attendance History Log & Verification Timeline */}
            <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] space-y-5 shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dce5dc] pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#15232a] flex items-center gap-2">
                    <span>Recent Attendance Verification Log</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-sans">
                      {attendanceRecords.length} Records
                    </span>
                  </h3>
                  <p className="text-xs text-[#586d65] mt-0.5">
                    Immutable digital presence trail stamped with hardware timestamp and security hash.
                  </p>
                </div>

                <button
                  onClick={() => setScanAttendanceModal(true)}
                  className="btn-arch-secondary text-xs !py-2 !px-3.5 flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Camera className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Verify Now</span>
                </button>
              </div>

              <div className="space-y-3">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((att) => (
                    <div
                      key={att._id}
                      className="p-4 rounded-xl bg-[#fbfbf9] hover:bg-[#e8f1f5]/30 border border-[#dce5dc] hover:border-[#128bc0]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#15232a] text-xs sm:text-sm">
                            {new Date(att.date).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-[#586d65] flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[#15232a]">
                              Time: {new Date(att.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span className="text-[#128bc0] font-medium">{att.remarks || 'QR Code Terminal Stamped'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase text-[10px] tracking-wider">
                          {att.status || 'PRESENT'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                          ID: #{att._id?.slice(-6) || 'AUTH'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-6 rounded-2xl bg-[#fbfbf9] border border-dashed border-[#dce5dc] text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0] flex items-center justify-center mx-auto shadow-inner">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-sm font-bold text-[#15232a]">Ready for Tonight's Attendance Roll-Call</h4>
                      <p className="text-xs text-[#586d65] leading-relaxed">
                        No check-in recorded for today yet. Launch the camera scanner to read the warden's rotating QR pass or enter the session key.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setScanAttendanceModal(true)}
                        className="btn-arch-primary text-xs !py-2.5 !px-5 inline-flex items-center gap-2"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#15232a] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#128bc0]" />
                  Grievance & Maintenance Tracker
                </h2>
                <p className="text-xs text-[#586d65] mt-0.5">Lodge complaints and follow live resolution progress step-by-step.</p>
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
              <span className="text-xs text-[#586d65] flex items-center gap-1"><Filter className="w-3 h-3 text-[#128bc0]" /> Filter:</span>
              {['all', 'pending', 'in_progress', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setComplaintFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-all ${
                    complaintFilter === st
                      ? 'bg-[#152c36] text-white font-bold shadow-xs'
                      : 'text-[#586d65] hover:text-[#15232a] bg-white border border-[#d6e0d7]'
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
                    <div key={c._id} className="p-6 rounded-2xl bg-white border border-[#d6e0d7] space-y-5 shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]">
                              {c.category}
                            </span>
                            <h3 className="text-base font-semibold text-[#15232a]">{c.title}</h3>
                          </div>
                          <p className="text-xs text-[#586d65] leading-relaxed">{c.description}</p>
                        </div>

                        <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                          c.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          c.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          Status: {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Visual 4-Step Resolution Tracker */}
                      <div className="p-4 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-2">
                        <div className="text-[11px] font-semibold text-[#128bc0] uppercase tracking-wider">Live Resolution Progress</div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2.5 rounded-lg border ${stage >= 1 ? 'bg-[#e8f1f5] border-[#bce4f6] text-[#128bc0]' : 'bg-white border-[#dce5dc] text-slate-400'}`}>
                            <div className="font-semibold text-[11px]">1. Submitted</div>
                            <div className="text-[10px] text-[#586d65] mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</div>
                          </div>

                          <div className={`p-2.5 rounded-lg border ${stage >= 2 ? 'bg-[#e8f1f5] border-[#bce4f6] text-[#128bc0]' : 'bg-white border-[#dce5dc] text-slate-400'}`}>
                            <div className="font-semibold text-[11px]">2. Assigned</div>
                            <div className="text-[10px] text-[#586d65] mt-0.5">Warden Office</div>
                          </div>

                          <div className={`p-2.5 rounded-lg border ${stage >= 3 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-[#dce5dc] text-slate-400'}`}>
                            <div className="font-semibold text-[11px]">3. In Progress</div>
                            <div className="text-[10px] text-[#586d65] mt-0.5">Technician Onsite</div>
                          </div>

                          <div className={`p-2.5 rounded-lg border ${stage >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-[#dce5dc] text-slate-400'}`}>
                            <div className="font-semibold text-[11px]">4. Resolved</div>
                            <div className="text-[10px] text-[#586d65] mt-0.5">Verified Done</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-[#586d65] text-xs">
                  No complaints matching "{complaintFilter}". Click "Lodge New Grievance" to register an issue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: LEAVE APPLICATIONS ── */}
        {activeTab === 'leaves' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#15232a] flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#128bc0]" />
                  Submit & Track Leave Applications
                </h2>
                <p className="text-xs text-[#586d65] mt-0.5">Request permissions for weekend visits, emergencies, or vacations.</p>
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
                  <div key={l._id} className="p-6 rounded-2xl bg-white border border-[#d6e0d7] space-y-4 shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]">
                          {l.leaveType}
                        </span>
                        <h4 className="text-sm font-semibold text-[#15232a]">{l.destination}</h4>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        l.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {l.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#586d65] leading-relaxed">Purpose: {l.reason}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs">
                      <div>
                        <span className="text-[#586d65] block text-[11px]">Departure:</span>
                        <strong className="text-[#15232a]">{new Date(l.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <span className="text-[#586d65] block text-[11px]">Expected Return:</span>
                        <strong className="text-[#15232a]">{new Date(l.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <span className="text-[#586d65] block text-[11px]">Emergency Contact:</span>
                        <strong className="text-[#15232a]">{l.emergencyContact || student?.parentPhone || 'Parent'}</strong>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-[#586d65] text-xs">
                  No leave records. Click "Submit Leave Application" to apply for leave.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: VISITOR PASSES ── */}
        {activeTab === 'visitors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#15232a] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#128bc0]" />
                  Guest & Visitor Gatepasses
                </h2>
                <p className="text-xs text-[#586d65] mt-0.5">Request permission for parents and visitors to enter the hostel campus.</p>
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
                  <div key={v._id} className="p-6 rounded-2xl bg-white border border-[#d6e0d7] space-y-3 shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-mono text-xs font-semibold">
                          {v.passNumber}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#15232a]">{v.visitorName} ({v.relationship})</h4>
                          <div className="text-[11px] text-[#586d65]">Phone: {v.phone}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase border ${
                        v.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : v.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {v.status === 'approved' ? 'Pass Approved' : v.status === 'rejected' ? 'Request Rejected' : 'Pending Warden Approval'}
                      </span>
                    </div>

                    <p className="text-xs text-[#586d65]">Purpose: {v.purpose}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#586d65] pt-2 border-t border-[#e5ebe4]">
                      <span>Visit Date: <strong className="text-[#15232a]">{new Date(v.visitDate).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-[#586d65] text-xs">
                  No visitor passes requested. Click "Request Visitor Pass" to invite parents or guests.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: FEES & VIEW RECEIPTS ── */}
        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#15232a] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#128bc0]" />
                  Fee Dues & Official Receipts
                </h2>
                <p className="text-xs text-[#586d65] mt-0.5">View detailed invoices, pay online, and open verified fee receipts.</p>
              </div>
            </div>

            <div className="space-y-4">
              {fees.length > 0 ? (
                fees.map((f) => (
                  <div key={f._id} className="p-6 rounded-2xl bg-white border border-[#d6e0d7] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-semibold text-[#15232a]">{f.title}</h4>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                          f.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#586d65]">
                        Due Date: {new Date(f.dueDate).toLocaleDateString()} · Receipt ID: {f.receiptNumber || 'Generated upon payment'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#15232a] font-mono">₹{f.amount?.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-[#586d65]">{f.feeType}</div>
                      </div>

                      {f.status === 'paid' ? (
                        <button
                          onClick={() => setViewingReceipt(f)}
                          className="btn-arch-secondary text-xs !py-2 !px-4"
                        >
                          <Eye className="w-4 h-4 text-[#128bc0]" />
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
                <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-[#586d65] text-xs">
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
                  icon: <Sun className="w-5 h-5 text-amber-500" />,
                  bg: 'bg-white',
                  badge: 'bg-amber-50 text-amber-800 border-amber-200',
                  tag: 'Morning Nutrition',
                };
              case 'Lunch':
                return {
                  icon: <Flame className="w-5 h-5 text-orange-500" />,
                  bg: 'bg-white',
                  badge: 'bg-orange-50 text-orange-800 border-orange-200',
                  tag: 'Hearty Full Meal',
                };
              case 'Snacks':
                return {
                  icon: <Coffee className="w-5 h-5 text-emerald-600" />,
                  bg: 'bg-white',
                  badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  tag: 'Evening Refreshment',
                };
              case 'Dinner':
              default:
                return {
                  icon: <Moon className="w-5 h-5 text-[#128bc0]" />,
                  bg: 'bg-white',
                  badge: 'bg-[#e8f1f5] text-[#128bc0] border-[#bce4f6]',
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
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_8px_24px_rgba(21,35,42,0.04)] relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#128bc0]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 relative max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {selectedMessDay === todayDayName ? `${currentServiceStatus} • ${currentLiveMeal}` : `${selectedMessDay} Scheduled Menu`}
                    </span>
                    <span className="text-[11px] font-mono text-[#586d65]">
                      {selectedMessDay === todayDayName ? currentServiceTime : 'Central Dining Hall'}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[#15232a] flex items-center gap-2.5">
                    <UtensilsCrossed className="w-6 h-6 text-[#128bc0]" />
                    Hostel Dining & Mess Schedule
                  </h2>
                  <p className="text-xs text-[#586d65] leading-relaxed">
                    {selectedMessDay === todayDayName
                      ? `Freshly cooked meals prepared in FSSAI-audited central kitchens. ${nextServiceInfo}.`
                      : `Viewing complete curated four-course culinary schedule for ${selectedMessDay}.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 relative shrink-0">
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs shadow-sm">
                    <div className="text-[10px] text-[#586d65] uppercase tracking-wider font-semibold">Dining Hall Crowd</div>
                    <div className="font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Optimal (38% capacity)
                    </div>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs shadow-sm">
                    <div className="text-[10px] text-[#586d65] uppercase tracking-wider font-semibold">Kitchen Safety</div>
                    <div className="font-bold text-[#128bc0] flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#128bc0]" />
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
                          ? 'bg-[#152c36] text-white font-bold border-[#152c36] shadow-md scale-[1.02]'
                          : 'bg-white text-[#586d65] hover:text-[#15232a] hover:bg-[#fbfbf9] border-[#d6e0d7]'
                      }`}
                    >
                      <span>{day}</span>
                      {isToday && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          isSelected ? 'bg-white text-[#152c36]' : 'bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]'
                        }`}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── 3. MEAL SERVICE FILTER & VIEW SWITCHER (DE-CONGESTED) ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All 4 Meals', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
                    { id: 'Breakfast', label: 'Breakfast', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
                    { id: 'Lunch', label: 'Lunch', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
                    { id: 'Snacks', label: 'Snacks', icon: <Coffee className="w-3.5 h-3.5 text-emerald-600" /> },
                    { id: 'Dinner', label: 'Dinner', icon: <Moon className="w-3.5 h-3.5 text-[#128bc0]" /> },
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
                            ? 'bg-[#152c36] text-white font-bold shadow-sm'
                            : 'text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0]'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View Mode Toggle: Cards vs 7-Day Table */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 bg-[#fbfbf9] p-1 rounded-lg border border-[#dce5dc]">
                  <button
                    type="button"
                    onClick={() => setMessViewMode('daily')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      messViewMode === 'daily'
                        ? 'bg-white text-[#152c36] font-bold shadow-sm border border-[#dce5dc]'
                        : 'text-[#586d65] hover:text-[#15232a]'
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
                        ? 'bg-white text-[#152c36] font-bold shadow-sm border border-[#dce5dc]'
                        : 'text-[#586d65] hover:text-[#15232a]'
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
                  <div className="flex items-center justify-between text-xs text-[#586d65] px-1">
                    <span className="font-semibold text-[#586d65]">
                      Menu for: <strong className="text-[#15232a]">{selectedMessDay}</strong>
                      {selectedMessDay === todayDayName && ' (Today\'s Live Dining)'}
                    </span>
                    <span className="text-[11px] text-[#586d65]">
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
                          className={`p-6 rounded-2xl bg-white border ${
                            isCurrentLive ? 'border-[#128bc0] ring-2 ring-[#128bc0]/15 shadow-xl' : 'border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]'
                          } hover:border-[#128bc0]/40 transition-all space-y-5 flex flex-col justify-between`}
                        >
                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] shadow-sm">
                                  {meta.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-serif text-lg font-bold text-[#15232a]">{meal.mealType}</h3>
                                    {isCurrentLive && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Serving Now
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-[#586d65] font-medium">{meta.tag}</span>
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
                                <span className="font-bold uppercase tracking-wider text-[#586d65] text-[10px] flex items-center gap-1.5">
                                  <ChefHat className="w-3.5 h-3.5 text-[#128bc0]" />
                                  Course Platter & Dishes
                                </span>
                                <span className="text-[10px] text-[#586d65]">Pure Veg & Balanced</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {meal.menuItems && meal.menuItems.length > 0 ? (
                                  meal.menuItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] flex items-center gap-2.5 text-xs text-[#15232a] font-medium hover:border-[#128bc0]/40 transition-colors"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-[#128bc0] shrink-0" />
                                      <span className="truncate">{item}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-[#586d65] italic p-3">Chef's daily special assortment</div>
                                )}
                              </div>
                            </div>

                            {/* Dietary Notification */}
                            {meal.specialDiet && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>{meal.specialDiet}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with Interactive Rating and Nutrition */}
                          <div className="pt-4 border-t border-[#dce5dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-[#586d65]">
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
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-[#586d65]">
                              <span className="px-2 py-0.5 rounded bg-[#f5f6f0] border border-[#dce5dc] text-[#15232a] font-medium">
                                ~{type === 'Breakfast' ? '450' : type === 'Lunch' ? '720' : type === 'Snacks' ? '280' : '650'} kcal
                              </span>
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> FSSAI Checked
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
                <div className="overflow-x-auto rounded-2xl border border-[#d6e0d7] bg-white shadow-[0_8px_24px_rgba(21,35,42,0.04)]">
                  <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-[#fbfbf9] border-b border-[#d6e0d7] text-[#15232a] font-semibold uppercase text-[11px] tracking-wider">
                        <th className="py-4 px-4">Day</th>
                        <th className="py-4 px-4">Breakfast (7:30 - 9:30 AM)</th>
                        <th className="py-4 px-4">Lunch (12:30 - 2:30 PM)</th>
                        <th className="py-4 px-4">Evening Snacks (5:00 - 6:00 PM)</th>
                        <th className="py-4 px-4">Dinner (7:30 - 9:30 PM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dce5dc]">
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
                              isToday ? 'bg-[#e8f1f5]/50' : 'hover:bg-[#fbfbf9]'
                            }`}
                          >
                            <td className="py-4 px-4 font-semibold text-[#15232a] whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span>{day}</span>
                                {isToday && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#152c36] text-white uppercase">
                                    Today
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#15232a]">
                              <div className="space-y-1">
                                <div className="font-medium text-[#15232a]">{bFast?.menuItems?.[0] || 'Idli & Sambar'}</div>
                                <div className="text-[11px] text-[#586d65]">{bFast?.menuItems?.slice(1).join(', ') || 'Chutney, Tea/Coffee'}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#15232a]">
                              <div className="space-y-1">
                                <div className="font-medium text-[#128bc0]">{lunch?.menuItems?.[0] || 'Dal Tadka & Rice'}</div>
                                <div className="text-[11px] text-[#586d65]">{lunch?.menuItems?.slice(1).join(', ') || 'Chapati, Curd, Salad'}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#15232a]">
                              <div className="space-y-1">
                                <div className="font-medium text-[#15232a]">{snacks?.menuItems?.[0] || 'Snacks'}</div>
                                <div className="text-[11px] text-[#586d65]">{snacks?.menuItems?.slice(1).join(', ') || 'Hot Tea / Milk'}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#15232a]">
                              <div className="space-y-1">
                                <div className="font-medium text-emerald-700">{dinner?.menuItems?.[0] || 'Special Curry'}</div>
                                <div className="text-[11px] text-[#586d65]">{dinner?.menuItems?.slice(1).join(', ') || 'Roti, Rice, Sweet'}</div>
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
                <div className="p-4 rounded-xl bg-white border border-[#d6e0d7] space-y-1.5 text-xs shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                  <div className="font-semibold text-[#15232a] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#128bc0]" />
                    Meal Timing Discipline
                  </div>
                  <p className="text-[#586d65] text-[11px] leading-relaxed">
                    Breakfast closes strictly at 9:30 AM. Dinner is served until 9:30 PM. Late plate service requires prior warden notification.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#d6e0d7] space-y-1.5 text-xs shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                  <div className="font-semibold text-[#15232a] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#128bc0]" />
                    Special Diets & Outpass Rebates
                  </div>
                  <p className="text-[#586d65] text-[11px] leading-relaxed">
                    Leaves exceeding 2 days automatically credit mess rebates to your semester fee invoice. Jain & non-spicy meals prepared upon request.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#d6e0d7] space-y-1.5 text-xs shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                  <div className="font-semibold text-[#15232a] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    FSSAI Certified Hygiene Audit
                  </div>
                  <p className="text-[#586d65] text-[11px] leading-relaxed">
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
            <div className="p-6 rounded-xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
              <h2 className="font-serif text-xl font-bold text-[#15232a]">Campus Circulars & Hostel Notices</h2>
              <p className="text-xs text-[#586d65] mt-0.5">Official circulars from Hostel Wardens and Campus Administration.</p>
            </div>

            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n._id} className="p-5 rounded-xl bg-white border border-[#d6e0d7] space-y-2 shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#15232a]">{n.title}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      n.priority === 'urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]'
                    }`}>
                      {n.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-[#586d65] leading-relaxed">{n.content}</p>
                  <div className="text-[10px] text-slate-400 pt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#15232a] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#128bc0]" />
                Lodge Grievance / Maintenance Complain
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillComplaint}
                  className="px-2.5 py-1 rounded-full bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d8effa] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill sample maintenance complaint"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setComplaintModal(false)} className="text-slate-400 hover:text-[#15232a] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#15232a] mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bathroom tap leakage in Room 101"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#15232a] mb-1">Category</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
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
                  <label className="block font-medium text-[#15232a] mb-1">Priority</label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#15232a] mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the exact issue details..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setComplaintModal(false)}
                  className="px-4 py-2 rounded-lg text-[#586d65] hover:text-[#15232a] font-medium cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#15232a] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#128bc0]" />
                Submit Leave Application
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillLeave}
                  className="px-2.5 py-1 rounded-full bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d8effa] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill sample outstation leave application"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setLeaveModal(false)} className="text-slate-400 hover:text-[#15232a] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#15232a] mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  >
                    <option value="outpass">Day Leave</option>
                    <option value="weekend">Weekend Home Stay</option>
                    <option value="vacation">Semester Vacation</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#15232a] mb-1">Destination Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home (Mumbai)"
                    value={leaveForm.destination}
                    onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#15232a] mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#15232a] mb-1">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#15232a] mb-1">Reason for Leave *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State purpose of departure..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setLeaveModal(false)}
                  className="px-4 py-2 rounded-lg text-[#586d65] hover:text-[#15232a] font-medium cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#15232a] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#128bc0]" />
                Pay Hostel Fee Online
              </h3>
              <button onClick={() => setPayModal(null)} className="text-slate-400 hover:text-[#15232a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] space-y-1">
              <div className="text-xs text-[#586d65]">{payModal.title}</div>
              <div className="text-2xl font-bold text-[#15232a] font-mono">₹{payModal.amount?.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-[#128bc0] font-medium">Verified Payment Gateway Simulator</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[#fbfbf9] border border-[#dce5dc] flex items-center justify-between text-[#15232a]">
                <span className="text-[#586d65]">Payment Mode</span>
                <strong className="text-[#128bc0]">Instant UPI / NetBanking</strong>
              </div>
              <div className="p-3 rounded-lg bg-[#fbfbf9] border border-[#dce5dc] flex items-center justify-between text-[#15232a]">
                <span className="text-[#586d65]">Student</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#dce5dc]">
              <button
                type="button"
                onClick={() => setPayModal(null)}
                className="px-4 py-2 rounded-lg text-[#586d65] hover:text-[#15232a] text-xs font-medium cursor-pointer"
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
