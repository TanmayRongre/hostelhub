import React, { useState, useEffect } from 'react';
import {
  Activity,
  QrCode,
  FileText,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  Send,
  Building2,
  Calendar
} from 'lucide-react';
import api from '../../services/api';

export default function AdminOperationsSection({ initialSubTab = 'complaints', onSubTabChange }) {
  const [subTab, setSubTab] = useState(initialSubTab); // complaints | leaves | visitors | attendance
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status updating state
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabClick = (tabId) => {
    setSubTab(tabId);
    if (onSubTabChange) {
      onSubTabChange(tabId);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, leaveRes, visRes, attRes] = await Promise.allSettled([
        api.getComplaints(),
        api.getLeaves(),
        api.getVisitors(),
        api.getAttendance(),
      ]);

      if (compRes.status === 'fulfilled' && compRes.value.data) setComplaints(compRes.value.data);
      if (leaveRes.status === 'fulfilled' && leaveRes.value.data) setLeaves(leaveRes.value.data);
      if (visRes.status === 'fulfilled' && visRes.value.data) setVisitors(visRes.value.data);
      if (attRes.status === 'fulfilled' && attRes.value.data) setAttendance(attRes.value.data);
    } catch (err) {
      showToast(err.message || 'Failed to load operations data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateComplaintStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await api.updateComplaint(id, { status });
      showToast(`Complaint status marked as ${status}`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update complaint', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await api.updateLeave(id, { status });
      showToast(`Leave application marked as ${status}`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update leave application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div>
          <h2 className="text-xl font-bold text-[#15232a] font-serif flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#128bc0]" />
            Central Campus Operations
          </h2>
          <p className="text-xs text-[#586d65] mt-1">Manage daily hostel attendance, leave approvals, complaints escalation, and visitor permits.</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'complaints', label: `Complaints (${complaints.filter(c => c.status !== 'resolved').length})`, icon: <FileText className="w-4 h-4" /> },
            { id: 'leaves', label: `Leave Applications (${leaves.filter(l => l.status === 'pending').length})`, icon: <Key className="w-4 h-4" /> },
            { id: 'visitors', label: `Visitors (${visitors.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'attendance', label: `Attendance (${attendance.length})`, icon: <QrCode className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-[#152c36] text-white font-bold shadow-xs'
                  : 'bg-[#fbfbf9] text-[#586d65] hover:text-[#15232a] border border-[#d6e0d7]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. COMPLAINTS & GRIEVANCE ESCALATION ── */}
      {subTab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length > 0 ? (
            complaints.map((c) => (
              <div key={c._id} className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]">
                      {c.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#15232a]">{c.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      c.status === 'resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      c.status === 'in_progress' ? 'bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#15232a] leading-relaxed">{c.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#dce5dc] text-xs">
                  <div className="text-[#586d65] text-[11px]">
                    Filed by: <strong className="text-[#15232a]">{c.student?.name || 'Resident'}</strong> ({c.student?.email}) · Date: {new Date(c.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {c.status !== 'in_progress' && c.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateComplaintStatus(c._id, 'in_progress')}
                        disabled={actionLoading}
                        className="btn-arch-secondary text-[11px] px-3 py-1 rounded-xl"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {c.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateComplaintStatus(c._id, 'resolved')}
                        disabled={actionLoading}
                        className="btn-arch-primary text-[11px] px-3 py-1 rounded-xl"
                      >
                        ✓ Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-[#586d65] text-xs">
              No complaint tickets lodged.
            </div>
          )}
        </div>
      )}

      {/* ── 2. LEAVE APPLICATIONS APPROVAL ── */}
      {subTab === 'leaves' && (
        <div className="space-y-4">
          {leaves.length > 0 ? (
            leaves.map((l) => (
              <div key={l._id} className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]">
                      {l.leaveType}
                    </span>
                    <h4 className="text-sm font-bold text-[#15232a]">{l.destination}</h4>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    l.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    l.status === 'rejected' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {l.status}
                  </span>
                </div>

                <p className="text-xs text-[#15232a]">Purpose: {l.reason}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#dce5dc] text-xs">
                  <div className="text-[#586d65] text-[11px]">
                    Student: <strong className="text-[#15232a]">{l.student?.name || 'Resident'}</strong> · Departure: {new Date(l.fromDate).toLocaleDateString()}
                  </div>

                  {l.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateLeaveStatus(l._id, 'approved')}
                        disabled={actionLoading}
                        className="btn-arch-primary text-[11px] px-3 py-1 rounded-xl"
                      >
                        ✓ Approve Leave
                      </button>
                      <button
                        onClick={() => handleUpdateLeaveStatus(l._id, 'rejected')}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-semibold transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-[#586d65] text-xs">
              No leave applications found.
            </div>
          )}
        </div>
      )}

      {/* ── 3. VISITOR PASSES ── */}
      {subTab === 'visitors' && (
        <div className="space-y-4">
          {visitors.length > 0 ? (
            visitors.map((v) => (
              <div key={v._id} className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[#128bc0] font-bold">{v.passNumber}</span>
                    <strong className="text-[#15232a] text-sm">{v.visitorName} ({v.relationship})</strong>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    {v.status}
                  </span>
                </div>
                <div className="text-[#15232a]">Purpose: {v.purpose} · Phone: {v.phone}</div>
                <div className="text-[#586d65] text-[11px]">
                  Visit Date: {new Date(v.visitDate).toLocaleDateString()} · Host: {v.student?.name || 'Resident'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#d6e0d7] text-xs text-[#586d65]">No visitors logged.</div>
          )}
        </div>
      )}

      {/* ── 4. ATTENDANCE STREAM ── */}
      {subTab === 'attendance' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-3">
            <h3 className="text-sm font-bold text-[#15232a] font-serif">Global Student Attendance Feed ({attendance.length} Total)</h3>
            <div className="space-y-2">
              {attendance.slice(0, 15).map((att) => (
                <div key={att._id} className="p-3 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#15232a]">{att.student?.name || 'Student Resident'}</div>
                    <div className="text-[11px] text-[#586d65]">{new Date(att.date).toLocaleString()} · {att.remarks || 'QR Verified'}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase text-[10px]">
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
