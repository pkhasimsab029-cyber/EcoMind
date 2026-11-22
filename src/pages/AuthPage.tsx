import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Zap,
  AlertCircle,
  Users
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import {
  LeafLogo,
  PersonTechIllustration,
  Co2CloudIllustration
} from '../components/illustrations/Illustrations';

export const AuthPage: React.FC = () => {
  const { login, register, registeredUsers } = useEco();

  // Active mode toggle between Register and Login
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(
    registeredUsers.length > 0 ? 'login' : 'register'
  );

  // Form states - Register (Clean, no demo hardcoding)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<{ [key: string]: string }>({});

  // Form states - Login (Clean, no demo hardcoding)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginErrors, setLoginErrors] = useState<{ [key: string]: string }>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validateRegister = () => {
    const errors: { [key: string]: string } = {};
    if (!regName.trim()) {
      errors.name = 'Please enter your full name.';
    }
    if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!regPassword || regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLogin = () => {
    const errors: { [key: string]: string } = {};
    if (!loginEmail.trim() || !loginEmail.includes('@') || !loginEmail.includes('.')) {
      errors.email = 'Please enter your registered email address.';
    }
    if (!loginPassword) {
      errors.password = 'Please enter your password.';
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsLoading(true);
    setRegErrors({});

    setTimeout(() => {
      const res = register(regName, regEmail, regPassword);
      setIsLoading(false);
      if (!res.success && res.error) {
        setRegErrors({ general: res.error });
      }
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsLoading(true);
    setLoginErrors({});

    setTimeout(() => {
      const res = login(loginEmail, loginPassword);
      setIsLoading(false);
      if (!res.success && res.error) {
        setLoginErrors({ general: res.error });
      }
    }, 400);
  };

  // Google sign-in is completed by the backend OAuth flow. No password is requested or stored.
  const handleGoogleAuth = () => {
    window.location.assign('/api/auth/google');
  };

  return (
    <div className="min-h-screen bg-[#F4F9F6] text-slate-800 flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-emerald-100/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <LeafLogo size={26} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-emerald-950 font-sans">
                EcoMind
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Step 1
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Digital Carbon Footprint Prediction & Reduction System
            </p>
          </div>
        </div>

        {/* Device Accounts Badge */}
        {registeredUsers.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>{registeredUsers.length} account{registeredUsers.length > 1 ? 's' : ''} on this device</span>
          </div>
        )}
      </header>

      {/* Main 3-Column Content Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT PANEL: Illustration & Slogan */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="w-full max-w-xs mx-auto lg:mx-0">
              <PersonTechIllustration className="w-full h-auto drop-shadow-md" />
            </div>

            <div className="space-y-2 max-w-xs">
              <p className="font-handwritten text-3xl sm:text-4xl text-emerald-700 font-bold leading-tight drop-shadow-xs">
                “Smarter Digital Choices for a Greener Tomorrow”
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Create your personal account to track and forecast the carbon footprint of your daily cloud, AI prompts, and computing workflows.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-full border border-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Independent Per-User Telemetry</span>
            </div>
          </div>

          {/* CENTER PANEL: Create Account + Connection Arrow + Welcome Back */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Visual Flow Header / Switcher */}
            <div className="flex items-center justify-center gap-3 mb-4 bg-white/90 p-1.5 rounded-2xl border border-emerald-100 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setRegErrors({});
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[#1F9D55] text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                1. Create Account
              </button>

              <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                <span>➔</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setLoginErrors({});
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#1F9D55] text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                2. Welcome Back (Login)
              </button>
            </div>

            {/* Existing Accounts Quick Switcher (if any registered on device) */}
            {registeredUsers.length > 0 && activeTab === 'login' && (
              <div className="w-full max-w-md mb-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                  Registered accounts on this device:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {registeredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setLoginEmail(u.email);
                        setLoginErrors({});
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-medium hover:bg-emerald-100/70 transition-colors cursor-pointer"
                      title={`Click to fill email: ${u.email}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{u.name}</span>
                      <span className="text-[10px] text-slate-400">({u.email})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cards Container with Arrow */}
            <div className="w-full max-w-md relative">
              {/* Tab 1: CREATE ACCOUNT CARD */}
              {activeTab === 'register' && (
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-emerald-100/90 relative animate-in fade-in duration-200">
                  <div className="mb-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Step 1 • Register
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 font-sans">
                      Create Your Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Register with your details to start tracking your digital footprint
                    </p>
                  </div>

                  {/* General Registration Error Banner */}
                  {regErrors.general && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{regErrors.general}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Sarah Miller"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"
                          required
                        />
                      </div>
                      {regErrors.name && (
                        <p className="text-[11px] text-rose-500 mt-1">{regErrors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. sarah.miller@company.com"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"
                          required
                        />
                      </div>
                      {regErrors.email && (
                        <p className="text-[11px] text-rose-500 mt-1">{regErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regErrors.password && (
                        <p className="text-[11px] text-rose-500 mt-1">{regErrors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regErrors.confirmPassword && (
                        <p className="text-[11px] text-rose-500 mt-1">{regErrors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Register Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 px-4 bg-[#1F9D55] hover:bg-[#187E44] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Register & Create My Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-3 text-slate-400 text-xs uppercase font-medium">
                        or
                      </span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-1">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setLoginErrors({});
                        }}
                        className="text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Login with your credentials
                      </button>
                    </p>
                  </form>
                </div>
              )}

              {/* Tab 2: WELCOME BACK (LOGIN) CARD */}
              {activeTab === 'login' && (
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-emerald-100/90 relative animate-in fade-in duration-200">
                  <div className="mb-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Step 1 • Login
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 font-sans">
                      Welcome Back!
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sign in with your registered account credentials
                    </p>
                  </div>

                  {/* General Login Error Banner */}
                  {loginErrors.general && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{loginErrors.general}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Enter your registered email"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"
                          required
                        />
                      </div>
                      {loginErrors.email && (
                        <p className="text-[11px] text-rose-500 mt-1">{loginErrors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {loginErrors.password && (
                        <p className="text-[11px] text-rose-500 mt-1">{loginErrors.password}</p>
                      )}
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset instructions will be sent to your registered email.')}
                        className="text-emerald-700 hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 px-4 bg-[#1F9D55] hover:bg-[#187E44] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Login with My Credentials</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-3 text-slate-400 text-xs uppercase font-medium">
                        or
                      </span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-1">
                      New to EcoMind?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('register');
                          setRegErrors({});
                        }}
                        className="text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Create an account
                      </button>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: 3 Feature Points + CO2 Laptop Illustration */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-emerald-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Why EcoMind?
              </h4>

              <div className="space-y-3.5">
                {/* Point 1 */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Secure Personal Accounts</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Each user has isolated, secure telemetry with personalized credentials.
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Personalized Dashboard</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Your activities compute custom AI, cloud storage, and transfer metrics.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Make a Difference</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Machine Learning models adapt to your workload patterns and suggest custom reduction steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration Card */}
            <div className="bg-gradient-to-b from-white to-emerald-50/50 rounded-2xl p-4 shadow-md border border-emerald-100 text-center flex flex-col items-center">
              <Co2CloudIllustration className="w-36 h-28" />
              <p className="text-xs font-bold text-emerald-950 mt-1">
                Real-Time Emission Tracking
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                Aligned with IEA & The Shift Project emission factors
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/60">
        <p>EcoMind Digital Carbon Footprint Prediction & Reduction System • Net-Zero 2030 Initiative</p>
      </footer>
    </div>
  );
};
