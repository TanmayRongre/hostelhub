import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import api from '../../services/api';

export default function AdminNoticesSection({ onNoticesUpdated }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'normal',
    targetAudience: 'all',
  });

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDemoFill = () => {
    setFormData({
      title: 'Semester Hostel Fee Clearance & Maintenance Update',
      content: 'All hostel residents are requested to ensure all semester dues are settled by the upcoming weekend. The maintenance team will also be performing network router optimizations.',
      category: 'General',
      priority: 'high',
      targetAudience: 'all',
    });
  };

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await api.getNotices();
      setNotices(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please enter both notice title and content', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.createNotice(formData);
      showToast('Notice broadcasted to campus portal successfully!');
      setModalOpen(false);
      setFormData({ title: '', content: '', category: 'General', priority: 'normal', targetAudience: 'all' });
      await loadNotices();
      if (onNoticesUpdated) onNoticesUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to publish notice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await api.deleteNotice(id);
      showToast('Notice deleted');
      loadNotices();
    } catch (err) {
      showToast(err.message || 'Failed to delete notice', 'error');
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div>
          <h2 className="text-xl font-bold text-[#15232a] font-serif flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#128bc0]" />
            Notice & Announcement Broadcast Hub
          </h2>
          <p className="text-xs text-[#586d65] mt-1">Publish urgent campus alerts, mess circulars, maintenance schedules, and warden updates.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-arch-primary text-xs px-4 py-2.5 flex items-center gap-1.5 cursor-pointer rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.length > 0 ? (
          notices.map((n) => (
            <div key={n._id} className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    n.priority === 'urgent' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                    n.priority === 'high' || n.priority === 'important' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]'
                  }`}>
                    {n.priority} · {n.category || 'General'}
                  </span>
                  <button
                    onClick={() => handleDeleteNotice(n._id)}
                    className="text-[#586d65] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-[#15232a] font-serif">{n.title}</h3>
                <p className="text-xs text-[#15232a]/90 leading-relaxed">{n.content}</p>
              </div>

              <div className="pt-3 border-t border-[#dce5dc] flex items-center justify-between text-[11px] text-[#586d65]">
                <span>Audience: <strong className="text-[#15232a] capitalize">{n.targetAudience}</strong></span>
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-[#586d65] rounded-2xl bg-white border border-[#d6e0d7]">
            No notices published yet.
          </div>
        )}
      </div>

      {/* ── MODAL: PUBLISH NOTICE ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif text-[#15232a] flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#128bc0]" />
                  Publish Campus Notice
                </h3>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="px-2.5 py-1 rounded-lg bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d5e8f2] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Autofill notice demo details"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#15232a] mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Hostel Maintenance & Wi-Fi Upgrade"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                  >
                    <option value="General">General</option>
                    <option value="Rules & Discipline">Rules</option>
                    <option value="Mess">Mess</option>
                    <option value="Maintenance">Repair</option>
                    <option value="Fee Reminder">Fees</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#15232a] mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#15232a] mb-1">Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] font-semibold focus:outline-none focus:border-[#128bc0] transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="wardens">Wardens</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#15232a] mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter notice announcement details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0] transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0] font-medium cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-arch-primary text-xs px-6 py-2.5 disabled:opacity-50 cursor-pointer flex items-center gap-2 rounded-xl"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{submitting ? 'Publishing...' : 'Broadcast Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
