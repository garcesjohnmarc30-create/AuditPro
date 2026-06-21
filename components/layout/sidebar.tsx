"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => 
    `block text-white transition py-2 px-3 rounded-lg ${pathname === path ? "bg-blue-600" : "hover:bg-slate-800"}`;

  return (
    <div className="h-full bg-[#0f172a] p-6 flex flex-col">
      <nav className="flex-grow space-y-2">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">Menu</p>
        
        <Link href="/trip-tickets" className={getLinkClass("/trip-tickets")}>
          Trip Tickets
        </Link>
        <Link href="/documentation" className={getLinkClass("/documentation")}>
          Documentation
        </Link>
        <Link href="/calendar" className={getLinkClass("/calendar")}>
          Calendar
        </Link>
      </nav>

      <nav className="border-t border-slate-700 pt-4">
        <Link href="/profile" className={getLinkClass("/profile")}>
          Profile
        </Link>
      </nav>
    </div>
  );
}