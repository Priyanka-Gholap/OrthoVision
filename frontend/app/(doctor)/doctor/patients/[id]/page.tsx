'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getPatientByIdApi, getPatientAssessmentsApi, PatientRecord, AssessmentRecord } from '../../../../../services/doctor';
import { RomTrendChart } from '../../../../../components/patient/RomTrendChart';
import { Stethoscope, User, Calendar, ShieldAlert, ArrowLeft, Loader2, Award, Clipboard } from 'lucide-react';

interface PatientDetailProps {
  params: {
    id: string;
  };
}

const JOINT_NAMES: Record<string, string> = {
  SF001: 'Shoulder Flexion',
  SA001: 'Shoulder Abduction',
  EF001: 'Elbow Flexion',
  KF001: 'Knee Flexion',
  HF001: 'Hip Flexion',
  NR001: 'Neck Rotation',
};

export default function PatientDetailReview({ params }: PatientDetailProps) {
  const patientUserId = params.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Enforce secure clinician role check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Doctor')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const loadPatientData = async () => {
    setLoadingData(true);
    setErrorMsg(null);

    // 1. Fetch detailed clinical profile (Gated check by doctorId on backend)
    const profileRes = await getPatientByIdApi(patientUserId);
    if (!profileRes.success || !profileRes.data) {
      setErrorMsg(profileRes.error?.message || 'Access denied. You are not authorized to view this patient\'s clinical records.');
      setLoadingData(false);
      return;
    }
    setPatient(profileRes.data);

    // 2. Fetch screening recordings (Gated check)
    const assessmentsRes = await getPatientAssessmentsApi(patientUserId);
    if (assessmentsRes.success && assessmentsRes.data) {
      setAssessments(assessmentsRes.data);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (user && user.role === 'Doctor') {
      loadPatientData();
    }
  }, [user, patientUserId]);

  if (authLoading || loadingData) {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#9d4edd]" />
      </div>
    );
  }

  // Handle unauthorized or not-found status errors gracefully
  if (errorMsg) {
    return (
      <div className="flex-grow bg-[#0d0f12] text-white p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#141820] border border-red-500/20 p-8 rounded-2xl text-center flex flex-col items-center gap-4">
          <ShieldAlert className="h-12 w-12 text-[#ef4444]" />
          <h3 className="text-lg font-bold">Clinical Access Restriction</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{errorMsg}</p>
          <Link 
            href="/doctor/patients" 
            className="mt-4 bg-[#7209b7] hover:bg-[#5b008d] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            Return to Patient Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#0d0f12] text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Navigation Back */}
        <div>
          <Link 
            href="/doctor/patients" 
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </Link>
        </div>

        {/* Patient header card info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#141820] border border-[#1e293b] p-6 rounded-2xl gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#7209b7]/10 p-3.5 rounded-xl border border-[#7209b7]/20">
              <User className="h-6 w-6 text-[#9d4edd]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">{patient?.patientId?.fullName}</h1>
              <p className="text-xs text-[#94a3b8] mt-1">Patient Profile ID: <span className="font-mono text-white">{patient?.patientId?._id}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0d0f12] px-3.5 py-1.5 rounded-full border border-[#1e293b] text-xs text-[#10b981] font-semibold">
            <Stethoscope className="h-4 w-4" />
            <span>Assigned to You</span>
          </div>
        </div>

        {/* Grid: Stats Review & Trend Visualization */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Patient Details Stats Card */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-wider">Physical Metrics</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Age</span>
                  <span className="font-bold text-white">{patient?.age !== undefined ? `${patient.age} years` : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Gender</span>
                  <span className="font-bold text-white">{patient?.gender || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Height</span>
                  <span className="font-bold text-white">{patient?.height !== undefined ? `${patient.height} cm` : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Weight</span>
                  <span className="font-bold text-white">{patient?.weight !== undefined ? `${patient.weight} kg` : '—'}</span>
                </div>
              </div>
            </div>
            
            {/* Medical History */}
            <div className="mt-8">
              <h4 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2.5">Medical History</h4>
              {patient?.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.map((item, idx) => (
                    <span key={idx} className="bg-[#0d0f12] border border-[#1e293b] px-2.5 py-1 rounded-lg text-xs text-[#94a3b8]">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#64748b] bg-[#0d0f12] p-3 rounded-lg border border-[#1e293b] text-center">
                  No records declared.
                </div>
              )}
            </div>
          </div>

          {/* Trend Chart (Actual data only, fallback to empty text if none) */}
          <div className="lg:col-span-2">
            {assessments.length === 0 ? (
              <div className="w-full h-full min-h-[250px] bg-[#141820] border border-[#1e293b] rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-3">
                <Clipboard className="h-8 w-8 text-[#64748b]" />
                <h4 className="text-sm font-semibold text-white">No screening results available yet.</h4>
                <p className="text-xs text-[#64748b] max-w-xs">This patient has not logged any ROM assessments since registration.</p>
              </div>
            ) : (
              <RomTrendChart 
                data={assessments.map(item => ({
                  joint: item.joint,
                  peakRom: item.peakRom,
                  date: item.createdAt
                }))} 
              />
            )}
          </div>
        </div>

        {/* Screening History list */}
        {assessments.length > 0 && (
          <div className="bg-[#141820] border border-[#1e293b] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-[#9d4edd]" />
              <h3 className="text-base font-bold text-white">Completed ROM Assessment Logs</h3>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#94a3b8] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Screening Date</th>
                    <th className="pb-3 px-4">Joint / Movement</th>
                    <th className="pb-3 px-4">Peak ROM Limit</th>
                    <th className="pb-3 px-4">Classification Result</th>
                    <th className="pb-3 pl-4 text-right">Confidence Score</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((record) => (
                    <tr key={record._id} className="border-b border-[#1e293b]/60 hover:bg-[#0d0f12]/40 transition-colors">
                      <td className="py-3.5 pr-4 text-[#94a3b8]">
                        {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{JOINT_NAMES[record.joint] || record.joint}</td>
                      <td className="py-3.5 px-4 font-bold text-[#10b981]">{record.peakRom}°</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          record.classification === 'Normal' ? 'bg-[#10b981]/10 text-[#10b981]' :
                          record.classification === 'Mild Limitation' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {record.classification}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right font-mono text-[#94a3b8]">
                        {Math.round(record.confidenceScore * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
