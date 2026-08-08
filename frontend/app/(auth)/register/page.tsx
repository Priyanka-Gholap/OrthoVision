'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../../types/auth';
import { Activity, ShieldAlert, ArrowRight, Loader2, UserCheck, Stethoscope } from 'lucide-react';

export default function RegisterPage() {
  const { register, error, clearError, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Patient');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    setFormError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName || !email || !password || !role) {
      setFormError('All registration fields are required.');
      return;
    }

    if (role === 'Admin') {
      setFormError('Admin registration is not allowed.');
      return;
    }

    // Password validation rules check
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPassword.test(password)) {
      setFormError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    await register(fullName, email, password, role);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 bg-[#0d0f12] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00b4d8]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#141820] border border-[#1e293b] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex bg-[#00b4d8]/10 p-3 rounded-xl border border-[#00b4d8]/20 mb-4 justify-center items-center">
            <Activity className="h-8 w-8 text-[#00b4d8]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Clinical Account</h2>
          <p className="text-xs text-[#94a3b8] mt-1">Register credentials to start screening</p>
        </div>

        {(formError || error) && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start mb-5">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Registration Issue</p>
              <p className="mt-0.5 leading-relaxed">{formError || error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
              placeholder="Dr. John Doe or Jane Smith"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
              placeholder="jane@example.com"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {/* Role selection card selectors (Patient / Doctor only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Portal Role</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {/* Patient Selector */}
              <button
                type="button"
                onClick={() => setRole('Patient')}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  role === 'Patient'
                    ? 'bg-[#00b4d8]/10 border-[#00b4d8] text-white'
                    : 'bg-[#0d0f12] border-[#1e293b] text-[#94a3b8] hover:border-[#1e293b]/80'
                }`}
                disabled={loading}
              >
                <UserCheck className="h-4 w-4" />
                <span>Patient</span>
              </button>

              {/* Doctor Selector */}
              <button
                type="button"
                onClick={() => setRole('Doctor')}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  role === 'Doctor'
                    ? 'bg-[#7209b7]/10 border-[#9d4edd] text-white'
                    : 'bg-[#0d0f12] border-[#1e293b] text-[#94a3b8] hover:border-[#1e293b]/80'
                }`}
                disabled={loading}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Physiotherapist</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 rounded-xl text-sm font-semibold tracking-wider flex items-center justify-center gap-2 mt-3 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register & Log In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-[#1e293b]">
          <p className="text-xs text-[#94a3b8]">
            Already have a clinical account?{' '}
            <Link href="/login" className="text-[#00b4d8] hover:underline font-semibold transition-all">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
