"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Dito natin ilalagay ang button sa loob ng blue area */}
      {isOpen && (
        <div className="w-64 border-r bg-slate-900 text-white z-20 flex flex-col">
          {/* Header sa loob ng Sidebar */}
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">AuditPro</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-slate-700"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-auto">
        {/* Tinanggal na natin ang header dito para hindi na magdoble */}
        {!isOpen && (
          <header className="h-16 border-b flex items-center px-6">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="h-6 w-6" />
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