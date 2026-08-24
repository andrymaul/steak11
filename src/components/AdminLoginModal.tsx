import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, Eye, EyeOff, UserPlus, LogIn, Mail, User, Phone } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { SYSTEM_ALL_TABS, getStoredAdmins, getStoredEmployees, getStoredRoleSettings, saveStoredCurrentUser, saveAdmins } from '../utils';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (userData?: { name: string; role: string; allowedTabs?: string[] }) => void;
  onSuccessStaffLogin?: (employeeId: string, pin: string) => void;
  currentUser?: { name: string; role: string; allowedTabs?: string[] } | null;
  onOpenDashboard?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  currentUser,
  onOpenDashboard,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verification'>('signin');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setLoading(false);
      setAuthMode('signin');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      onSuccessLogin({
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'Pengunjung Google'),
        role: 'Pengunjung',
        allowedTabs: SYSTEM_ALL_TABS.map((t) => t.id).filter((id) => id !== 'admin'),
      });
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In popup was closed before completion.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not authorized for Google Sign-In in Firebase Console.');
      } else {
        setErrorMsg(err?.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'signup') {
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();
      const cleanInput = email.trim();
      const cleanPass = password.trim();

      if (!cleanName) {
        setErrorMsg('Mohon isi Nama Lengkap Anda.');
        return;
      }

      if (!cleanPhone) {
        setErrorMsg('Mohon isi Nomor Telepon / WhatsApp Anda.');
        return;
      }

      if (!cleanInput || !cleanInput.includes('@')) {
        setErrorMsg('Sign Up hanya bisa menggunakan alamat Email yang valid (contoh: nama@domain.com).');
        return;
      }

      if (!cleanPass || cleanPass.length < 6) {
        setErrorMsg('Password minimal 6 karakter.');
        return;
      }

      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanInput, cleanPass);
        const user = userCredential.user;

        // Update profile displayName
        try {
          await updateProfile(user, { displayName: cleanName });
        } catch (pErr) {
          console.warn('Update profile error:', pErr);
        }

        // Record visitor user in Admin System data
        const storedAdmins = getStoredAdmins();
        const existingIdx = storedAdmins.findIndex(
          (a) =>
            a.email?.toLowerCase() === cleanInput.toLowerCase() ||
            a.username.toLowerCase() === cleanInput.toLowerCase()
        );
        if (existingIdx === -1) {
          const newVisitor: AdminUser = {
            id: `VIS-${Date.now().toString().slice(-4)}`,
            username: cleanInput.toLowerCase(),
            fullName: cleanName,
            role: 'Pengunjung',
            phone: cleanPhone,
            email: cleanInput.toLowerCase(),
            status: 'Aktif',
            passwordPin: 'Email Auth',
            createdAt: new Date().toISOString().split('T')[0],
            allowedTabs: SYSTEM_ALL_TABS.map((t) => t.id).filter((id) => id !== 'admin'),
          };
          saveAdmins([newVisitor, ...storedAdmins]);
        }

        // Send email verification and sign out automatically
        await sendEmailVerification(user);
        await signOut(auth);

        setVerificationEmail(cleanInput);
        setAuthMode('verification');
      } catch (err: any) {
        console.error('Firebase Auth Sign Up Error:', err);
        const errorCode = err?.code || '';
        if (errorCode === 'auth/email-already-in-use') {
          setErrorMsg('Email sudah terdaftar. Silakan Sign In / Login.');
        } else if (errorCode === 'auth/weak-password') {
          setErrorMsg('Password terlalu lemah. Minimal 6 karakter.');
        } else if (errorCode === 'auth/invalid-email') {
          setErrorMsg('Format email tidak valid.');
        } else {
          setErrorMsg(err?.message || 'Gagal mendaftar. Silakan coba lagi.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const cleanInput = email.trim();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMsg('Please enter email/username and password.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signin') {
        const lowerInput = cleanInput.toLowerCase();

        // 1. Check local / synced Admin System users (by username, ID, or email)
        const storedAdmins = getStoredAdmins();
        const existingAdmin = storedAdmins.find(
          (a) =>
            a.status === 'Aktif' &&
            (a.username.toLowerCase() === lowerInput ||
              a.id.toLowerCase() === lowerInput ||
              (a.email && a.email.toLowerCase() === lowerInput))
        );

        if (existingAdmin) {
          // Account found in Admin System! Enforce strict password validation:
          const expectedPass = existingAdmin.passwordPin;
          if (expectedPass && expectedPass !== cleanPass) {
            setErrorMsg('Email, Username, or Password/PIN is incorrect');
            setLoading(false);
            return;
          }

          const storedRoles = getStoredRoleSettings();
          const matchedRole = storedRoles.find(
            (r) => r.name.toLowerCase() === (existingAdmin.role || '').toLowerCase()
          );
          const adminAllowed =
            existingAdmin.allowedTabs && existingAdmin.allowedTabs.length > 0
              ? existingAdmin.allowedTabs
              : (matchedRole && matchedRole.allowedTabs && matchedRole.allowedTabs.length > 0
                ? matchedRole.allowedTabs
                : SYSTEM_ALL_TABS.map((t) => t.id));

          const userData = {
            name: existingAdmin.fullName || existingAdmin.username,
            role: existingAdmin.role || 'Admin',
            allowedTabs: adminAllowed,
          };
          saveStoredCurrentUser(userData);
          onSuccessLogin(userData);
          onClose();
          setLoading(false);
          return;
        }

        // 2. Check local / synced Employee Data (by username, ID, or phone)
        const storedEmployees = getStoredEmployees();
        const existingEmployee = storedEmployees.find(
          (e) =>
            e.status === 'Aktif' &&
            ((e.username && e.username.toLowerCase() === lowerInput) ||
              e.id.toLowerCase() === lowerInput ||
              e.phone === cleanInput)
        );

        if (existingEmployee) {
          // Account found in Employee Data! Enforce strict PIN/password validation:
          const expectedPin = existingEmployee.pin || existingEmployee.password;
          if (expectedPin && expectedPin !== cleanPass) {
            setErrorMsg('Email, Username, or Password/PIN is incorrect');
            setLoading(false);
            return;
          }

          const storedRoles = getStoredRoleSettings();
          const matchedRole = storedRoles.find(
            (r) => r.name.toLowerCase() === (existingEmployee.role || '').toLowerCase()
          );
          const empAllowed =
            existingEmployee.allowedTabs && existingEmployee.allowedTabs.length > 0
              ? existingEmployee.allowedTabs
              : (matchedRole && matchedRole.allowedTabs && matchedRole.allowedTabs.length > 0
                ? matchedRole.allowedTabs
                : ['kasir', 'pesanan', 'inventory', 'absensi', 'presensi_kamera', 'jadwal']);

          const userData = {
            name: existingEmployee.name,
            role: existingEmployee.role || 'Kasir',
            allowedTabs: empAllowed,
          };
          saveStoredCurrentUser(userData);
          onSuccessLogin(userData);
          onClose();
          setLoading(false);
          return;
        }

        // 3. Fallback to Firebase Authentication ONLY if input is an email (contains '@')
        if (cleanInput.includes('@')) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, cleanInput, cleanPass);
            const user = userCredential.user;

            // Check if email is verified
            if (!user.emailVerified) {
              await signOut(auth);
              setVerificationEmail(user.email || cleanInput);
              setAuthMode('verification');
              return;
            }

            const userData = {
              name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
              role: 'Pengunjung',
              allowedTabs: SYSTEM_ALL_TABS.map((t) => t.id).filter((id) => id !== 'admin'),
            };
            saveStoredCurrentUser(userData);
            onSuccessLogin(userData);
            onClose();
            return;
          } catch (fbErr) {
            console.warn('Firebase Auth Login Error:', fbErr);
            setErrorMsg('Email or password is incorrect');
          }
        } else {
          setErrorMsg('Email, Username, or Password/PIN is incorrect');
        }
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      setErrorMsg('Email, Username, or Password/PIN is incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-purple-900/50 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-baloo text-[#3D1259] dark:text-amber-400 leading-tight">
                Steak 11 Authentication
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {authMode === 'verification'
                  ? 'Email Verification'
                  : authMode === 'signin'
                  ? 'Sign in using Email & Password or Google'
                  : 'Create a new account with Email & Password or Google'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-purple-900/50 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-purple-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Session Banner */}
        {currentUser && (
          <div className="p-3.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-xs flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Sesi Login Aktif:</div>
              <div className="font-extrabold text-[#3D1259] dark:text-amber-300">{currentUser.name} ({currentUser.role})</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenDashboard) onOpenDashboard();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-[11px] shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Masuk Dashboard &rarr;
            </button>
          </div>
        )}

        {authMode === 'verification' ? (
          /* Verification Screen */
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-400/30">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400">
                Email Verification Required
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-sm mx-auto">
                We have sent you a verification email to {verificationEmail}. Please verify it and log in.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                }}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Auth Mode Toggle Tabs */}
            <div className="flex border-b border-slate-200 dark:border-purple-900/50 pb-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'border-b-2 border-amber-400 text-amber-500 dark:text-amber-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'border-b-2 border-amber-400 text-amber-500 dark:text-amber-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign Up
              </button>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nama Lengkap Input (Sign Up mode only) */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Lengkap:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Masukkan Nama Lengkap Anda (contoh: Budi Santoso)"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nomor Telepon / WhatsApp:
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="contoh: 081234567890"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email / Username Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {authMode === 'signup' ? 'Alamat Email (Wajib Email):' : 'Email / Username / ID Karyawan:'}
                </label>
                <input
                  type={authMode === 'signup' ? 'email' : 'text'}
                  placeholder={authMode === 'signup' ? 'contoh: nama.anda@domain.com' : 'Email / Username (contoh: siti_kasir, adm-1001, email@gmail.com)'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={authMode === 'signup' ? 'Minimal 6 karakter...' : 'Enter password...'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-300 transition-colors p-1 rounded-lg cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : authMode === 'signin' ? (
                    <>
                      <Lock className="w-4 h-4" /> Sign In →
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Sign Up →
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center pt-1">
                  <div className="border-t border-slate-200 dark:border-purple-900/50 w-full" />
                  <span className="bg-white dark:bg-[#1a0c28] px-2 text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 absolute">
                    Or continue with
                  </span>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-purple-900/70 bg-white dark:bg-purple-950/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-purple-900/60 font-bold text-xs shadow-xs hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};






