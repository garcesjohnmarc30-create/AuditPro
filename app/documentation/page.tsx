"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function DocumentationPage() {
  const [branches, setBranches] = useState<{ name: string; photos: string[]; notes: string }[]>([]);
  const [branchName, setBranchName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState(""); 
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeBranch, setActiveBranch] = useState<{name: string, photos: string[], notes: string} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("myBranches");
    if (saved) {
      try { setBranches(JSON.parse(saved)); } catch (e) { setBranches([]); }
    }
  }, []);

  const handleSave = () => {
    if (branchName) {
      const newBranch = { name: branchName, photos, notes };
      const updated = [...branches, newBranch];
      setBranches(updated);
      localStorage.setItem("myBranches", JSON.stringify(updated));
      setBranchName(""); setPhotos([]); setNotes(""); setOpen(false);
    }
  };

  const handleDelete = (indexToDelete: number) => {
    const updated = branches.filter((_, index) => index !== indexToDelete);
    setBranches(updated);
    localStorage.setItem("myBranches", JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">BRANCHES</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">+ NEW BRANCH</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Branch</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Branch Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
              <Input type="file" multiple accept="image/*" onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  Promise.all(Array.from(files).slice(0, 10).map(f => new Promise<string>(res => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result as string);
                    reader.readAsDataURL(f);
                  }))).then(setPhotos);
                }
              }} />
              {/* Added break-words to ensure text wraps */}
              <Textarea 
                placeholder="Add remarks" 
                maxLength={500} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="break-words whitespace-pre-wrap"
              />
              <Button onClick={handleSave} className="w-full">Save Branch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border-t pt-4">
        {branches.map((b, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-2 border-b hover:bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">{b.name}</span>
            <div className="flex gap-2 items-center">
              <Dialog>
                <DialogTrigger asChild><Button variant="secondary" size="sm" className="h-7 text-xs px-2">NOTE</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Remarks</DialogTitle></DialogHeader>
                  {/* Added break-words and w-full to force downward wrapping */}
                  <p className="text-sm p-4 bg-slate-50 rounded border whitespace-pre-wrap break-words w-full">
                    {b.notes || "No remarks."}
                  </p>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setActiveBranch(b)}>
                    VIEW {b.photos?.length || 0}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] h-[50vh]">
                  <DialogHeader><DialogTitle>{b.name} - Gallery</DialogTitle></DialogHeader>
                  <div className="flex gap-4 overflow-x-auto py-4 h-full">
                    {b.photos.map((photo, idx) => (
                      <div key={idx} className="flex-shrink-0 w-[120px] h-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedIndex(idx)}>
                        <img src={photo} className="w-full h-full object-cover rounded border" />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(i)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>

      {/* FULL SCREEN PREVIEW */}
      {selectedIndex !== null && activeBranch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[110]">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSelectedIndex(prev => Math.max(0, (prev || 0) - 1))}><ChevronLeft size={24} /></Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSelectedIndex(null)}><X size={24} /></Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSelectedIndex(prev => Math.min(activeBranch.photos.length - 1, (prev || 0) + 1))}><ChevronRight size={24} /></Button>
          </div>
          <img src={activeBranch.photos[selectedIndex]} className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </div>
  );
}