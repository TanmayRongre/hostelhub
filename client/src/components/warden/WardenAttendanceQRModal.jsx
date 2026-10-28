import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import api from '../../services/api';
import {
  QrCode,
  X,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Users,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export default function WardenAttendanceQRModal({ isOpen, onClose, hostel, attendanceList = [] }) {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const fetchOrGenerateQR = async () => {
    setLoading(true);
    setError('');
    try {
      // First check if an active session already exists today
      const activeRes = await api.getActiveAttendanceSession();
      if (activeRes?.success && activeRes?.data) {
        setSessionData(activeRes.data);
      } else {
        // Generate new session
        const genRes = await api.generateAttendanceQR({
          hostelId: hostel?._id,
        });
        if (genRes?.success && genRes?.data) {
          setSessionData(genRes.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize QR session');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const genRes = await api.generateAttendanceQR({
        hostelId: hostel?._id,
      });
      if (genRes?.success && genRes?.data) {
        setSessionData(genRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate QR session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrGenerateQR();
    }
  }, [isOpen]);

  useEffect(() => {
    if (sessionData && canvasRef.current) {
      // Use clean session token directly for large, distinct, high-contrast QR dots that scan easily from screens
      const payloadString =
        sessionData.sessionToken ||
        (typeof sessionData.qrPayload === 'string'
          ? sessionData.qrPayload
          : JSON.stringify(sessionData.qrPayload));

      QRCode.toCanvas(
        canvasRef.current,
        payloadString,
        {
          width: fullscreen ? 360 : 260,
          margin: 3,
          color: {
            dark: '#030712',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (err) => {
          if (err) console.error('QR render error:', err);
        }
      );
    }
  }, [sessionData, fullscreen]);

  if (!isOpen) return null;

  const todayStr = new Date().toDateString();
  const todayAttendedCount = attendanceList.filter(
    (a) => new Date(a.date).toDateString() === todayStr && a.status === 'present'
  ).length;

  const handleCopyCode = () => {
    if (sessionData?.sessionToken) {
      navigator.clipboard.writeText(sessionData.sessionToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div
        className={`relative w-full ${
          fullscreen ? 'max-w-2xl' : 'max-w-md'
        } bg-[#0e1219] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#121620] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#dfba73]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-white tracking-tight flex items-center gap-2">
                Hostel Attendance Terminal QR
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#c5a059]/15 text-[#dfba73] border border-[#c5a059]/30">
                  Live Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {hostel?.name || 'Campus Hostel Block'} · {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFullscreen(!fullscreen)}
              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title={fullscreen ? 'Exit kiosk mode' : 'Kiosk full view'}
            >
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 space-y-5 text-center flex flex-col items-center">
          {error && (
            <div className="w-full p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="w-64 h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#dfba73]/30 border-t-[#dfba73] rounded-full animate-spin" />
              <div className="text-xs text-slate-400">Generating secure QR code session...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Canvas Card */}
              <div className="relative inline-block p-4 rounded-xl bg-white shadow-2xl border-2 border-[#c5a059]/50">
                <canvas ref={canvasRef} className="rounded-lg" />
                <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  HostelHub Smart QR Terminal
                </div>
              </div>

              {/* Session Token & Attended Counter */}
              <div className="w-full max-w-sm p-3.5 rounded-xl bg-[#121620] border border-white/[0.08] space-y-2 text-left text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#dfba73]" />
                    Session Code:
                  </span>
                  <span className="font-mono font-bold text-[#dfba73]">
                    {sessionData?.sessionToken || 'ATT-SAY-ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#dfba73]" />
                    Residents Present Today:
                  </span>
                  <span className="font-bold text-white px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                    {todayAttendedCount} marked
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/[0.08]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading}
              className="btn-arch-primary flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
