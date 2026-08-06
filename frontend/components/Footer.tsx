import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#141820] border-t border-[#1e293b] py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-white">Flexion AI Telehealth Platform</p>
          <p className="text-xs text-[#94a3b8] mt-1">Remote markerless biomechanics screening engine.</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
          <span>Made with</span>
          <Heart className="h-3 w-3 text-[#ef4444] fill-[#ef4444]" />
          <span>for Final Year Major Project &copy; 2026.</span>
        </div>
        <div className="text-xs text-[#94a3b8] italic">
          Disclaimer: Educational & Research tool only.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
