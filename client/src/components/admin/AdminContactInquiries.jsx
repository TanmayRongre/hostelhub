import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  User,
  Tag,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';

export default function AdminContactInquiries() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getContactMessages();
      if (res.success) {
        setTickets(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch contact tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setUpdating(true);
    try {
      const res = await api.updateContactMessage(ticketId, {
        status: newStatus,
        responseNotes: resolutionNotes || selectedTicket?.responseNotes,
      });
      if (res.success) {
        showToast(`Ticket ${res.data.ticketNumber} updated to ${newStatus}`);
        setTickets((prev) => prev.map((t) => (t._id === ticketId ? res.data : t)));
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      t.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.message?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.inquiry === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-slide-up ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-200 border-rose-700/60'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-700/60'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Header & KPI summary cards ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-[#dfba73]" />
            Contact Inquiries &amp; Helpdesk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming public questions, student accommodation queries, and official support tickets
          </p>
        </div>

        <button
          onClick={loadTickets}
          disabled={loading}
          className="btn-arch-secondary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#dfba73]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#121620] border border-white/[0.08] hover:border-[#c5a059]/30 shadow-xl space-y-1 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Inquiries</div>
          <div className="text-2xl font-bold font-serif text-white">{tickets.length}</div>
          <div className="text-[11px] text-slate-500">All recorded tickets</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#121620] border border-white/[0.08] hover:border-[#c5a059]/30 shadow-xl space-y-1 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Review</div>
          <div className="text-2xl font-bold font-serif text-amber-300">{openCount}</div>
          <div className="text-[11px] text-amber-400/70">Awaiting response</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#121620] border border-white/[0.08] hover:border-[#c5a059]/30 shadow-xl space-y-1 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#dfba73]">In Progress</div>
          <div className="text-2xl font-bold font-serif text-[#dfba73]">{inProgressCount}</div>
          <div className="text-[11px] text-[#dfba73]/70">Under action</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1219] hover:bg-[#121620] border border-white/[0.08] hover:border-[#c5a059]/30 shadow-xl space-y-1 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Resolved</div>
          <div className="text-2xl font-bold font-serif text-emerald-300">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-400/70">Closed tickets</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-xl bg-[#0e1219] border border-white/[0.08] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Ticket ID, Name, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121620] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba73]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#121620] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-[#dfba73] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Pending (Open)</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#121620] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-[#dfba73] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="general">General Campus</option>
            <option value="booking">Hostel Admission &amp; Booking</option>
            <option value="fees">Fee Dues &amp; Payment</option>
            <option value="facilities">Mess &amp; Facilities</option>
            <option value="complaint">Complaint &amp; Grievance</option>
            <option value="other">Other Official</option>
          </select>
        </div>
      </div>

      {/* ── Main Tickets Table / Grid ── */}
      {loading ? (
        <div className="p-12 text-center rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-3">
          <div className="w-8 h-8 border-2 border-[#dfba73]/30 border-t-[#dfba73] rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-400">Loading incoming contact tickets...</div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0e1219] border border-white/[0.08] space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold font-serif text-white">No Inquiry Tickets Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No tickets match the selected filter criteria.'
              : 'There are no contact inquiries logged yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#0e1219] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#121620] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="px-4 py-3.5">Ticket ID</th>
                  <th className="px-4 py-3.5">Sender</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Message Excerpt</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredTickets.map((t) => {
                  const isPending = t.status === 'open';
                  const isInProgress = t.status === 'in_progress';
                  const isResolved = t.status === 'resolved' || t.status === 'closed';

                  return (
                    <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#dfba73]">
                        {t.ticketNumber || `TKT-${t._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">
                          {t.firstName} {t.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <a href={`mailto:${t.email}`} className="text-slate-400 hover:text-[#dfba73]" title="Email sender">
                            {t.email}
                          </a>
                          {t.phone && (
                            <>
                              <span>•</span>
                              <a href={`tel:${t.phone}`} className="text-slate-400 hover:text-emerald-400" title="Call sender">
                                {t.phone}
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#121620] text-slate-300 border border-white/[0.08] capitalize">
                          {t.inquiry || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-300">
                        {t.message}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isPending
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isInProgress
                              ? 'bg-[#c5a059]/15 text-[#dfba73] border-[#c5a059]/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {t.status === 'open' ? 'Pending' : t.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setResolutionNotes(t.responseNotes || '');
                          }}
                          className="btn-arch-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TICKET REVIEW & RESOLUTION MODAL ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0e1219] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#dfba73]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white tracking-tight">Ticket {selectedTicket.ticketNumber}</h3>
                  <p className="text-[11px] text-slate-400">
                    Received on {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Sender Info Card */}
            <div className="p-3.5 rounded-xl bg-[#121620] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sender:</span>
                <strong className="text-white">
                  {selectedTicket.firstName} {selectedTicket.lastName}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Email:</span>
                <a href={`mailto:${selectedTicket.email}`} className="text-[#dfba73] hover:underline">
                  {selectedTicket.email}
                </a>
              </div>
              {selectedTicket.phone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Phone:</span>
                  <a href={`tel:${selectedTicket.phone}`} className="text-emerald-400 hover:underline">
                    {selectedTicket.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Category:</span>
                <span className="px-2 py-0.5 rounded-md bg-[#0e1219] border border-white/[0.08] text-slate-300 font-bold uppercase text-[10px]">
                  {selectedTicket.inquiry}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inquiry Message</label>
              <div className="p-3.5 rounded-xl bg-[#121620] border border-white/[0.08] text-xs text-slate-200 leading-relaxed max-h-40 overflow-y-auto">
                {selectedTicket.message}
              </div>
            </div>

            {/* Resolution Notes */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Staff Action &amp; Resolution Remarks
                </label>
                <button
                  type="button"
                  onClick={() => setResolutionNotes('Resident inquiry investigated by hostel administrative office. Maintenance technician dispatched to inspect room fixtures and resolved with student confirmation.')}
                  className="px-2 py-0.5 rounded-md bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill demonstration remarks"
                >
                  <Sparkles className="w-3 h-3 text-[#dfba73]" />
                  <span>Auto Fill Demo</span>
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Add resolution notes or action taken..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#121620] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba73]"
              />
            </div>

            {/* Status Change Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket._id, 'in_progress')}
                  disabled={updating || selectedTicket.status === 'in_progress'}
                  className="px-3.5 py-2 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#dfba73] border border-[#c5a059]/30 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}
                  disabled={updating || selectedTicket.status === 'resolved'}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  ✓ Mark Resolved
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg border border-white/[0.1] text-slate-300 hover:bg-white/[0.05] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
