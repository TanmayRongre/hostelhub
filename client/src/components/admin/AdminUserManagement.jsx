import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  GraduationCap,
  Key,
  CreditCard,
  Eye,
  Lock,
  UserCheck,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

export default function AdminUserManagement({ onUserUpdated }) {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('all'); // all | students | wardens | admins
  const [searchTerm, setSearchTerm] = useState('');

  // Role Change Modal
  const [roleModal, setRoleModal] = useState(null); // target user
  const [selectedRole, setSelectedRole] = useState('student');
  const [updatingRole, setUpdatingRole] = useState(false);

  const handleAutofillRole = () => {
    setSelectedRole((prev) => (prev === 'warden' ? 'admin' : 'warden'));
  };

  // View Student Details Modal
  const [viewingStudent, setViewingStudent] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, studentsRes] = await Promise.allSettled([
        api.getUsers(),
        api.getStudents(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        setUsers(usersRes.value.data);
      }
      if (studentsRes.status === 'fulfilled' && studentsRes.value.data) {
        setStudents(studentsRes.value.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load user records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!roleModal) return;
    setUpdatingRole(true);
    try {
      await api.updateUserRole(roleModal._id, selectedRole);
      showToast(`User role updated to ${selectedRole} successfully!`);
      setRoleModal(null);
      loadData();
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingRole(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeSubTab === 'students' && u.role !== 'student') return false;
    if (activeSubTab === 'wardens' && u.role !== 'warden') return false;
    if (activeSubTab === 'admins' && u.role !== 'admin') return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.role?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-950/95 text-rose-200 border-rose-700/60' : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/60'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-[#0e1219] border border-white/[0.08]">
        <div>
          <h2 className="text-lg font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#dfba73]" />
            User & Role Management
          </h2>
          <p className="text-xs text-slate-400">Manage registered residents, wardens, staff credentials, and platform role authorizations.</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'students', 'wardens', 'admins'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeSubTab === tab
                  ? 'bg-[#c5a059] text-[#090b10] font-bold shadow-md shadow-[#c5a059]/20'
                  : 'bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0e1219] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba73]"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden border border-white/[0.08] rounded-xl bg-[#0e1219] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121620] border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Hostel Details</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading user directory...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const studentProfile = students.find((s) => s.user?._id?.toString() === u._id.toString() || s.user?.toString() === u._id.toString());
                  return (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#c5a059] text-[#090b10] font-serif font-bold text-xs flex items-center justify-center">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-500">ID: {u._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-slate-300">{u.email}</td>

                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          u.role === 'warden' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        {studentProfile ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-white">Room #{studentProfile.room?.roomNumber || '101'}</span>
                            <span className="text-slate-500 ml-1">({studentProfile.hostel?.name || 'Block A'})</span>
                          </div>
                        ) : u.role === 'warden' ? (
                          <span className="text-[11px] text-[#dfba73] font-medium">Hostel Warden</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unallotted</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {studentProfile && (
                            <button
                              onClick={() => setViewingStudent(studentProfile)}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer"
                            >
                              Profile
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setRoleModal(u);
                              setSelectedRole(u.role);
                            }}
                            className="btn-arch-secondary px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Change Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No users found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CHANGE ROLE ── */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1219] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#dfba73]" />
                Modify User Authority & Role
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillRole}
                  className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill sample role promotion"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setRoleModal(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/5 space-y-1">
              <div className="text-xs text-slate-400">Target User Account:</div>
              <div className="text-sm font-bold text-white">{roleModal.name}</div>
              <div className="text-xs font-mono text-slate-400">{roleModal.email}</div>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Assign New System Role:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-[#c5a059] transition-colors"
                >
                  <option value="student">Student (Hostel Resident)</option>
                  <option value="warden">Warden (Hostel Supervisor & Approver)</option>
                  <option value="admin">System Administrator (Global Platform Control)</option>
                  <option value="user">Standard User (Unadmitted)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 text-[11px] text-[#dfba73] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#dfba73]" />
                <span>Privilege changes are logged permanently in the system Audit Log.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setRoleModal(null)}
                  className="btn-arch-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="btn-arch-primary text-xs px-5 py-2.5"
                >
                  {updatingRole ? 'Updating...' : 'Confirm Role Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW STUDENT DETAILS ── */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e1219] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#dfba73]" />
                Student Residency Dossier
              </h3>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#121620] border border-white/5 space-y-1">
                <span className="text-slate-400">Roll ID</span>
                <div className="text-sm font-bold text-white uppercase">{viewingStudent.enrollmentNumber}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-white/5 space-y-1">
                <span className="text-slate-400">Department</span>
                <div className="text-sm font-bold text-white">{viewingStudent.department}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-white/5 space-y-1">
                <span className="text-slate-400">Allocated Room</span>
                <div className="text-sm font-bold text-white">Room #{viewingStudent.room?.roomNumber || '101'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121620] border border-white/5 space-y-1">
                <span className="text-slate-400">Assigned Bed</span>
                <div className="text-sm font-bold text-[#dfba73]">Bed {viewingStudent.bed?.bedNumber || 'B-1'}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#121620] border border-white/5 text-xs space-y-1">
              <div className="text-slate-400">Parent / Guardian:</div>
              <div className="font-bold text-white">{viewingStudent.parentName || 'N/A'} · Phone: {viewingStudent.parentPhone || 'N/A'}</div>
              <div className="text-slate-400 text-[11px]">Address: {viewingStudent.address || 'Pune, Maharashtra'}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingStudent(null)}
                className="btn-arch-secondary text-xs px-4 py-2"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
