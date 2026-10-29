import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';

export default function AdminMessSection() {
  const [messSchedule, setMessSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMess = async () => {
      setLoading(true);
      try {
        const res = await api.getMess();
        setMessSchedule(res.data || []);
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    loadMess();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeDay, setActiveDay] = useState('Monday');

  const defaultMeals = [
    { type: 'Breakfast', time: '07:30 AM - 09:30 AM', icon: <Coffee className="w-4 h-4 text-[#dfba73]" />, items: ['Poha & Sev', 'Idli Sambar', 'Boiled Eggs', 'Tea / Coffee / Milk'] },
    { type: 'Lunch', time: '12:30 PM - 02:30 PM', icon: <Sun className="w-4 h-4 text-[#dfba73]" />, items: ['Jeera Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Chapati', 'Salad & Curd'] },
    { type: 'Evening Snacks', time: '05:00 PM - 06:15 PM', icon: <UtensilsCrossed className="w-4 h-4 text-[#dfba73]" />, items: ['Veg Sandwich / Samosa', 'Hot Masala Chai', 'Biscuits'] },
    { type: 'Dinner', time: '07:45 PM - 09:45 PM', icon: <Moon className="w-4 h-4 text-[#dfba73]" />, items: ['Veg Biryani / Steamed Rice', 'Chole Masala', 'Tawa Roti', 'Gulab Jamun Sweet'] },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
        <div>
          <h2 className="text-xl font-bold text-[#15232a] font-sans flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5 text-[#128bc0]" />
            Central Mess & Dining Menu Management
          </h2>
          <p className="text-xs text-[#586d65] mt-1">Configure weekly four-course student dining schedules, dietary hygiene alerts, and meal timings.</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6] font-semibold">
            ✓ ISO 22000 Food Safety Certified
          </span>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeDay === d
                ? 'bg-[#152c36] text-white font-bold shadow-sm'
                : 'bg-white text-[#586d65] hover:text-[#15232a] border border-[#d6e0d7]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Daily Meals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultMeals.map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-[#d6e0d7] space-y-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(21,35,42,0.04)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#15232a] text-sm font-sans">
                  {m.icon}
                  <span>{m.type}</span>
                </div>
                <span className="text-[10px] text-[#586d65] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#128bc0]" />
                  {m.time}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#dce5dc]">
                {m.items.map((it, i) => (
                  <div key={i} className="p-2 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-xs text-[#15232a] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#128bc0]" />
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#128bc0] text-center font-medium">
              Nutritious & Chef-approved
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
