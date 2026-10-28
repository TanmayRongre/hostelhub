import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  User,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import '../styles/AuthForm.css';

export default function AuthForm({ initialActive = false }) {
  const [isActive, setIsActive] = useState(initialActive);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('student');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Forgot Password Modal States
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Sync state with URL if user navigates between /login and /register
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsActive(true);
    } else if (location.pathname === '/login') {
      setIsActive(false);
    }
  }, [location.pathname]);

  const handleToggle = (active) => {
    setIsActive(active);
    setLoginError('');
    setRegisterError('');
    setRegisterSuccess('');
    if (active) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      const role = res?.user?.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'warden') {
        navigate('/warden');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid username/email or password credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

    setRegisterLoading(true);

    try {
      const res = await register(registerName, registerEmail, registerPassword, registerRole);
      setRegisterSuccess('Account registered successfully! Redirecting...');
      const role = res?.user?.role || registerRole;
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'warden') {
          navigate('/warden');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const autofillDemo = (role) => {
    if (role === 'student') {
      setLoginEmail('student@mountreach.edu');
      setLoginPassword('student123');
    } else if (role === 'warden') {
      setLoginEmail('warden@mountreach.edu');
      setLoginPassword('warden123');
    } else if (role === 'admin') {
      setLoginEmail('admin@mountreach.edu');
      setLoginPassword('admin123');
    }
  };

  const handleRegisterAutofill = () => {
    const demoNames = ['Aarav Sharma', 'Rohan Verma', 'Ananya Patel', 'Ishaan Gupta', 'Priya Deshmukh'];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setRegisterName(randomName);
    setRegisterEmail(`${randomName.toLowerCase().replace(' ', '.')}${randomNum}@mountreach.edu`);
    setRegisterRole('student');
    setRegisterPassword('Student@123');
    setRegisterError('');
  };

  const handleSendReset = (e) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background with theme overlay */}
      <div className="auth-bg-image" />
      <div className="auth-bg-overlay" />

      <div className={`auth-container container ${isActive ? 'active' : ''}`}>

        {/* ── MOBILE SWITCHER BAR (visible only on screens <= 700px) ── */}
        <div className="mobile-auth-switcher">
          <button
            type="button"
            className={`mobile-switcher-btn ${!isActive ? 'active' : ''}`}
            onClick={() => handleToggle(false)}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`mobile-switcher-btn ${isActive ? 'active' : ''}`}
            onClick={() => handleToggle(true)}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* ════════════════════════════════════════
            LOGIN FORM BOX
            ════════════════════════════════════════ */}
        <div className="form-box login">
          <form onSubmit={handleLoginSubmit}>
            <div className="flex items-center justify-between gap-2">
              <h1>Portal Sign In</h1>
              <button
                type="button"
                onClick={() => autofillDemo('student')}
                className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Autofill demo student credentials"
              >
                <Sparkles className="w-3 h-3 text-[#dfba73]" />
                <span>Auto Fill Demo</span>
              </button>
            </div>
            <p className="auth-subtitle">
              Access your institutional residence dashboard
            </p>

            {loginError && (
              <div className="auth-alert error">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="input-box">
              <input
                type="text"
                placeholder="Enrollment ID / Institutional Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <User className="input-icon w-4 h-4" />
            </div>

            <div className="input-box">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Account Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="forgot-link">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotModal(true);
                  setForgotSent(false);
                }}
              >
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn-primary-auth" disabled={loginLoading}>
              <LogIn className="w-4 h-4" />
              <span>{loginLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>

            {/* Quick Demo Credentials */}
            <div className="demo-credentials">
              <button
                type="button"
                className="demo-chip"
                onClick={() => autofillDemo('student')}
                title="Fill Student credentials"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#dfba73]" />
                <span>Student Demo</span>
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => autofillDemo('warden')}
                title="Fill Warden credentials"
              >
                <Building2 className="w-3.5 h-3.5 text-[#34d399]" />
                <span>Warden Demo</span>
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => autofillDemo('admin')}
                title="Fill Admin credentials"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Admin Demo</span>
              </button>
            </div>
          </form>
        </div>

        {/* ════════════════════════════════════════
            REGISTER FORM BOX
            ════════════════════════════════════════ */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <div className="flex items-center justify-between gap-2">
              <h1>Create Account</h1>
              <button
                type="button"
                onClick={handleRegisterAutofill}
                className="px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title="Autofill realistic student registration data"
              >
                <Sparkles className="w-3 h-3 text-[#dfba73]" />
                <span>Auto Fill Demo</span>
              </button>
            </div>
            <p className="auth-subtitle">
              Register as Student, Warden, or Administrator
            </p>

            {registerError && (
              <div className="auth-alert error">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}
            {registerSuccess && (
              <div className="auth-alert success">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{registerSuccess}</span>
              </div>
            )}

            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name (as per Institutional Record)"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
              <User className="input-icon w-4 h-4" />
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Institutional College Email ID"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <Mail className="input-icon w-4 h-4" />
            </div>

            <div className="input-box">
              <select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
              >
                <option value="student">Role: Student Resident</option>
                <option value="warden">Role: Residence Warden Staff</option>
                <option value="admin">Role: Campus Administrator</option>
              </select>
              <ChevronDown className="input-icon w-4 h-4 pointer-events-none" />
            </div>

            <div className="input-box">
              <input
                type={showRegPassword ? 'text' : 'password'}
                placeholder="Create Password (min 6 characters)"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowRegPassword(!showRegPassword)}
                aria-label="Toggle password visibility"
              >
                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" className="btn-primary-auth" disabled={registerLoading}>
              <UserPlus className="w-4 h-4" />
              <span>{registerLoading ? 'Provisioning Account...' : 'Register Account'}</span>
            </button>
          </form>
        </div>

        {/* ════════════════════════════════════════
            SLIDING TOGGLE PANEL (Desktop / Tablet)
            ════════════════════════════════════════ */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <div className="badge-pill">
              <Building2 className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>HostelHub Institutional</span>
            </div>
            <h1>New to Residence?</h1>
            <p>
              Enroll with your student credentials to submit room allotment requests,
              access meal schedules, and raise maintenance tickets.
            </p>
            <button
              type="button"
              className="btn-toggle-outline"
              onClick={() => handleToggle(true)}
            >
              Create Account
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <div className="badge-pill">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Verified Gateway</span>
            </div>
            <h1>Welcome Back</h1>
            <p>
              Already registered? Sign in to access your student, warden, or administrative
              residential dashboard.
            </p>
            <button
              type="button"
              className="btn-toggle-outline"
              onClick={() => handleToggle(false)}
            >
              Sign In
            </button>
          </div>
        </div>

      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-md p-6 rounded-xl bg-[#0e1219] border border-white/[0.1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-white">Reset Account Password</h3>
              <button
                onClick={() => setForgotModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Password Reset Link Dispatched</span>
                </div>
                <p>If an account with <strong>{forgotEmail || 'your email'}</strong> exists in our records, a secure password reset link has been dispatched to your inbox.</p>
                <button
                  onClick={() => setForgotModal(false)}
                  className="w-full py-2 mt-2 rounded-md bg-[#c5a059] text-[#090b10] font-semibold text-xs cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Enter your registered institutional college email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotEmail('student@mountreach.edu')}
                    className="px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#dfba73] hover:bg-[#c5a059]/25 border border-[#c5a059]/30 text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto Fill</span>
                  </button>
                </div>
                <input
                  type="email"
                  placeholder="name@mountreach.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#141824] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#dfba73]"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-md bg-[#c5a059] hover:bg-[#dfba73] text-[#090b10] font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}