'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getAssessmentHistoryApi, AssessmentRecord } from '../../../services/assessment';
import { RomTrendChart } from '../../../components/patient/RomTrendChart';
import { Play, User, Stethoscope, AlertTriangle, History, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const JOINT_PROTOCOLS = [
  { id: 'SF001', name: 'Shoulder Flexion', view: 'Side View', normal: '160° - 180°', limb: 'Upper Limb' },
  { id: 'SA001', name: 'Shoulder Abduction', view: 'Front View', normal: '160° - 180°', limb: 'Upper Limb' },
  { id: 'EF001', name: 'Elbow Flexion', view: 'Side View', normal: '145° - 150°', limb: 'Upper Limb' },
  { id: 'KF001', name: 'Knee Flexion', view: 'Side View', normal: '130° - 135°', limb: 'Lower Limb' },
  { id: 'HF001', name: 'Hip Flexion', view: 'Side View', normal: '110° - 120°', limb: 'Lower Limb' },
  { id: 'NR001', name: 'Neck Rotation', view: 'Front View', normal: '70° - 80°', limb: 'Cervical Spine' },
];

export default function PatientDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const response = await getAssessmentHistoryApi();
    if (response.success && response.data) {
      setHistory(response.data);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b4d8]" />
      </div>
    );
  }

  // Check clinician status
  const clinicianName = profile?.doctorId ? 'Dr. Assigned Physiotherapist' : null;

  return (
    <div className="flex-grow bg-[#0d0f12] text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#141820] border border-[#1e293b] p-6 rounded-2xl gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#00b4d8]/10 p-3.5 rounded-xl border border-[#00b4d8]/20">
              <User className="h-6 w-6 text-[#00b4d8]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Welcome, {user?.fullName}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 text-xs text-[#94a3b8]">
                <span>Patient Portal ID: <strong className="text-white">{user?.id}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Stethoscope className="h-3.5 w-3.5 text-[#a78bfa]" />
                  {clinicianName ? (
                    <span className="text-[#a78bfa]">Assigned: {clinicianName}</span>
                  ) : (
                    <span className="text-yellow-500 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> No clinician assigned
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/patient/profile" 
              className="text-xs font-semibold bg-[#1e293b] hover:bg-[#334155] border border-[#334155] px-4 py-2.5 rounded-xl transition-all"
            >
              Manage Profile
            </Link>
          </div>
        </div>

        {/* Middle Section: Trends & Summary logs */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ROM Trend Chart Visualization */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white tracking-wide">My Recovery Metrics</h2>
              <button 
                onClick={fetchHistory} 
                className="p-1.5 rounded-lg border border-[#1e293b] hover:bg-[#141820] transition-colors"
                title="Refresh Logs"
              >
                <RefreshCw className="h-4 w-4 text-[#94a3b8]" />
              </button>
            </div>
            
            <RomTrendChart 
              data={history.map(item => ({
                joint: item.joint,
                peakRom: item.peakRom,
                date: item.createdAt
              }))} 
            />
          </div>

          {/* Quick Stats Summary List */}
          <div className="bg-[#141820] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Screening Summary</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Completed Screenings</span>
                  <span className="font-bold text-white">{history.length}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Last Screened Joint</span>
                  <span className="font-bold text-white">
                    {history[0]?.joint ? JOINT_PROTOCOLS.find(j => j.id === history[0].joint)?.name : 'None'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1e293b] pb-3 text-xs">
                  <span className="text-[#94a3b8]">Peak ROM Achieved</span>
                  <span className="font-bold text-[#10b981]">
                    {history.length > 0 ? `${Math.max(...history.map(h => h.peakRom))}°` : '—'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-[#0d0f12] p-4 rounded-xl border border-[#1e293b] text-[11px] text-[#94a3b8] leading-relaxed">
              <p>⚠️ <strong>Disclaimer</strong>: ROM assessments provide movement screening data for recovery tracking. They do not constitute a medical diagnosis. Consult your assigned physiotherapist for clinical evaluations.</p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Joints Selection Directory */}
        <div>
          <h2 className="text-lg font-bold text-white mb-6 tracking-wide">Available Movement Screenings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOINT_PROTOCOLS.map((protocol) => (
              <div 
                key={protocol.id} 
                className="bg-[#141820] border border-[#1e293b] hover:border-[#00b4d8]/40 p-5 rounded-2xl flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] bg-[#1e293b] text-[#94a3b8] px-2 py-0.5 rounded-md font-mono">{protocol.id}</span>
                    <span className="text-[10px] text-[#00b4d8] font-bold tracking-wider uppercase">{protocol.view}</span>
                  </div>
                  <h4 className="font-bold text-white text-base group-hover:text-[#00b4d8] transition-colors">{protocol.name}</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-1">Normal ROM Limit: <strong className="text-white">{protocol.normal}</strong></p>
                </div>
                <Link 
                  href={`/patient/assess?joint=${protocol.id}`}
                  className="w-full bg-[#1e293b] hover:bg-[#00b4d8] text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 mt-6 transition-all group-hover:translate-y-0"
                >
                  <Play className="h-3 w-3 fill-white" />
                  <span>Start ROM screening</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* History List Details Section */}
        {history.length > 0 && (
          <div className="bg-[#141820] border border-[#1e293b] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-[#00b4d8]" />
              <h3 className="text-base font-bold text-white">Recent Screening History</h3>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#94a3b8] font-semibold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 px-4">Movement</th>
                    <th className="pb-3 px-4">Peak ROM</th>
                    <th className="pb-3 px-4">Screening Result</th>
                    <th className="pb-3 pl-4">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => {
                    const protocol = JOINT_PROTOCOLS.find(j => j.id === record.joint);
                    return (
                      <tr key={record._id} className="border-b border-[#1e293b]/60 hover:bg-[#0d0f12]/40 transition-colors">
                        <td className="py-3.5 pr-4 text-[#94a3b8]">
                          {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">{protocol?.name || record.joint}</td>
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
                        <td className="py-3.5 pl-4 font-mono text-[#94a3b8]">
                          {Math.round(record.confidenceScore * 100)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
