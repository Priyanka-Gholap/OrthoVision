'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getPatientsApi, assignPatientApi, PatientRecord } from '../../../../services/doctor';
import { Stethoscope, Search, UserCheck, ShieldAlert, ArrowLeft, Loader2, Link2 } from 'lucide-react';

export default function PatientDirectory() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Enforce secure clinician role check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Doctor')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchPatients = async (search?: string) => {
    setLoadingList(true);
    setErrorMsg(null);
    const response = await getPatientsApi(search);
    if (response.success && response.data) {
      setPatients(response.data);
    } else {
      setErrorMsg(response.error?.message || 'Failed to load patients list.');
    }
    setLoadingList(false);
  };

  useEffect(() => {
    if (user && user.role === 'Doctor') {
      fetchPatients();
    }
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchPatients(query);
  };

  const handleAssign = async (patientUserId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const response = await assignPatientApi(patientUserId);

    if (response.success) {
      setSuccessMsg('Patient successfully assigned to your roster.');
      fetchPatients(searchQuery); // Refresh list
    } else {
      setErrorMsg(response.error?.message || 'Assignment failed.');
    }
  };

  if (authLoading || !user || user.role !== 'Doctor') {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#9d4edd]" />
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#0d0f12] text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Navigation Back */}
        <div>
          <Link 
            href="/doctor" 
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="flex items-center gap-4 bg-[#141820] border border-[#1e293b] p-6 rounded-2xl">
          <div className="bg-[#7209b7]/10 p-3.5 rounded-xl border border-[#7209b7]/20">
            <Stethoscope className="h-6 w-6 text-[#9d4edd]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Patient Discovery Directory</h1>
            <p className="text-xs text-[#94a3b8] mt-1">Search patients and manage clinician assignments securely (HIPAA Compliant)</p>
          </div>
        </div>

        {/* Notifications Banners */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Access Restriction / Conflict</p>
              <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-200 text-xs p-4 rounded-xl flex gap-3 items-start">
            <UserCheck className="h-5 w-5 text-[#10b981] shrink-0" />
            <div>
              <p className="font-semibold">Assignment Successful</p>
              <p className="mt-0.5 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Search Input Filter */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search patients by name or email address..."
            className="w-full bg-[#141820] border border-[#1e293b] focus:border-[#9d4edd] text-sm text-white px-11 py-3.5 rounded-xl outline-none transition-colors"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748b]" />
        </div>

        {/* Patients Table */}
        <div className="bg-[#141820] border border-[#1e293b] rounded-2xl p-6">
          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#9d4edd]" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#94a3b8]">
              No patients found matching the query.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#94a3b8] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Patient Name</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4">Assignment Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const isAssignedToMe = patient.doctorId === user.id;
                    const isAssignedToOther = patient.doctorId && patient.doctorId !== user.id;

                    return (
                      <tr key={patient._id} className="border-b border-[#1e293b]/60 hover:bg-[#0d0f12]/40 transition-colors">
                        <td className="py-4 pr-4 font-semibold text-white">
                          {patient.patientId?.fullName || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-[#94a3b8] font-mono">
                          {patient.patientId?.email || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          {isAssignedToMe ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10b981]/10 text-[#10b981]">
                              Assigned to You
                            </span>
                          ) : isAssignedToOther ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400">
                              Assigned to other clinician
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-500">
                              No clinician assigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {isAssignedToMe ? (
                            <Link
                              href={`/doctor/patients/${patient.patientId?._id}`}
                              className="inline-flex items-center gap-1 bg-[#7209b7] hover:bg-[#5b008d] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              <Link2 className="h-3 w-3" />
                              <span>Review Patient</span>
                            </Link>
                          ) : isAssignedToOther ? (
                            <button
                              disabled
                              className="bg-[#1e293b] text-[#64748b] px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-not-allowed"
                            >
                              Locked
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAssign(patient.patientId?._id)}
                              className="bg-[#00b4d8] hover:bg-[#0077b6] text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                            >
                              Assign to Me
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
