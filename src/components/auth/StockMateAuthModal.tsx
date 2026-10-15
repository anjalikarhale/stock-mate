import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  BookOpen,
} from 'lucide-react';
import { classroomApi } from '../../services/classroomApi';
import { useClassroom } from '../../context/ClassroomContext';
import { useGame } from '../../context/GameContext';

export type AuthMode = 'STUDENT_LOGIN' | 'STUDENT_SIGNUP' | 'TEACHER_LOGIN' | 'TEACHER_SIGNUP';

interface StockMateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const StockMateAuthModal: React.FC<StockMateAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'STUDENT_LOGIN',
}) => {
  const { switchUser } = useClassroom();
  const { setProfile, setAppMode } = useGame();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  const isTeacher = mode === 'TEACHER_LOGIN' || mode === 'TEACHER_SIGNUP';
  const isSignup = mode === 'STUDENT_SIGNUP' || mode === 'TEACHER_SIGNUP';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      try {
        const role = isTeacher ? 'TEACHER' : 'STUDENT';
        const res = await classroomApi.signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          avatar: isTeacher ? '👨‍🏫' : '👨‍🎓',
        });

        if (!res.success || !res.user) {
          setError(res.error || 'Registration failed. Please check your details.');
          setIsLoading(false);
          return;
        }

        // Account created securely!
        switchUser(res.user);
        setProfile((prev) => ({
          ...prev,
          username: res.user!.name,
          avatar: res.user!.avatar || (isTeacher ? '👨‍🏫' : '👨‍🎓'),
        }));
        setAppMode('CLASSROOM');

        setSuccessMessage(`Account created! Welcome, ${res.user.name}.`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during signup');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login flow
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      setIsLoading(true);
      try {
        const role = isTeacher ? 'TEACHER' : 'STUDENT';
        const res = await classroomApi.login({
          email: email.trim().toLowerCase(),
          password,
          role,
        });

        if (!res.success || !res.user) {
          setError(res.error || 'Invalid email or password');
          setIsLoading(false);
          return;
        }

        switchUser(res.user);
        setProfile((prev) => ({
          ...prev,
          username: res.user!.name,
          avatar: res.user!.avatar || (isTeacher ? '👨‍🏫' : '👨‍🎓'),
        }));
        setAppMode('CLASSROOM');

        setSuccessMessage(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onClose();
        }, 800);
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <GraduationCap className="w-4 h-4" />
            StockMate Classroom Portal
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">STOCKMATE</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Learn. Practice. Master the Market.
          </p>
        </div>

        {/* Role & Action Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'STUDENT_SIGNUP' : 'STUDENT_LOGIN');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              !isTeacher
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'TEACHER_SIGNUP' : 'TEACHER_LOGIN');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              isTeacher
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teacher
          </button>
        </div>

        {/* Login vs Sign Up Toggle */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <span className="text-sm font-bold text-white">
            {isTeacher ? 'Teacher Portal' : 'Student Portal'} —{' '}
            <span className={isTeacher ? 'text-amber-400' : 'text-indigo-400'}>
              {isSignup ? 'Create Account' : 'Sign In'}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (mode === 'STUDENT_LOGIN') setMode('STUDENT_SIGNUP');
              else if (mode === 'STUDENT_SIGNUP') setMode('STUDENT_LOGIN');
              else if (mode === 'TEACHER_LOGIN') setMode('TEACHER_SIGNUP');
              else setMode('TEACHER_LOGIN');
              setError('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
          >
            {isSignup ? 'Already have an account? Log In' : "New here? Sign Up"}
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={isTeacher ? 'e.g. Prof. Rajesh Sharma' : 'e.g. Rahul Verma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              isTeacher
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : isSignup ? (
              <>
                <span>Complete {isTeacher ? 'Teacher' : 'Student'} Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to {isTeacher ? 'Teacher' : 'Student'} Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Privacy notice */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Cryptographic PBKDF2 password security • Real device synchronization
          </p>
        </div>
      </motion.div>
    </div>
  );
};
