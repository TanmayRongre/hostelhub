import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import UnadmittedView from '../components/student/UnadmittedView';
import AdmissionModal from '../components/student/AdmissionModal';
import StudentDashboardView from '../components/student/StudentDashboardView';
import {
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();

  // Student Admission State
  const [studentProfile, setStudentProfile] = useState(null);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Student Admission Profile
  const loadStudentProfile = async () => {
    if (!isAuthenticated) {
      setLoadingStudent(false);
      return;
    }
    setLoadingStudent(true);
    try {
      const res = await api.getMyStudentProfile();
      if (res.success) {
        setIsAdmitted(res.isAdmitted);
        setStudentProfile(res.student);
      } else {
        setIsAdmitted(false);
        setStudentProfile(null);
      }
    } catch {
      setIsAdmitted(false);
      setStudentProfile(null);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleGlobalRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStudentProfile();
      setRefreshKey((prev) => prev + 1);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (user?.role === 'warden') {
      window.location.href = '/warden';
      return;
    }
    if (user?.role === 'admin' && window.location.pathname === '/dashboard') {
      window.location.href = '/admin';
      return;
    }
    loadStudentProfile();
  }, [isAuthenticated, user?.role]);

  // Handle Admission Success
  const handleAdmissionSuccess = (newStudent, message) => {
    setStudentProfile(newStudent);
    setIsAdmitted(true);
    showToast(message || 'Hostel admission confirmed successfully!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f6f0] text-[#15232a] font-sans p-3 sm:p-5 lg:p-6 relative transition-colors">
      <div className="max-w-[1520px] mx-auto space-y-6 relative z-10">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ── Top Dashboard Header (Only shown for unadmitted/portal state) ── */}
        {(!isAdmitted || !studentProfile) && (
          <div className="flex items-center justify-between gap-4 border-b border-[#d6e0d7] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] flex items-center justify-center text-[#128bc0] shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#15232a] tracking-tight">Student Residence Portal</h1>
                <p className="text-xs text-[#586d65] mt-0.5">Campus residency, room allotments, daily QR attendance, leave applications, and fees.</p>
              </div>
            </div>

            <button
              onClick={handleGlobalRefresh}
              title="Refresh All Portal Data"
              className="px-3 py-2 rounded-xl bg-[#ffffff] border border-[#d6e0d7] text-[#586d65] hover:text-[#128bc0] hover:border-[#128bc0] transition-all cursor-pointer flex items-center gap-2 text-xs font-medium shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loadingStudent ? 'animate-spin text-[#128bc0]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        )}

        {/* ── STUDENT HUB VIEW ── */}
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="p-10 rounded-2xl bg-[#ffffff] border border-[#d6e0d7] text-center max-w-lg mx-auto space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#15232a]">Student Login Required</h3>
                <p className="text-xs text-[#586d65] mt-1">Please sign in or register to access your student hostel residency portal.</p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="btn-arch-primary text-xs !py-2.5 !px-5"
                >
                  Portal Sign In →
                </Link>
                <Link
                  to="/register"
                  className="btn-arch-secondary text-xs !py-2.5 !px-5"
                >
                  Register Account
                </Link>
              </div>
            </div>
          ) : loadingStudent ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#d6e0d7] border-t-[#128bc0] rounded-full animate-spin mx-auto" />
              <div className="text-xs font-medium text-[#586d65]">Verifying student residency record...</div>
            </div>
          ) : isAdmitted && studentProfile ? (
            /* ADMITTED VIEW: FULL STUDENT DASHBOARD */
            <StudentDashboardView
              student={studentProfile}
              user={user}
              onRefresh={handleGlobalRefresh}
              refreshKey={refreshKey}
            />
          ) : (
            /* UNADMITTED VIEW: ADMIT NOW BUTTON & FORM */
            <UnadmittedView
              user={user}
              onOpenAdmission={() => setAdmissionModalOpen(true)}
            />
          )}
        </div>

        {/* Admission Modal */}
        <AdmissionModal
          isOpen={admissionModalOpen}
          onClose={() => setAdmissionModalOpen(false)}
          onSuccess={handleAdmissionSuccess}
          initialUser={user}
        />
      </div>
    </div>
  );
}
