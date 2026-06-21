"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DocumentationPage() {
  const [branches, setBranches] = useState<{ name: string; photos: string[]; notes: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeBranch, setActiveBranch] = useState<{name: string, photos: string[], notes: string} | null>(null);

  // ... (panatilihin ang iyong existing useEffect, handleSave, handleDelete logic)

  return (
    <div className="p-6">
      {/* ... (Existing Header) ... */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border-t pt-4">
        {branches.map((b, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-2 border-b hover:bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">{b.name}</span>
            <div className="flex gap-2 items-center">
              {/* VIEW BUTTON - Dito magbubukas ang Gallery sa isang row */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setActiveBranch(b)}>
                    VIEW {b.photos?.length || 0}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] h-[50vh]">
                  <DialogHeader><DialogTitle>{b.name} - Gallery</DialogTitle></DialogHeader>
                  {/* SINGLE ROW HORIZONTAL SCROLL */}
                  <div className="flex gap-4 overflow-x-auto py-4 h-full">
                    {b.photos.map((photo, idx) => (
                      <div key={idx} className="flex-shrink-0 w-[120px] aspect-[9/16] cursor-pointer hover:opacity-80 transition" onClick={() => setSelectedIndex(idx)}>
                        <img src={photo} className="w-full h-full object-cover rounded border" />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {/* ... (Trash Button) ... */}
            </div>
          </div>
        ))}
      </div>

      {/* FULL SCREEN PREVIEW - White background, Left/Right Buttons */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] p-0 border-none bg-white flex items-center justify-center">
          {selectedIndex !== null && activeBranch && (
            <>
              {/* Navigation sa itaas */}
              <div className="absolute top-4 flex gap-4 z-50">
                <Button variant="outline" onClick={() => setSelectedIndex(prev => Math.max(0, (prev || 0) - 1))}>
                  <ChevronLeft size={24} />
                </Button>
                <Button variant="outline" onClick={() => setSelectedIndex(prev => Math.min((activeBranch.photos.length - 1), (prev || 0) + 1))}>
                  <ChevronRight size={24} />
                </Button>
              </div>
              
              <img src={activeBranch.photos[selectedIndex]} className="max-w-[90vw] max-h-[85vh] object-contain" />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}