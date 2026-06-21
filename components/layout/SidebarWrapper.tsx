"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar"; // Siguraduhing nandito ang original sidebar mo
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Conditional Rendering */}
      {isOpen && (
        <div className="w-64 border-r bg-white z-20">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-auto">
        <header className="h-16 border-b flex items-center px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">AuditPro</h1>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}