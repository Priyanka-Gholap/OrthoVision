import React from 'react';
import { 
  User, 
  Stethoscope, 
  Video, 
  Layers, 
  Award, 
  FileText, 
  Activity, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full flex-grow flex flex-col bg-[#0d0f12] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 border-b border-[#1e293b] bg-gradient-to-b from-[#141820]/50 to-transparent">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00b4d8]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#7209b7]/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
            <Cpu className="h-3 w-3" />
            <span>Hybrid AI Biomechanics Engine</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Remote Musculoskeletal <br />
            <span className="bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] bg-clip-text text-transparent">
              Screening & Pose Estimation
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Assess clinical range of motion (ROM) dynamically from any device. Leveraging markerless tracking in-browser and stateless kinematics calculations on-server.
          </p>

          {/* Action Portals */}
          <div id="portal" className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Patient Portal Card */}
            <div className="bg-[#141820] border border-[#1e293b] hover:border-[#00b4d8]/50 p-8 rounded-2xl text-left transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b4d8]/5 rounded-bl-full pointer-events-none" />
              <div className="bg-[#00b4d8]/10 w-12 h-12 rounded-xl flex items-center justify-center border border-[#00b4d8]/20 mb-6 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-[#00b4d8]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Patient Portal</h3>
              <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
                Log in to complete assigned mobility assessments, view instructions, calibrate your webcam, and review range of motion analytics history.
              </p>
              <button className="flex items-center gap-2 text-xs font-semibold text-[#00b4d8] group-hover:text-white transition-colors">
                <span>Enter Patient Portal</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Doctor Portal Card */}
            <div className="bg-[#141820] border border-[#1e293b] hover:border-[#7209b7]/50 p-8 rounded-2xl text-left transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#7209b7]/5 rounded-bl-full pointer-events-none" />
              <div className="bg-[#7209b7]/10 w-12 h-12 rounded-xl flex items-center justify-center border border-[#7209b7]/20 mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6 text-[#9d4edd]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Clinician Portal</h3>
              <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
                Manage assigned patient lists, inspect joint range of motion charts, review stability indexes, compile PDF summaries, and add diagnostic comments.
              </p>
              <button className="flex items-center gap-2 text-xs font-semibold text-[#9d4edd] group-hover:text-white transition-colors">
                <span>Enter Doctor Portal</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="about" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-12">
          Engineered for Telehealth Screening
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#141820]/40 p-6 rounded-xl border border-[#1e293b] flex flex-col gap-4">
            <div className="bg-[#00b4d8]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#00b4d8]/20">
              <Video className="h-5 w-5 text-[#00b4d8]" />
            </div>
            <h4 className="text-lg font-bold text-white">Browser-Based Tracking</h4>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Calculates skeletal coordinate matrices directly in-browser using WebAssembly. Prevents server network congestion, protecting user bandwidth.
            </p>
          </div>

          <div className="bg-[#141820]/40 p-6 rounded-xl border border-[#1e293b] flex flex-col gap-4">
            <div className="bg-[#10b981]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#10b981]/20">
              <Layers className="h-5 w-5 text-[#10b981]" />
            </div>
            <h4 className="text-lg font-bold text-white">Kinematics Analysis</h4>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              FastAPI service processes extracted landmarks to dynamically compute Range of Motion, movement stability, jitter ratings, and side-to-side asymmetries.
            </p>
          </div>

          <div className="bg-[#141820]/40 p-6 rounded-xl border border-[#1e293b] flex flex-col gap-4">
            <div className="bg-[#7209b7]/10 w-10 h-10 rounded-lg flex items-center justify-center border border-[#7209b7]/20">
              <FileText className="h-5 w-5 text-[#9d4edd]" />
            </div>
            <h4 className="text-lg font-bold text-white">PDF Clinical Reporting</h4>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Converts clinical kinematics metrics and physician diagnosis remarks directly into downloadable, secure PDF reports mapped to database records.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Reference library */}
      <section className="py-16 px-6 bg-[#141820]/20 border-t border-[#1e293b] w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-10">
            <Award className="h-6 w-6 text-[#00b4d8]" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Supported Musculoskeletal Protocols</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { id: 'SF001', name: 'Shoulder Flexion', view: 'Side View', range: '160° - 180°' },
              { id: 'SA001', name: 'Shoulder Abduction', view: 'Front View', range: '160° - 180°' },
              { id: 'EF001', name: 'Elbow Flexion', view: 'Side View', range: '145° - 150°' },
              { id: 'KF001', name: 'Knee Flexion', view: 'Side View', range: '130° - 135°' },
              { id: 'HF001', name: 'Hip Flexion', view: 'Side View', range: '110° - 120°' },
              { id: 'NR001', name: 'Neck Rotation', view: 'Front View', range: '70° - 80°' },
            ].map((joint, idx) => (
              <div key={idx} className="bg-[#141820] border border-[#1e293b] p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] bg-[#1e293b] text-[#94a3b8] px-2 py-0.5 rounded font-mono font-semibold">{joint.id}</span>
                    <span className="text-[10px] text-[#00b4d8] font-bold uppercase tracking-wider">{joint.view}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{joint.name}</h4>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-[#1e293b] pt-3 text-xs text-[#94a3b8]">
                  <TrendingUp className="h-4.5 w-4.5 text-[#10b981]" />
                  <span>Normal ROM: <strong className="text-white">{joint.range}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
