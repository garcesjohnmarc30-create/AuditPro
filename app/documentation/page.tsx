"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function DocumentationPage() {
  const [branches, setBranches] = useState<{ name: string; photos: string[]; notes: string }[]>([]);
  const [branchName, setBranchName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState(""); 
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeBranch, setActiveBranch] = useState<{name: string, photos: string[], notes: string} | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editRemarks, setEditRemarks] = useState("");
  const [fullScreen, setFullScreen] = useState<string | null>(null);

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

  const handleEditSave = (index: number) => {
    const updated = [...branches];
    updated[index].notes = editRemarks;
    setBranches(updated);
    localStorage.setItem("myBranches", JSON.stringify(updated));
    setEditingIndex(null);
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
          <DialogTrigger asChild><Button size="sm"> + NEW BRANCH</Button></DialogTrigger>
          <DialogContent className="max-w-md w-[90vw]"> 
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
              <Textarea placeholder="Add remarks" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full resize-none" />
              <Button onClick={handleSave} className="w-full">Save Branch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="pt-4">
        {branches.map((b, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-3 hover:bg-slate-50 transition-colors">
            <span className="font-semibold text-sm text-slate-700">{b.name}</span>
            <div className="flex gap-2 items-center">
              
              <Dialog onOpenChange={(isOpen) => !isOpen && setEditingIndex(null)}>
                <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs px-2">NOTE</Button></DialogTrigger>
                <DialogContent className="w-[90vw] max-w-sm p-6 flex flex-col">
                  <DialogHeader><DialogTitle>Remarks</DialogTitle></DialogHeader>
                  {editingIndex === i ? (
                    <div className="space-y-4 w-full">
                      <Textarea value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} className="w-full min-h-[100px]" />
                      <Button onClick={() => handleEditSave(i)} className="w-full">Save Changes</Button>
                    </div>
                  ) : (
                    <div className="space-y-4 w-full">
                      <p className="p-4 bg-slate-50 rounded text-sm break-words whitespace-pre-wrap min-w-0 w-full">
                        {b.notes || "No remarks."}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingIndex(i); setEditRemarks(b.notes); }} className="w-full">Edit Remarks</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => { setActiveBranch(b); setSelectedIndex(0); }}>
                    VIEW {b.photos?.length || 0}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[500px] w-[90vw] p-6">
                  <DialogHeader><DialogTitle>{activeBranch?.name} - Gallery</DialogTitle></DialogHeader>
                  {selectedIndex !== null && activeBranch?.photos[selectedIndex] && (
                    <div className="mb-4 relative group">
                      <img src={activeBranch.photos[selectedIndex]} className="w-full h-64 object-contain rounded bg-slate-100" />
                      <button 
                        onClick={() => setFullScreen(activeBranch.photos[selectedIndex!])}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {activeBranch?.photos.map((photo, idx) => (
                      <img key={idx} src={photo} className={`w-16 h-16 object-cover rounded cursor-pointer ${selectedIndex === idx ? "opacity-100 border-2 border-black" : "opacity-50"}`} onClick={() => setSelectedIndex(idx)} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 pt-4">
                    <Button variant="ghost" size="sm" disabled={selectedIndex === 0} onClick={() => setSelectedIndex(p => (p !== null ? p - 1 : 0))}>Prev</Button>
                    <Button variant="ghost" size="sm" disabled={selectedIndex === (activeBranch?.photos.length || 1) - 1} onClick={() => setSelectedIndex(p => (p !== null ? p + 1 : 0))}>Next</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(i)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>

      {/* Transparent Full Screen Lightbox */}
      <Dialog open={!!fullScreen} onOpenChange={(open) => !open && setFullScreen(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex items-center justify-center p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          {/* Custom Close Button */}
          <button
            onClick={() => setFullScreen(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
          >
            <X size={20} />
          </button>
          
          {/* Left Navigation */}
          <button 
            className="absolute left-4 z-50 p-3 bg-black/30 text-white rounded-full hover:bg-black/50"
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = activeBranch?.photos.indexOf(fullScreen!);
              if (currentIndex !== undefined && currentIndex > 0) {
                setFullScreen(activeBranch!.photos[currentIndex - 1]);
              }
            }}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Main Image */}
          {fullScreen && (
            <img 
              src={fullScreen} 
              className="max-h-full max-w-[80%] object-contain" 
            />
          )}

          {/* Right Navigation */}
          <button 
            className="absolute right-4 z-50 p-3 bg-black/30 text-white rounded-full hover:bg-black/50"
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = activeBranch?.photos.indexOf(fullScreen!);
              if (currentIndex !== undefined && currentIndex < (activeBranch?.photos.length || 1) - 1) {
                setFullScreen(activeBranch!.photos[currentIndex + 1]);
              }
            }}
          >
            <ChevronRight size={32} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}