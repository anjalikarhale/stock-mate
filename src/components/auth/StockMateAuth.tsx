import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  User,
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';

type AuthView = 'WELCOME' | 'STUDENT_LOGIN' | 'STUDENT_SIGNUP' | 'TEACHER_LOGIN' | 'TEACHER_SIGNUP';

interface StockMateAuthProps {
  initialView?: AuthView;
  onAuthenticated?: (role: 'STUDENT' | 'TEACHER') => void;
  pendingClassroomCode?: string;
  onNavigateToAdmin?: () => void;
}

export const StockMateAuth: React.FC<StockMateAuthProps> = ({
  initialView = 'WELCOME',
  onAuthenticated,
  pendingClassroomCode,
  onNavigateToAdmin,
}) => {
  const { loginAsStudent, signupStudent, loginAsTeacher, signupTeacher } = useClassroom();

  const [protectedRouteNotice, setProtectedRouteNotice] = useState<string | null>(null);

  const [view, setView] = useState<AuthView>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth') || params.get('view');

      if (pathname.includes('/teacher/signup') || authParam === 'teacher_signup') {
        return 'TEACHER_SIGNUP';
      }
      if (pathname.includes('/teacher/login') || pathname.includes('/teacher') || authParam === 'teacher_login' || authParam === 'teacher') {
        return 'TEACHER_LOGIN';
      }
      if (authParam === 'student_signup' || authParam === 'signup' || pathname.includes('/signup')) {
        return 'STUDENT_SIGNUP';
      }
      if (authParam === 'student_login' || authParam === 'login' || pathname.includes('/login')) {
        return 'STUDENT_LOGIN';
      }
      if (
        pathname.includes('/dashboard') ||
        pathname.includes('/classroom') ||
        pathname.includes('/activity') ||
        pathname.includes('/profile') ||
        pathname.includes('/practice') ||
        pathname.includes('/learn')
      ) {
        return 'STUDENT_LOGIN';
      }
    }
    return initialView;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (
        pathname.includes('/dashboard') ||
        pathname.includes('/classroom') ||
        pathname.includes('/activity') ||
        pathname.includes('/profile')
      ) {
        setProtectedRouteNotice('Please log in to your account to access that page.');
      }

      const handlePopState = () => {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/teacher/signup')) setView('TEACHER_SIGNUP');
        else if (path.includes('/teacher/login') || path.includes('/teacher')) setView('TEACHER_LOGIN');
        else if (path.includes('/signup')) setView('STUDENT_SIGNUP');
        else if (path.includes('/login')) setView('STUDENT_LOGIN');
        else setView('WELCOME');
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear errors and sync history when view changes
  const switchView = (newView: AuthView) => {
    setErrorMessage(null);
    setProtectedRouteNotice(null);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setInviteCode('');
    setView(newView);

    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (newView === 'STUDENT_LOGIN') targetPath = '/login';
      else if (newView === 'STUDENT_SIGNUP') targetPath = '/signup';
      else if (newView === 'TEACHER_LOGIN') targetPath = '/teacher/login';
      else if (newView === 'TEACHER_SIGNUP') targetPath = '/teacher/signup';

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ authView: newView }, '', targetPath);
      }
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginAsStudent(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to login. Please check your credentials.');
        return;
      }
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/student/dashboard');
      }
      if (onAuthenticated) onAuthenticated('STUDENT');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during student login.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      const res = await signupStudent({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create student account.');
        return;
      }
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/student/dashboard');
      }
      if (onAuthenticated) onAuthenticated('STUDENT');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during student sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginAsTeacher(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Teacher login failed. Check email or password.');
        return;
      }
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/teacher/dashboard');
      }
      if (onAuthenticated) onAuthenticated('TEACHER');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during teacher login.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter teacher full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!inviteCode.trim()) {
      setErrorMessage('Teacher Invite Code is required. Please check your faculty authorization key.');
      return;
    }

    try {
      setLoading(true);
      const res = await signupTeacher({
        name: name.trim(),
        email: email.trim(),
        password,
        inviteCode: inviteCode.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create teacher account.');
        return;
      }
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/teacher/dashboard');
      }
      if (onAuthenticated) onAuthenticated('TEACHER');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during teacher sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Branding */}
      <header className="max-w-5xl w-full mx-auto px-4 py-6 flex items-center justify-between z-10">
        <div
          onClick={() => switchView('WELCOME')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              STOCKMATE
            </span>
          </div>
        </div>

        {view !== 'WELCOME' && (
          <button
            onClick={() => switchView('WELCOME')}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
          >
            ← Welcome Screen
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">

          {/* VIEW: WELCOME SCREEN */}
          {view === 'WELCOME' && (
            <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Hero Title */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Educational Stock Market Learning
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  STOCKMATE
                </h1>
                <p className="text-lg font-medium text-slate-400">
                  Learn. Practice. Master the Market.
                </p>
                {pendingClassroomCode && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                    You have an invite to classroom: <span className="font-mono font-bold text-white tracking-widest">{pendingClassroomCode}</span>. Please log in or sign up to join!
                  </div>
                )}
              </div>

              {/* Main Student Actions */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-4">
                <button
                  onClick={() => switchView('STUDENT_LOGIN')}
                  className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:translate-y-[-1px]"
                >
                  <User className="w-5 h-5" />
                  Student Login
                </button>

                <button
                  onClick={() => switchView('STUDENT_SIGNUP')}
                  className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-slate-600"
                >
                  Student Sign Up
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Separate Teacher & Admin Options */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Are you a teacher?</p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={() => switchView('TEACHER_LOGIN')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Teacher Login
                    </button>
                    <button
                      onClick={() => switchView('TEACHER_SIGNUP')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Teacher Sign Up
                    </button>
                  </div>
                </div>

                {onNavigateToAdmin && (
                  <div className="pt-2 border-t border-slate-800/40">
                    <button
                      type="button"
                      onClick={onNavigateToAdmin}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      Administrator Portal (Restricted)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: STUDENT LOGIN */}
          {view === 'STUDENT_LOGIN' && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  STUDENT LOGIN
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access your lessons, practice simulator & classrooms
                </p>
              </div>

              {protectedRouteNotice && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{protectedRouteNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('STUDENT_SIGNUP')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 cursor-pointer"
                  >
                    Create Student Account
                  </button>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => switchView('WELCOME')}
                    className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    ← Back to Welcome
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: STUDENT SIGN UP */}
          {view === 'STUDENT_SIGNUP' && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  STUDENT SIGN UP
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create your free account to start your stock market journey
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleStudentSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anjali Verma"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anjali@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Creating Account...' : 'Create Student Account'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('STUDENT_LOGIN')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 cursor-pointer"
                  >
                    Student Login
                  </button>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => switchView('WELCOME')}
                    className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    ← Back to Welcome
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TEACHER LOGIN */}
          {view === 'TEACHER_LOGIN' && (
            <div className="bg-slate-900/90 border border-indigo-900/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">
                  STOCKMATE TEACHER
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Teacher Login
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Host live interactive quizzes and monitor student progress
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teacher Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@college.edu"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Authenticating...' : 'Teacher Login'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Need a teacher account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('TEACHER_SIGNUP')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 cursor-pointer"
                  >
                    Teacher Sign Up
                  </button>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => switchView('WELCOME')}
                    className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    ← Back to Welcome
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TEACHER SIGN UP */}
          {view === 'TEACHER_SIGNUP' && (
            <div className="bg-slate-900/90 border border-indigo-900/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">
                  STOCKMATE TEACHER
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Create Teacher Account
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Set up classrooms and run live StockMate quizzes
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleTeacherSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teacher Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. R. Sharma"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teacher Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@college.edu"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Teacher Authorization Invite Code</span>
                    <span className="text-[10px] text-amber-400 font-mono">Required</span>
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter teacher invite code"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Provided exclusively to educators by the administrator.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer mt-2"
                >
                  {loading ? 'Creating Teacher Account...' : 'Create Teacher Account'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Already have a teacher account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('TEACHER_LOGIN')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 cursor-pointer"
                  >
                    Teacher Login
                  </button>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => switchView('WELCOME')}
                    className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    ← Back to Welcome
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto px-4 py-4 text-center text-xs text-slate-600 z-10">
        StockMate Educational Platform • Simple & Disciplined Financial Learning
      </footer>
    </div>
  );
};
