"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

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
          <DialogTrigger asChild><Button size="sm">+ NEW BRANCH</Button></DialogTrigger>
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

      <div className="pt-4 border-t border-slate-200">
        {branches.map((b, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-3 border-b border-slate-200 hover:bg-slate-50">
            <span className="font-semibold text-sm text-slate-700">{b.name}</span>
            <div className="flex gap-2 items-center">
              
              <Dialog onOpenChange={(isOpen) => !isOpen && setEditingIndex(null)}>
  <DialogTrigger asChild><Button variant="secondary" size="sm" className="h-7 text-xs px-2 border border-blue-500">NOTE</Button></DialogTrigger>
  
  {/* Dito ang fix: Dagdagan ng flex flex-col para manatili ang button sa ilalim */}
  <DialogContent className="w-[90vw] max-w-sm border-2 border-blue-500 p-6 flex flex-col">
    <DialogHeader><DialogTitle>Remarks</DialogTitle></DialogHeader>
    
    {editingIndex === i ? (
      <div className="space-y-4 w-full">
        <Textarea 
          value={editRemarks} 
          onChange={(e) => setEditRemarks(e.target.value)} 
          className="w-full min-h-[100px] border-blue-500" 
        />
        <Button onClick={() => handleEditSave(i)} className="w-full">Save Changes</Button>
      </div>
    ) : (
      <div className="space-y-4 w-full">
        {/* Dito ang fix: min-w-0 para gumana ang wrapping sa loob ng flex container */}
        <p className="p-4 bg-slate-50 rounded border border-blue-500 text-sm break-words whitespace-pre-wrap min-w-0 w-full">
          {b.notes || "No remarks."}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setEditingIndex(i); setEditRemarks(b.notes); }} 
          className="w-full border-blue-500"
        >
          Edit Remarks
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 border-blue-500" onClick={() => { setActiveBranch(b); setSelectedIndex(0); }}>
                    VIEW {b.photos?.length || 0}
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-[500px] w-[90vw] border-2 border-blue-500 p-6">
                  <DialogHeader>
                    <DialogTitle>{activeBranch?.name} - Gallery</DialogTitle>
                  </DialogHeader>
                  
                  {selectedIndex !== null && activeBranch?.photos[selectedIndex] && (
                    <div className="mb-4">
                      <img src={activeBranch.photos[selectedIndex]} className="w-full h-64 object-contain rounded border-2 border-blue-500 bg-slate-100" />
                    </div>
                  )}

                  <div className="flex gap-2 overflow-x-auto py-2 border-y-2 border-blue-500">
                    {activeBranch?.photos.map((photo, idx) => (
                      <img key={idx} src={photo} className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${selectedIndex === idx ? "border-blue-600" : "border-blue-500"}`} onClick={() => setSelectedIndex(idx)} />
                    ))}
                  </div>

                  <div className="flex justify-between mt-4 pt-4">
                    <Button variant="outline" size="sm" className="border-blue-500" disabled={selectedIndex === 0} onClick={() => setSelectedIndex(p => (p !== null ? p - 1 : 0))}>Prev</Button>
                    <Button variant="outline" size="sm" className="border-blue-500" disabled={selectedIndex === (activeBranch?.photos.length || 1) - 1} onClick={() => setSelectedIndex(p => (p !== null ? p + 1 : 0))}>Next</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(i)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}