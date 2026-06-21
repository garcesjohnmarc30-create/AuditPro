"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DocumentationPage() {
  const [branches, setBranches] = useState<{ name: string; photos: string[] }[]>([]);
  const [branchName, setBranchName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeBranchPhotos, setActiveBranchPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("myBranches");
    if (saved) {
      try { setBranches(JSON.parse(saved)); } catch (e) { setBranches([]); }
    }
  }, []);

  const handleSave = () => {
    if (branchName && photos.length > 0) {
      const newBranch = { name: branchName, photos };
      const updated = [...branches, newBranch];
      setBranches(updated);
      localStorage.setItem("myBranches", JSON.stringify(updated));
      setBranchName(""); setPhotos([]); setOpen(false);
    }
  };

  const handleDelete = (indexToDelete: number) => {
    const updated = branches.filter((_, index) => index !== indexToDelete);
    setBranches(updated);
    localStorage.setItem("myBranches", JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      {/* HEADER SECTION - Dito nakalagay ang + NEW BRANCH button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">BRANCHES</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ NEW BRANCH</Button>
          </DialogTrigger>
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
              <Button onClick={handleSave} className="w-full">Save Branch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* BRANCHES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border-t pt-4">
        {branches.map((b, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-2 border-b hover:bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">{b.name}</span>
            <div className="flex gap-1 items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setActiveBranchPhotos(b.photos)}>
                    VIEW {b.photos?.length || 0}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-[95vw] h-[80vh] p-4">
                  <DialogHeader><DialogTitle>{b.name} - Gallery</DialogTitle></DialogHeader>
                  <div className="flex flex-nowrap gap-4 p-2 w-full h-full overflow-x-auto">
                    {b.photos.map((photo, idx) => (
                      <div key={idx} className="flex-shrink-0 w-64 aspect-[9/16] cursor-pointer" 
                           onClick={() => setSelectedIndex(idx)}>
                        <img src={photo} className="w-full h-full object-cover rounded-md border" />
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

      {/* FULL SCREEN PREVIEW WITH NAVIGATION AT THE TOP */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
          {selectedIndex !== null && (
            <>
              <div className="absolute top-10 flex gap-4 z-50">
                <Button variant="ghost" className="text-white bg-black/40 hover:bg-black/60 p-6 rounded-full" 
                        onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => Math.max(0, (prev || 0) - 1)); }}>
                  <ChevronLeft size={48} />
                </Button>
                <Button variant="ghost" className="text-white bg-black/40 hover:bg-black/60 p-6 rounded-full" 
                        onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => Math.min((activeBranchPhotos.length - 1), (prev || 0) + 1)); }}>
                  <ChevronRight size={48} />
                </Button>
              </div>
              <img src={activeBranchPhotos[selectedIndex]} className="max-w-[90vw] max-h-[85vh] object-contain mt-16" />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}