import React, { useState } from 'react';
import { X, UserPlus, Users, Phone, Calendar, Clock, AlertCircle, CheckCircle2, ShieldCheck, FileCheck, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function RequestVisitorModal({ isOpen, onClose, student, user, onVisitorCreated }) {
  const [formData, setFormData] = useState({
    visitorName: 'Rajesh Sharma',
    relationship: 'Parent',
    phone: '+91 98765 43210',
    visitDate: new Date().toISOString().split('T')[0],
    purpose: 'Delivering semester essential items & academic textbooks',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDemoFill = () => {
    setFormData({
      visitorName: 'Rajesh Sharma',
      relationship: 'Parent',
      phone: '+91 98765 43210',
      visitDate: new Date().toISOString().split('T')[0],
      purpose: 'Delivering semester essential items & academic textbooks',
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.visitorName.trim() || !formData.phone.trim() || !formData.purpose.trim()) {
      setError('Please fill in visitor name, phone, and purpose of visit');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createVisitor({
        ...formData,
        student: user?._id,
      });

      if (res.success) {
        onVisitorCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to request visitor pass');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-[#0e1219] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#121620] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#dfba73]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-white tracking-tight">Request Visitor Gatepass</h3>
              <p className="text-[11px] text-slate-400">Guest & parent campus entry clearance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Autofill visitor gatepass details"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Auto Fill Demo</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Visitor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Sharma"
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                className="w-full px-3 py-2 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Relationship *</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
              >
                <option value="Parent">Parent (Father/Mother)</option>
                <option value="Guardian">Guardian</option>
                <option value="Sibling">Sibling (Brother/Sister)</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend / Peer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Visitor Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Date of Visit *</label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[11px]">Purpose of Visit *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Meeting student, delivering semester study supplies..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#121620] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#dfba73] resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#121620] border border-white/[0.08] text-[11px] text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#dfba73] shrink-0" />
            <span>Visitor gatepass will be submitted directly to Warden verification desk.</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-arch-primary px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : 'Send for Warden Approval →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
