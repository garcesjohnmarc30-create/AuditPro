"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DocumentationPage() {
  const [branches, setBranches] = useState<{ name: string; photos: string[]; notes: string }[]>([]);
  const [branchName, setBranchName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState(""); 
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [previewBranch, setPreviewBranch] = useState<{name: string, photos: string[], notes: string} | null>(null);

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
              <Textarea 
                placeholder="Add remarks (max 500 characters)" 
                maxLength={500} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
              <Button onClick={handleSave} className="w-full">Save Branch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border-t pt-4">
        {branches.map((b, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-2 border-b hover:bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">{b.name}</span>
            <div className="flex gap-2 items-center">
              <Dialog>
                <DialogTrigger asChild><Button variant="secondary" size="sm" className="h-7 text-xs px-2">NOTE</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Remarks for {b.name}</DialogTitle></DialogHeader>
                  <p className="text-sm text-slate-700 p-4 bg-slate-50 rounded border whitespace-pre-wrap">{b.notes || "No remarks added."}</p>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setPreviewBranch(b)}>
                    VIEW {b.photos?.length || 0}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[80vw] h-[80vh]">
                  <DialogHeader><DialogTitle>{b.name} - Gallery</DialogTitle></DialogHeader>
                  {/* DITO ANG PAGBABAGO: grid-cols-2 para malalaking thumbnail */}
                  <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2">
                    {b.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-video">
                        <img 
                          src={photo} 
                          className="w-full h-full object-cover rounded cursor-pointer transition hover:opacity-70 hover:scale-105 border" 
                          onClick={() => setSelectedIndex(idx)} 
                        />
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

      {/* FULL SCREEN PREVIEW OVERLAY - 9:16 Portrait at Horizontal Scroll */}
<Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
  <DialogContent className="max-w-[90vw] w-[90vw] h-[80vh] p-4 bg-white border-none shadow-2xl flex flex-col items-center justify-start">
    {selectedIndex !== null && previewBranch && (
      <>
        {/* Title */}
        <div className="w-full text-left font-bold text-lg mb-4">{previewBranch.name}</div>
        
        {/* Horizontal scroll container */}
        <div className="w-full h-full flex items-center overflow-x-auto gap-4 py-2">
          {previewBranch.photos.map((photo, idx) => (
            <div 
              key={idx} 
              // Dito natin pino-force ang 9:16 (aspect-[9/16])
              className="flex-shrink-0 w-[45%] h-full aspect-[9/16] border rounded-lg overflow-hidden bg-white"
            >
              <img 
                src={photo} 
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}