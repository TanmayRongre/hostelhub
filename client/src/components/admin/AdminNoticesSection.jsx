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
    <div className="space-y-6 animate-fade-in font-['Inter',sans-serif]">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
          toast.type === 'error' ? 'bg-rose-950/95 text-rose-200 border-rose-700/60' : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/60'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0e1219] border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white font-['Playfair_Display',serif] flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#dfba73]" />
            Notice & Announcement Broadcast Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">Publish urgent campus alerts, mess circulars, maintenance schedules, and warden updates.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-arch-primary text-xs px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.length > 0 ? (
          notices.map((n) => (
            <div key={n._id} className="p-6 rounded-2xl bg-[#0e1219] border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    n.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    n.priority === 'high' || n.priority === 'important' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30'
                  }`}>
                    {n.priority} · {n.category || 'General'}
                  </span>
                  <button
                    onClick={() => handleDeleteNotice(n._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white font-['Playfair_Display',serif]">{n.title}</h3>
                <p className="text-xs text-slate-300/90 leading-relaxed">{n.content}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Audience: <strong className="text-slate-300 capitalize">{n.targetAudience}</strong></span>
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 rounded-2xl bg-[#0e1219] border border-white/10">
            No notices published yet.
          </div>
        )}
      </div>

      {/* ── MODAL: PUBLISH NOTICE ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1219] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#dfba73]" />
                  Publish Campus Notice
                </h3>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill notice demo details"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Auto Fill Demo</span>
                </button>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Hostel Maintenance & Wi-Fi Upgrade"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-[#c5a059] transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-[#c5a059] transition-colors"
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
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-[#c5a059] transition-colors"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white font-semibold focus:outline-none focus:border-[#c5a059] transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="wardens">Wardens</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter notice announcement details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 bg-[#121620] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c5a059] transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-arch-secondary text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-arch-primary text-xs px-6 py-2.5 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-[#090b10]/30 border-t-[#090b10] rounded-full animate-spin" />}
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
