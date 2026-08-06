import React from 'react';
import { Activity, Shield, Stethoscope } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-[#141820] border-b border-[#1e293b] sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-[#00b4d8]/10 p-2 rounded-lg border border-[#00b4d8]/20 flex items-center justify-center">
          <Activity className="h-6 w-6 text-[#00b4d8]" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-white">Flexion<span className="text-[#00b4d8]">AI</span></span>
          <span className="block text-[10px] text-[#94a3b8] tracking-widest uppercase">Clinical MSK Telehealth</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <a href="#about" className="text-sm font-medium text-[#94a3b8] hover:text-[#00b4d8] transition-colors">Screening Suite</a>
        <a href="#portal" className="text-sm font-medium text-[#94a3b8] hover:text-[#00b4d8] transition-colors">Portals</a>
        <div className="flex items-center gap-2 bg-[#0d0f12] px-3 py-1.5 rounded-full border border-[#1e293b] text-[11px] text-[#10b981] font-semibold">
          <Shield className="h-3 w-3" />
          <span>HIPAA Secure</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
