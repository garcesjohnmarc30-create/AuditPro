"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => 
    `block text-white transition py-2 px-3 rounded-lg ${pathname === path ? "bg-blue-600" : "hover:bg-slate-800"}`;

  return (
    <div className="fixed left-0 top-0 h-screen z-50 bg-[#0f172a] p-6 w-64 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">AuditPro</h1>
      </div>
      
      {/* Main Navigation (Dito ang Trip Tickets at Documentation) */}
      <nav className="flex-grow space-y-2">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">Menu</p>
        
        <Link href="/trip-tickets" className={getLinkClass("/trip-tickets")}>
          Trip Tickets
        </Link>
        <Link href="/documentation" className={getLinkClass("/documentation")}>
          Documentation
        </Link>
      </nav>

      {/* Footer Navigation (Dito lang ang Profile sa ilalim) */}
      <nav className="border-t border-slate-700 pt-4">
        <Link href="/profile" className={getLinkClass("/profile")}>
          Profile
        </Link>
      </nav>
    </div>
  );
}