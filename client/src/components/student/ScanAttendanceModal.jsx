import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Zap,
  UploadCloud,
  ImageIcon,
} from 'lucide-react';
import api from '../../services/api';

export default function ScanAttendanceModal({ isOpen, onClose, student, user, onAttendanceMarked }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrameId = useRef(null);
  const streamRef = useRef(null);
  const hasScannedRef = useRef(false);
  const lastScanTimeRef = useRef(0);

  // Play audio chime on successful scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext not permitted or supported
    }
  };

  // Start Camera Stream with hardware fallback
  const startCamera = async (currentFacing = facingMode) => {
    setError('');
    setCameraError('');
    hasScannedRef.current = false;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use code verification or Instant Verify.');
      }

      // Stop previous tracks if switching
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: currentFacing },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback to any available video source
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play error:', playErr);
        }
      }

      setCameraActive(true);
      setScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Click Instant Verify, upload a QR screenshot, or enter the session code below.'
          : 'Camera device unavailable on this hardware. Click Instant Verify or use code entry below.'
      );
      setCameraActive(false);
      setScanning(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Ensure video element receives stream when active
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [cameraActive]);

  // Continuous frame analysis with jsQR (downscaled & throttled for 60fps UI)
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || hasScannedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const now = performance.now();
    // Throttle to every 110ms to keep CPU usage minimal and video render fluid
    if (now - lastScanTimeRef.current < 110) {
      if (scanning && !hasScannedRef.current) {
        animationFrameId.current = requestAnimationFrame(scanVideoFrame);
      }
      return;
    }
    lastScanTimeRef.current = now;

    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      // Downscale to max 480px width for fast, reliable decoding without freezing
      const maxDim = 480;
      const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.floor(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.floor(video.videoHeight * scale));

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data && !hasScannedRef.current) {
          hasScannedRef.current = true;
          playBeep();
          handleProcessScannedData(code.data);
          return;
        }
      }
    }

    if (scanning && !hasScannedRef.current) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  useEffect(() => {
    if (scanning && cameraActive) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scanning, cameraActive]);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setError('');
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Process decoded QR or manual session token
  const handleProcessScannedData = async (rawData, force = false) => {
    stopCamera();
    setError('');
    setVerifying(true);

    let extractedToken = typeof rawData === 'string' ? rawData.trim() : '';
    // If rawData is JSON string, parse out the sessionToken
    if (typeof rawData === 'string' && rawData.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.sessionToken) extractedToken = parsed.sessionToken;
        else if (parsed.token) extractedToken = parsed.token;
      } catch {}
    }

    try {
      const res = await api.scanAttendance({
        qrData: rawData,
        sessionToken: extractedToken.startsWith('ATT-') ? extractedToken : undefined,
        force,
      });

      if (res.success) {
        setScanResult(res);
        if (onAttendanceMarked) {
          onAttendanceMarked(res.data);
        }
      } else {
        setError(res.message || 'Invalid or expired attendance QR code');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify attendance scan');
    } finally {
      setVerifying(false);
    }
  };

  // Handle image file upload for QR scanning
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const maxDim = 800;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            playBeep();
            handleProcessScannedData(code.data);
          } else {
            setError('Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible or use Instant Verify.');
          }
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };


  const handleAutofillCode = async () => {
    try {
      const sessionRes = await api.getActiveAttendanceSession();
      const code =
        sessionRes?.data?.sessionToken ||
        sessionRes?.data?.qrPayload ||
        `ATT-${student?.hostel?.code || 'BLK-A'}-${new Date().toISOString().split('T')[0]}`;
      setManualCode(code);
    } catch {
      setManualCode(`ATT-${student?.hostel?.code || 'BLK-A'}-2026`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessScannedData(manualCode.trim());
  };

  // 1-Click Demo Scanner (fetches live active session or verifies instantly)
  const handleInstantDemoScan = async (force = false) => {
    setError('');
    try {
      const sessionRes = await api.getActiveAttendanceSession();
      const token =
        sessionRes?.data?.sessionToken ||
        sessionRes?.data?.qrPayload ||
        `ATT-${student?.hostel?.code || 'SAY'}-ACTIVE`;
      playBeep();
      await handleProcessScannedData(token, force);
    } catch (err) {
      setError(err.message || 'Failed to verify attendance');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white border border-[#d6e0d7] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbfbf9] border-b border-[#dce5dc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] text-[#128bc0]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#15232a]">Live Attendance Scanner</h3>
              <p className="text-[11px] text-[#586d65]">Scan Warden's daily QR code to mark presence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white text-slate-400 hover:text-[#15232a] border border-[#d6e0d7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden Canvas and File Input */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Scanner Viewfinder Box */}
        <div className="p-6 space-y-4 text-center">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 text-left animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {scanResult ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#15232a]">
                {scanResult.alreadyMarked ? 'Already Verified Today!' : 'Attendance Verified Present!'}
              </h4>
              <p className="text-xs text-emerald-800">{scanResult.message}</p>
              <div className="text-[11px] text-[#586d65] pt-2 border-t border-emerald-200 flex items-center justify-center gap-4">
                <span>Time: {new Date().toLocaleTimeString()}</span>
                <span>•</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
              {scanResult.alreadyMarked && (
                <button
                  type="button"
                  onClick={() => handleInstantDemoScan(true)}
                  className="mt-2 w-full py-2 px-3 rounded-lg bg-[#e8f1f5] hover:bg-[#d8effa] border border-[#bce4f6] text-xs font-semibold text-[#128bc0] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Re-verify / Force Update Presence</span>
                </button>
              )}
            </div>
          ) : (
            <div className="relative mx-auto w-full max-w-[280px] h-[280px] rounded-2xl bg-[#15232a] border-2 border-[#128bc0]/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              {/* Video Element is ALWAYS rendered to prevent null ref binding */}
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                autoPlay
                playsInline
                muted
              />

              {cameraActive ? (
                <>
                  {/* Animated Optical Laser Line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce z-20 pointer-events-none" />
                  {/* Switch Camera Button */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="absolute top-2.5 right-2.5 z-30 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
                    title="Switch Camera (front/back)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="p-6 text-center space-y-3 z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-[#38bdf8] flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {cameraError ? 'Camera Mode Inactive' : 'Initializing camera stream...'}
                  </div>
                  {cameraError && (
                    <div className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                      {cameraError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-slate-200 hover:text-white border border-white/20 transition-colors"
                  >
                    Retry Camera
                  </button>
                </div>
              )}

              {/* Viewfinder Target Reticle Frame */}
              <div className="absolute inset-4 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#38bdf8] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#38bdf8] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#38bdf8] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#38bdf8] rounded-br-lg" />
              </div>

              {cameraActive && (
                <div className="absolute bottom-3 inset-x-3 z-20 bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-full text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Align Warden's QR Code inside frame
                </div>
              )}
            </div>
          )}

          {/* Student Terminal Location Info */}
          <div className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#dce5dc] text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#15232a]">
              <span className="flex items-center gap-1.5 text-[#586d65]">
                <MapPin className="w-3.5 h-3.5 text-[#128bc0]" />
                Hostel Complex:
              </span>
              <strong className="text-[#15232a]">{student?.hostel?.name || 'Campus Block'}</strong>
            </div>
            <div className="flex items-center justify-between text-[#15232a]">
              <span className="flex items-center gap-1.5 text-[#586d65]">
                <Clock className="w-3.5 h-3.5 text-[#128bc0]" />
                Resident Roll:
              </span>
              <strong className="text-[#15232a] uppercase">{student?.enrollmentNumber || user?.enrollmentNumber || 'CS2026'}</strong>
            </div>
          </div>

          {/* Manual Input Drawer */}
          {showManualInput && !scanResult && (
            <form onSubmit={handleManualSubmit} className="space-y-2 text-left animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#586d65] uppercase tracking-wider">
                  Enter Warden QR Session Code
                </label>
                <button
                  type="button"
                  onClick={handleAutofillCode}
                  className="px-2.5 py-1 rounded-full bg-[#e8f1f5] text-[#128bc0] hover:bg-[#d8effa] border border-[#bce4f6] text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Autofill active session code"
                >
                  <Sparkles className="w-3 h-3 text-[#128bc0]" />
                  <span>Auto Fill Demo</span>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ATT-SAY-A-XXXX"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#fbfbf9] border border-[#dce5dc] text-xs text-[#15232a] placeholder-slate-400 uppercase font-mono focus:outline-none focus:border-[#128bc0]"
                  required
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-arch-primary text-xs !py-2 !px-4"
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          )}

          {/* Actions */}
          <div className="pt-2 space-y-2">
            {!scanResult ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleInstantDemoScan(false)}
                    className="flex-1 py-3 rounded-xl btn-arch-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Zap className={`w-4 h-4 text-white ${verifying ? 'animate-spin' : ''}`} />
                    <span>{verifying ? 'Verifying Scan...' : 'Instant Verify Active QR'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-3 rounded-xl bg-[#fbfbf9] hover:bg-[#e8f1f5] text-[#15232a] text-xs font-semibold cursor-pointer border border-[#dce5dc] flex items-center gap-1"
                    title="Upload QR Image file"
                  >
                    <UploadCloud className="w-4 h-4 text-[#128bc0]" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="px-3.5 py-3 rounded-xl bg-[#fbfbf9] hover:bg-[#e8f1f5] text-[#15232a] text-xs font-semibold cursor-pointer border border-[#dce5dc]"
                    title="Enter code manually"
                  >
                    {showManualInput ? 'Camera' : 'Code'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanResult(null);
                    setError('');
                    hasScannedRef.current = false;
                    startCamera();
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#fbfbf9] hover:bg-[#e8f1f5] text-[#15232a] text-xs font-semibold cursor-pointer border border-[#dce5dc] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#128bc0]" />
                  <span>Scan Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl btn-arch-primary text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
