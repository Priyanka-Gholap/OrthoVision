'use client';

import { Activity, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../app/context/AuthContext';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-[#141820] border-b border-[#1e293b] sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-3">
        <div className="bg-[#00b4d8]/10 p-2 rounded-lg border border-[#00b4d8]/20 flex items-center justify-center">
          <Activity className="h-6 w-6 text-[#00b4d8]" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-white">Flexion<span className="text-[#00b4d8]">AI</span></span>
          <span className="block text-[10px] text-[#94a3b8] tracking-widest uppercase">Clinical MSK Telehealth</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-[#94a3b8] hover:text-[#00b4d8] transition-colors">Screening Suite</Link>
        {user ? (
          <>
            <Link 
              href={user.role === 'Doctor' ? '/doctor' : '/patient'} 
              className="text-sm font-medium text-[#94a3b8] hover:text-[#00b4d8] flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-[#00b4d8]" />
              <span>Dashboard</span>
            </Link>
            <button 
              onClick={logout} 
              className="text-sm font-medium text-[#ef4444] hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out ({user.fullName.split(' ')[0]})</span>
            </button>
          </>
        ) : (
          <Link href="/login" className="text-sm font-medium text-[#00b4d8] hover:underline transition-colors">
            Portal Login
          </Link>
        )}
        <div className="flex items-center gap-2 bg-[#0d0f12] px-3 py-1.5 rounded-full border border-[#1e293b] text-[11px] text-[#10b981] font-semibold">
          <Shield className="h-3 w-3" />
          <span>HIPAA Secure</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
