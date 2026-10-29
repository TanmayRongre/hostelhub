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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white border border-[#d6e0d7] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbfbf9] border-b border-[#dce5dc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-[#15232a] tracking-tight">Request Visitor Gatepass</h3>
              <p className="text-[11px] text-[#586d65]">Guest & parent campus entry clearance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-2.5 py-1 rounded-full bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d8effa] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Autofill visitor gatepass details"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
              <span>Auto Fill Demo</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white border border-[#d6e0d7] text-slate-400 hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Visitor Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Sharma"
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Relationship *</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
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
              <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Visitor Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Date of Visit *</label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Purpose of Visit *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Meeting student, delivering semester study supplies..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3.5 py-2 bg-[#fbfbf9] border border-[#dce5dc] rounded-lg text-[#15232a] focus:outline-none focus:border-[#128bc0] resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[11px] text-[#15232a] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#128bc0] shrink-0" />
            <span>Visitor gatepass will be submitted directly to Warden verification desk.</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#dce5dc]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#586d65] hover:text-[#15232a] text-xs font-semibold cursor-pointer"
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
