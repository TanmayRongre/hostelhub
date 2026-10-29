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
    <div className="space-y-6 animate-fade-in font-sans">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#128bc0]" />
            User & Role Management
          </h2>
          <p className="text-xs text-[#586d65] mt-0.5">Manage registered residents, wardens, staff credentials, and platform role authorizations.</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'students', 'wardens', 'admins'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeSubTab === tab
                  ? 'bg-[#152c36] text-white font-bold shadow-xs'
                  : 'bg-[#fbfbf9] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#586d65] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d6e0d7] rounded-xl text-xs text-[#15232a] placeholder-[#586d65]/60 focus:outline-none focus:border-[#128bc0] shadow-xs"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden border border-[#d6e0d7] rounded-2xl bg-white shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#fbfbf9] border-b border-[#dce5dc] text-[#586d65] uppercase text-[10px] tracking-wider font-semibold">
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Hostel Details</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dce5dc] text-[#15232a]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#586d65]">Loading user directory...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const studentProfile = students.find((s) => s.user?._id?.toString() === u._id.toString() || s.user?.toString() === u._id.toString());
                  return (
                    <tr key={u._id} className="hover:bg-[#fbfbf9] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-serif font-bold text-xs flex items-center justify-center">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#15232a]">{u.name}</div>
                            <div className="text-[10px] text-[#586d65]">ID: {u._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[#586d65]">{u.email}</td>

                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          u.role === 'warden' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          'bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        {studentProfile ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-[#15232a]">Room #{studentProfile.room?.roomNumber || '101'}</span>
                            <span className="text-[#586d65] ml-1">({studentProfile.hostel?.name || 'Block A'})</span>
                          </div>
                        ) : u.role === 'warden' ? (
                          <span className="text-[11px] text-[#128bc0] font-medium">Hostel Warden</span>
                        ) : (
                          <span className="text-[#586d65] text-[11px]">Unallotted</span>
                        )}
                      </td>

                      <td className="p-4 text-[#586d65] text-[11px]">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {studentProfile && (
                            <button
                              onClick={() => setViewingStudent(studentProfile)}
                              className="px-2.5 py-1 rounded-lg bg-[#f5f6f0] hover:bg-[#eef1ea] text-[#15232a] text-[11px] font-medium border border-[#d6e0d7] transition-all cursor-pointer"
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
                  <td colSpan={6} className="p-8 text-center text-[#586d65]">No users found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: CHANGE ROLE ── */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="text-base font-bold font-serif text-[#15232a] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#128bc0]" />
                Modify User Authority & Role
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillRole}
                  className="px-2.5 py-1 rounded-lg bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d5e8f2] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Autofill sample role promotion"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setRoleModal(null)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs">✕</button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-1">
              <div className="text-xs text-[#586d65]">Target User Account:</div>
              <div className="text-sm font-bold text-[#15232a]">{roleModal.name}</div>
              <div className="text-xs font-mono text-[#586d65]">{roleModal.email}</div>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#15232a] mb-1.5">Assign New System Role:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                >
                  <option value="student">Student (Hostel Resident)</option>
                  <option value="warden">Warden (Hostel Supervisor & Approver)</option>
                  <option value="admin">System Administrator (Global Platform Control)</option>
                  <option value="user">Standard User (Unadmitted)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[11px] text-[#128bc0] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#128bc0]" />
                <span>Privilege changes are logged permanently in the system Audit Log.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setRoleModal(null)}
                  className="px-4 py-2 rounded-xl border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0] font-medium cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="btn-arch-primary text-xs px-5 py-2.5 rounded-xl"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-lg bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="text-base font-bold font-serif text-[#15232a] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#128bc0]" />
                Student Residency Dossier
              </h3>
              <button onClick={() => setViewingStudent(null)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-1">
                <span className="text-[#586d65]">Roll ID</span>
                <div className="text-sm font-bold text-[#15232a] uppercase">{viewingStudent.enrollmentNumber}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-1">
                <span className="text-[#586d65]">Department</span>
                <div className="text-sm font-bold text-[#15232a]">{viewingStudent.department}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-1">
                <span className="text-[#586d65]">Allocated Room</span>
                <div className="text-sm font-bold text-[#15232a]">Room #{viewingStudent.room?.roomNumber || '101'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] space-y-1">
                <span className="text-[#586d65]">Assigned Bed</span>
                <div className="text-sm font-bold text-[#128bc0]">Bed {viewingStudent.bed?.bedNumber || 'B-1'}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs space-y-1">
              <div className="text-[#586d65]">Parent / Guardian:</div>
              <div className="font-bold text-[#15232a]">{viewingStudent.parentName || 'N/A'} · Phone: {viewingStudent.parentPhone || 'N/A'}</div>
              <div className="text-[#586d65] text-[11px]">Address: {viewingStudent.address || 'Pune, Maharashtra'}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingStudent(null)}
                className="btn-arch-secondary text-xs px-4 py-2 rounded-xl"
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
