'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Clear errors on page load/change
  useEffect(() => {
    clearError();
    setFormError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    await login(email, password);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-[#0d0f12] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00b4d8]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#141820] border border-[#1e293b] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-[#00b4d8]/10 p-3 rounded-xl border border-[#00b4d8]/20 mb-4 justify-center items-center">
            <Activity className="h-8 w-8 text-[#00b4d8]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Access Flexion AI Portal</h2>
          <p className="text-xs text-[#94a3b8] mt-1.5">Sign in to perform assessments or review patient cases</p>
        </div>

        {/* Display validation or auth errors */}
        {(formError || error) && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start mb-6">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Authentication Alert</p>
              <p className="mt-0.5 leading-relaxed">{formError || error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
              placeholder="doctor@flexion.ai or patient@example.com"
              disabled={loading}
            />
          </div>

          {/* Password input */}
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

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 rounded-xl text-sm font-semibold tracking-wider flex items-center justify-center gap-2 mt-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-[#1e293b]">
          <p className="text-xs text-[#94a3b8]">
            Do not have a clinical account?{' '}
            <Link href="/register" className="text-[#00b4d8] hover:underline font-semibold transition-all">
              Sign Up Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
