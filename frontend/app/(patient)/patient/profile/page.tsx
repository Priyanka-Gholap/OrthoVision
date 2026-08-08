'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { User, ShieldAlert, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function PatientProfileEditor() {
  const { user, profile, updateProfile, error, loading, clearError } = useAuth();
  const router = useRouter();

  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<string>('Male');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize fields on profile load
  useEffect(() => {
    clearError();
    if (profile) {
      setAge(profile.age !== undefined ? profile.age : '');
      setGender(profile.gender || 'Male');
      setHeight(profile.height !== undefined ? profile.height : '');
      setWeight(profile.weight !== undefined ? profile.weight : '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic numerical validation checks
    if (age === '' || height === '' || weight === '') {
      setFormError('Please fill in all physical metric fields.');
      return;
    }

    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setFormError('Please enter a valid age (0 - 120).');
      return;
    }

    if (isNaN(heightNum) || heightNum < 40 || heightNum > 300) {
      setFormError('Please enter a valid height in cm (40 - 300).');
      return;
    }

    if (isNaN(weightNum) || weightNum < 5 || weightNum > 500) {
      setFormError('Please enter a valid weight in kg (5 - 500).');
      return;
    }

    const success = await updateProfile(ageNum, gender, heightNum, weightNum);
    if (success) {
      router.push('/patient');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 bg-[#0d0f12] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00b4d8]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#141820] border border-[#1e293b] rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Navigation back */}
        <div className="mb-6">
          <Link 
            href="/patient" 
            className="inline-flex items-center gap-1 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#00b4d8]/10 p-3 rounded-xl border border-[#00b4d8]/20 flex items-center justify-center">
            <User className="h-6 w-6 text-[#00b4d8]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Physical Metrics</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">Maintain physical stats for accurate kinematics calculations</p>
          </div>
        </div>

        {/* Display form errors */}
        {(formError || error) && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start mb-6">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Validation Issue</p>
              <p className="mt-0.5 leading-relaxed">{formError || error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Age (years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value !== '' ? Number(e.target.value) : '')}
                className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
                placeholder="25"
                disabled={loading}
              />
            </div>

            {/* Gender Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
                disabled={loading}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Height */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value !== '' ? Number(e.target.value) : '')}
                className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
                placeholder="175"
                disabled={loading}
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value !== '' ? Number(e.target.value) : '')}
                className="bg-[#0d0f12] border border-[#1e293b] focus:border-[#00b4d8] text-sm text-white px-4 py-3 rounded-xl outline-none transition-colors"
                placeholder="70"
                disabled={loading}
              />
            </div>
          </div>

          {/* Account credentials info banner */}
          <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-xs text-[#94a3b8] leading-relaxed">
            <span className="font-semibold text-white uppercase text-[10px] tracking-wider block mb-1">Identity Access Info</span>
            <p>Registered Email: <strong>{user?.email}</strong></p>
            <p>Account Status: <strong>{profile?.status || 'Active'}</strong></p>
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
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save & Return</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
