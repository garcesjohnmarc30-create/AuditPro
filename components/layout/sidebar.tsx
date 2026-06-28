"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // Helper function para sa active link styling
  const getLinkClass = (path: string) => 
    `block text-white transition py-2 px-3 rounded-lg ${
      pathname === path ? "bg-blue-600 font-bold" : "hover:bg-slate-800"
    }`;

  return (
    <div className="h-full w-64 bg-[#0f172a] p-6 flex flex-col border-r border-slate-700">
      <div className="mb-8">
      </div>

      <nav className="flex-grow space-y-2">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Main Menu
        </p>
        
        <Link href="/Branch Audit" className={getLinkClass("/Branch Audit")}>
          Branch Audit
        </Link>
          
        <Link href="/calendar" className={getLinkClass("/calendar")}>
          Calendar
        </Link>
        
        {/* Ang "Summary of Sales" link ay tinanggal na rito */}
      </nav>

      <nav className="border-t border-slate-700 pt-4">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Account
        </p>
        <Link href="/profile" className={getLinkClass("/profile")}>
          Profile
        </Link>
      </nav>
    </div>
  );
}