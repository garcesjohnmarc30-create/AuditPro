"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR AREA (Blue) */}
      {isOpen && (
        <div className="w-64 bg-slate-900 text-white z-20 flex flex-col transition-all">
          
          {/* HEADER DITO - DITO NATIN ILALAGAY ANG BUTTON */}
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold">AuditPro</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1">
            <Sidebar />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 flex flex-col h-full overflow-auto bg-gray-50 transition-all`}>
        {/* BUTTON SA TAAS KUNG SARADO ANG SIDEBAR */}
        {!isOpen && (
          // Tinanggal natin ang 'border-b' class dito sa header
          <header className="h-16 flex items-center px-6 bg-white">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
              <Menu className="h-6 w-6 text-slate-900" />
            </Button>
          </header>
        )}
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}