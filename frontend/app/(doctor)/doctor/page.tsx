'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Users, Clipboard, Award, Loader2 } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Enforce secure client-side role validation matching verified server session
  useEffect(() => {
    if (!loading && (!user || user.role !== 'Doctor')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Doctor') {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#9d4edd]" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#0d0f12] text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-center bg-[#141820] border border-[#1e293b] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-[#7209b7]/10 p-3 rounded-xl border border-[#7209b7]/20">
              <Stethoscope className="h-6 w-6 text-[#9d4edd]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome, {user.fullName}</h1>
              <p className="text-xs text-[#94a3b8]">Clinician Portal • HIPAA Secure ID: {user.id}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-xs font-semibold bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/20 px-4 py-2 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Clinician Overview Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card: Active Patients List */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between hover:border-[#9d4edd]/30 transition-colors">
            <div className="flex flex-col gap-4">
              <div className="bg-[#00b4d8]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#00b4d8]/20">
                <Users className="h-5 w-5 text-[#00b4d8]" />
              </div>
              <h3 className="font-bold text-white">Patient Directories</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Review physical profiles, assigned movements protocols, and active kinematic screening statuses.
              </p>
            </div>
            <button className="bg-[#7209b7] hover:bg-[#5b008d] text-white py-2.5 rounded-xl text-xs font-semibold mt-6 transition-colors">
              Manage Patient List
            </button>
          </div>

          {/* Card: Reports Pending Review */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="bg-[#10b981]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#10b981]/20">
                <Clipboard className="h-5 w-5 text-[#10b981]" />
              </div>
              <h3 className="font-bold text-white">Pending Approvals</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Inspect raw range of motion recordings and approve compiled patient summaries.
              </p>
            </div>
            <button disabled className="bg-[#1e293b] text-[#94a3b8] py-2.5 rounded-xl text-xs font-semibold mt-6 cursor-not-allowed">
              0 Pending Assessments
            </button>
          </div>

          {/* Card: Medical reference library */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="bg-[#f59e0b]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#f59e0b]/20">
                <Award className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <h3 className="font-bold text-white">Reference Standards</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Consult kinematics angle limits, shoulder flexion guidelines, and AAOS reference values.
              </p>
            </div>
            <a href="/#about" className="bg-[#1e293b] hover:bg-[#1e293b]/70 text-[#94a3b8] hover:text-white text-center py-2.5 rounded-xl text-xs font-semibold mt-6 transition-colors">
              Consult Reference Guides
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
