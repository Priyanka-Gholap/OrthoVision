'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getPatientsApi, PatientRecord } from '../../../services/doctor';
import { Stethoscope, Users, Clipboard, Award, Loader2, ArrowRight, Link2, ShieldAlert } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Enforce secure client-side role validation matching verified server session
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Doctor')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    setLoadingList(true);
    setErrorMsg(null);
    const response = await getPatientsApi();
    if (response.success && response.data) {
      setPatients(response.data);
    } else {
      setErrorMsg(response.error?.message || 'Failed to retrieve dashboard patients.');
    }
    setLoadingList(false);
  };

  useEffect(() => {
    if (user && user.role === 'Doctor') {
      loadDashboardData();
    }
  }, [user]);

  if (authLoading || !user || user.role !== 'Doctor') {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#9d4edd]" />
      </div>
    );
  }

  // Filter list to get patients assigned to the logged-in doctor
  const myPatients = patients.filter((p) => p.doctorId === user.id);
  const unassignedCount = patients.filter((p) => !p.doctorId).length;

  return (
    <div className="flex-grow bg-[#0d0f12] text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Welcome Header */}
        <div className="flex justify-between items-center bg-[#141820] border border-[#1e293b] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="bg-[#7209b7]/10 p-3.5 rounded-xl border border-[#7209b7]/20 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-[#9d4edd]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome, {user.fullName}</h1>
              <p className="text-xs text-[#94a3b8]">Clinician Portal • HIPAA Secure ID: <span className="font-mono text-white">{user.id}</span></p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-xs font-semibold bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/20 px-4 py-2 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Display retrieve errors if any */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Dashboard Query Error</p>
              <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Clinician Overview Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card: Active Patients List */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between hover:border-[#9d4edd]/30 transition-all group">
            <div className="flex flex-col gap-4">
              <div className="bg-[#00b4d8]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#00b4d8]/20 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-[#00b4d8]" />
              </div>
              <h3 className="font-bold text-white">Patient Discovery</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Browse the searchable global directory of registered patients to self-assign unassigned screening cases to your clinic.
              </p>
            </div>
            <Link 
              href="/doctor/patients"
              className="bg-[#7209b7] hover:bg-[#5b008d] text-white py-2.5 rounded-xl text-xs font-semibold mt-6 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Discover & Assign Patients</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card: My Assigned Patients Count */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="bg-[#10b981]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#10b981]/20">
                <Clipboard className="h-5 w-5 text-[#10b981]" />
              </div>
              <h3 className="font-bold text-white">Active Clinician Roster</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Currently managing <strong>{myPatients.length}</strong> active patient profiles. View their range of motion statistics curves and screening logs.
              </p>
            </div>
            <div className="bg-[#0d0f12] text-center border border-[#1e293b] py-2 rounded-xl text-xs font-mono font-bold text-[#10b981] mt-6">
              {myPatients.length} Patients Assigned
            </div>
          </div>

          {/* Card: Unassigned Patient Pool */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="bg-[#f59e0b]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#f59e0b]/20">
                <Award className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <h3 className="font-bold text-white">Unassigned Patient Pool</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                There are currently <strong>{unassignedCount}</strong> patients waiting for clinician assignment. Self-assign to start reviewing screenings.
              </p>
            </div>
            <Link 
              href="/doctor/patients"
              className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white text-center py-2.5 rounded-xl text-xs font-semibold mt-6 transition-colors"
            >
              View Unassigned Pool ({unassignedCount})
            </Link>
          </div>
        </div>

        {/* My Patients Roster Table */}
        <div className="bg-[#141820] border border-[#1e293b] rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-6">My Assigned Patients Roster</h3>
          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#9d4edd]" />
            </div>
          ) : myPatients.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#94a3b8] flex flex-col items-center gap-2">
              <span>You have no patients assigned to your roster yet.</span>
              <Link href="/doctor/patients" className="text-[#9d4edd] hover:underline font-semibold">
                Go to Patient Discovery to self-assign a patient
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#94a3b8] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Patient Name</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4">Creation Date</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myPatients.map((patient) => (
                    <tr key={patient._id} className="border-b border-[#1e293b]/60 hover:bg-[#0d0f12]/40 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-white">
                        {patient.patientId?.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-[#94a3b8] font-mono">
                        {patient.patientId?.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#94a3b8]">
                        {new Date(patient.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <Link
                          href={`/doctor/patients/${patient.patientId?._id}`}
                          className="inline-flex items-center gap-1 bg-[#7209b7] hover:bg-[#5b008d] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <Link2 className="h-3 w-3" />
                          <span>Review Case</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
