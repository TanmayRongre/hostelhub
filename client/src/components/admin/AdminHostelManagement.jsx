import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Users,
  ShieldCheck,
  DoorOpen,
  DollarSign,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

export default function AdminHostelManagement({ onHostelsUpdated }) {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [hostelModalOpen, setHostelModalOpen] = useState(false);
  const [hostelForm, setHostelForm] = useState({
    name: '',
    code: '',
    gender: 'boys',
    capacity: 100,
    totalRooms: 40,
    address: 'Campus North Complex',
    status: 'active',
  });

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    hostel: '',
    roomNumber: '',
    floor: 1,
    capacity: 2,
    type: 'AC',
    rentPerMonth: 6500,
    status: 'available',
  });

  const handleAutofillHostel = () => {
    const blocks = ['Sahyadri Residency C', 'Nilgiri Premier Block', 'Aravali Tower B', 'Vindhya Scholars Wing'];
    const codes = ['SAY-C', 'NIL-A', 'ARV-B', 'VIN-W'];
    const idx = Math.floor(Math.random() * blocks.length);
    setHostelForm({
      name: blocks[idx],
      code: codes[idx],
      gender: 'boys',
      capacity: 180,
      totalRooms: 60,
      address: 'North Quad, MountReach Campus',
      status: 'active',
    });
  };

  const handleAutofillRoom = () => {
    const floor = Math.floor(1 + Math.random() * 3);
    const roomNum = `${floor}0${Math.floor(1 + Math.random() * 9)}`;
    setRoomForm({
      hostel: selectedHostel || hostels[0]?._id || '',
      roomNumber: roomNum,
      floor: floor,
      capacity: 2,
      type: 'AC',
      rentPerMonth: 6500,
      status: 'available',
    });
  };

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadHostelsAndRooms = async () => {
    setLoading(true);
    try {
      const [hostelsRes, roomsRes] = await Promise.allSettled([
        api.getHostels(),
        api.getRooms(),
      ]);

      if (hostelsRes.status === 'fulfilled' && hostelsRes.value.data) {
        setHostels(hostelsRes.value.data);
        if (hostelsRes.value.data.length > 0 && !selectedHostel) {
          setSelectedHostel(hostelsRes.value.data[0]._id);
        }
      }
      if (roomsRes.status === 'fulfilled' && roomsRes.value.data) {
        setRooms(roomsRes.value.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load hostels', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostelsAndRooms();
  }, []);

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    try {
      await api.createHostel(hostelForm);
      showToast('Hostel complex created successfully!');
      setHostelModalOpen(false);
      setHostelForm({ name: '', code: '', gender: 'boys', capacity: 100, totalRooms: 40, address: '', status: 'active' });
      loadHostelsAndRooms();
      if (onHostelsUpdated) onHostelsUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to create hostel', 'error');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.createRoom({
        ...roomForm,
        hostel: roomForm.hostel || selectedHostel,
      });
      showToast('Room created and beds provisioned!');
      setRoomModalOpen(false);
      setRoomForm({ hostel: '', roomNumber: '', floor: 1, capacity: 2, type: 'AC', rentPerMonth: 6500, status: 'available' });
      loadHostelsAndRooms();
      if (onHostelsUpdated) onHostelsUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to create room', 'error');
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (!selectedHostel) return true;
    return r.hostel?._id?.toString() === selectedHostel.toString() || r.hostel?.toString() === selectedHostel.toString();
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#128bc0]" />
            Hostel, Block & Room Infrastructure
          </h2>
          <p className="text-xs text-[#586d65] mt-0.5">Configure residential blocks, assign wardens, manage capacity, and track room statuses.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setHostelModalOpen(true)}
            className="btn-arch-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Hostel</span>
          </button>
          <button
            onClick={() => {
              setRoomForm((prev) => ({ ...prev, hostel: selectedHostel }));
              setRoomModalOpen(true);
            }}
            className="btn-arch-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#15232a]"
          >
            <DoorOpen className="w-4 h-4 text-[#128bc0]" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Hostel Selection Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {hostels.map((h) => (
          <button
            key={h._id}
            onClick={() => setSelectedHostel(h._id)}
            className={`p-4 rounded-2xl border text-left min-w-[220px] transition-all cursor-pointer ${
              selectedHostel === h._id
                ? 'bg-[#e8f1f5] border-[#128bc0] shadow-sm text-[#15232a]'
                : 'bg-white border-[#d6e0d7] hover:border-[#128bc0]/40 text-[#586d65] shadow-[0_2px_8px_rgba(21,35,42,0.02)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#128bc0] font-mono">{h.code}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">{h.status || 'Active'}</span>
            </div>
            <div className="text-sm font-bold text-[#15232a] mt-1">{h.name}</div>
            <div className="text-[11px] text-[#586d65] mt-1">Capacity: {h.capacity || 80} Beds · {h.gender === 'girls' ? 'Girls' : 'Boys'}</div>
          </button>
        ))}
      </div>

      {/* Visual Room Grid for Selected Hostel */}
      <div className="p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
          <div>
            <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#128bc0]" />
              Room Grid & Bed Allocations ({filteredRooms.length} Rooms)
            </h3>
            <p className="text-xs text-[#586d65]">Live residential units for currently selected hostel complex.</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available</span>
            <span className="flex items-center gap-1.5 text-amber-700"><span className="w-2 h-2 rounded-full bg-amber-500" /> Partial</span>
            <span className="flex items-center gap-1.5 text-rose-700"><span className="w-2 h-2 rounded-full bg-rose-500" /> Occupied</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((r) => (
              <div
                key={r._id}
                className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] hover:border-[#128bc0] transition-all space-y-2 flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#15232a]">#{r.roomNumber}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    r.type === 'AC' ? 'bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]' : 'bg-[#f5f6f0] text-[#586d65] border border-[#d6e0d7]'
                  }`}>
                    {r.type}
                  </span>
                </div>

                <div className="text-[11px] text-[#586d65]">
                  Floor {r.floor} · {r.capacity} Beds
                </div>

                <div className="pt-2 border-t border-[#dce5dc] flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-700 font-bold">₹{r.rentPerMonth?.toLocaleString('en-IN')}/mo</span>
                  <span className="text-[#586d65] font-medium">✓ Provisioned</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-xs text-[#586d65]">
              No rooms added to this hostel yet. Click "Add Room" to create units.
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: CREATE HOSTEL ── */}
      {hostelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#128bc0]" />
                Create Hostel Complex
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillHostel}
                  className="px-2.5 py-1 rounded-lg bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d5e8f2] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Autofill sample hostel details"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setHostelModalOpen(false)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs">✕</button>
              </div>
            </div>

            <form onSubmit={handleCreateHostel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Hostel Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahyadri Boys Hostel"
                    value={hostelForm.name}
                    onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Block Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAY-A"
                    value={hostelForm.code}
                    onChange={(e) => setHostelForm({ ...hostelForm, code: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0] uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Gender *</label>
                  <select
                    value={hostelForm.gender}
                    onChange={(e) => setHostelForm({ ...hostelForm, gender: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  >
                    <option value="boys">Boys Hostel</option>
                    <option value="girls">Girls Hostel</option>
                    <option value="co-ed">Co-Ed Complex</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Total Capacity (Beds) *</label>
                  <input
                    type="number"
                    required
                    value={hostelForm.capacity}
                    onChange={(e) => setHostelForm({ ...hostelForm, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setHostelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-arch-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Complex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE ROOM ── */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15232a]/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce5dc] pb-3">
              <h3 className="text-base font-bold font-serif text-[#15232a] tracking-tight flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#128bc0]" />
                Add Residential Room
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutofillRoom}
                  className="px-2.5 py-1 rounded-lg bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d5e8f2] border border-[#bce4f6] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Autofill sample room details"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
                <button onClick={() => setRoomModalOpen(false)} className="w-7 h-7 rounded-lg bg-[#f5f6f0] border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] flex items-center justify-center transition-colors cursor-pointer text-xs">✕</button>
              </div>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 201"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Floor *</label>
                  <input
                    type="number"
                    required
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Room Type</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  >
                    <option value="AC">AC Room</option>
                    <option value="Non-AC">Non-AC Standard</option>
                    <option value="Deluxe">Deluxe Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#15232a] mb-1 uppercase tracking-wider text-[11px]">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={roomForm.rentPerMonth}
                    onChange={(e) => setRoomForm({ ...roomForm, rentPerMonth: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#fbfbf9] border border-[#d6e0d7] rounded-xl text-[#15232a] focus:outline-none focus:border-[#128bc0]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#dce5dc]">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d6e0d7] text-[#586d65] hover:text-[#15232a] hover:bg-[#f5f6f0] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-arch-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Provision Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
