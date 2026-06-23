"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth 
} from "date-fns";
import { Trash2, Edit2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({ date: "", branch: "", status: "REGULAR", auditor: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [photos, setPhotos] = useState<Record<string, string[]>>({}); 
  const [uploadModal, setUploadModal] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<string | null>(null);
  const [remarksModal, setRemarksModal] = useState<any>(null);
  const [tempRemarks, setTempRemarks] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<{urls: string[], index: number} | null>(null);

  useEffect(() => {
    const q = query(collection(db, "calendarEvents"));
    return onSnapshot(q, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSave = async () => {
    if (!formData.date || !formData.branch) return;
    if (editingId) {
      await updateDoc(doc(db, "calendarEvents", editingId), formData);
      setEditingId(null);
    } else {
      await addDoc(collection(db, "calendarEvents"), formData);
    }
    setFormData({ date: "", branch: "", status: "REGULAR", auditor: "" });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sigurado ka bang buburahin ito?")) {
      await deleteDoc(doc(db, "calendarEvents", id));
    }
  };

  const startEditing = (trip: any) => {
    setEditingId(trip.id);
    setFormData({ date: trip.date, branch: trip.branch, status: trip.status, auditor: trip.auditor });
    setIsDialogOpen(true);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "SPECIAL": return "bg-green-100 border-green-300 text-green-900";
      case "CANCELLED": return "bg-red-100 border-red-300 text-red-900";
      default: return "bg-blue-200 border-blue-400 text-blue-950";
    }
  };

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Calendar Schedule</h1>
      
      <div className="flex items-center justify-between mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData({ date: "", branch: "", status: "REGULAR", auditor: "" }); }}>
              <Plus className="mr-2 h-4 w-4" /> ADD DATE
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Event" : "Add Audit Date"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              <Input placeholder="Enter Branch" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
              <select className="p-2 border rounded" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="REGULAR">REGULAR</option>
                <option value="SPECIAL">SPECIAL</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <Input placeholder="Auditor Name" value={formData.auditor} onChange={(e) => setFormData({...formData, auditor: e.target.value})} />
              <Button onClick={handleSave}>{editingId ? "UPDATE" : "SAVE"}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <h2 className="text-2xl font-bold text-center text-blue-900">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2 justify-self-end">
          <Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>Prev</Button>
          <Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-blue-900 border-2 border-blue-900 rounded-lg overflow-hidden shadow-lg">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-blue-800 p-2 text-center font-bold text-xs uppercase text-white">{day}</div>
        ))}
        {calendarDays.map((day) => {
          const dayTrips = trips.filter(t => isSameDay(parseISO(t.date), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dateKey = day.toISOString();

          return (
            <div key={day.toString()} className={`min-h-[140px] p-2 flex flex-col ${isCurrentMonth ? 'bg-blue-50' : 'bg-blue-100/50'}`}>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`text-sm font-bold ${!isCurrentMonth ? 'text-blue-300' : 'text-blue-900'}`}>{format(day, 'd')}</span>
                <div className="flex gap-1">
                   <button
  onClick={() => setViewModal(dateKey)}
  className="bg-white text-black text-[8px] px-2 py-0.5 rounded hover:bg-gray-800 transition-colors font-medium"
>
  VIEW
</button>
                   <button onClick={() => setUploadModal(dateKey)} className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded hover:bg-blue-700 transition-colors">UPLOAD</button>
                </div>
              </div>
              <div className="mt-1 space-y-1 flex-grow">
                {dayTrips.map((trip) => (
                  <div key={trip.id} className={`p-1 rounded border group relative ${getStatusStyles(trip.status)}`}>
                    <p className="text-[10px] font-bold truncate">{trip.branch}</p>
                    <p className="text-[9px] uppercase font-semibold">{trip.status}</p>
                    <p className="text-[9px] font-bold">{trip.auditor}</p>
                    <button onClick={() => { setRemarksModal(trip); setTempRemarks(trip.remarks || ""); }} className="w-full !bg-white text-black text-[8px] p-0.5 mt-1 rounded hover:bg-gray-800">REMARKS</button>
                    <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100">
                      <button onClick={() => startEditing(trip)}><Edit2 size={9}/></button>
                      <button onClick={() => handleDelete(trip.id)}><Trash2 size={9}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox - Facebook Style Viewer */}
{fullscreenImage && (

  <div className="fixed inset-0 z-[9999] bg-black/95">

```
{/* Counter */}
<div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10001]">
  <span className="text-white text-xl font-bold bg-black/50 px-4 py-2 rounded-lg">
    {fullscreenImage.index + 1} / {fullscreenImage.urls.length}
  </span>
</div>

{/* Main Viewer */}
<div className="relative w-full h-full flex items-center justify-center">

  {/* Previous Button */}
  {fullscreenImage.urls.length > 1 && (
    <button
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/70 transition-all z-[10001]"
      onClick={() =>
        setFullscreenImage(prev => ({
          ...prev!,
          index:
            prev!.index > 0
              ? prev!.index - 1
              : prev!.urls.length - 1
        }))
      }
    >
      <ChevronLeft size={36} />
    </button>
  )}

  {/* Image Wrapper */}
  <div className="relative">

    <img
      src={fullscreenImage.urls[fullscreenImage.index]}
      alt="Fullscreen"
      className="max-h-[92vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
    />

    {/* Close Button */}
    <button
      className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-red-600 transition-all z-[10002]"
      onClick={() => setFullscreenImage(null)}
    >
      <X size={24} />
    </button>

  </div>

  {/* Next Button */}
  {fullscreenImage.urls.length > 1 && (
    <button
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/70 transition-all z-[10001]"
      onClick={() =>
        setFullscreenImage(prev => ({
          ...prev!,
          index:
            prev!.index < prev!.urls.length - 1
              ? prev!.index + 1
              : 0
        }))
      }
    >
      <ChevronRight size={36} />
    </button>
  )}

</div>
```

  </div>
)}


      {/* MODALS */}
      <Dialog open={!!remarksModal} onOpenChange={() => setRemarksModal(null)}>
        <DialogContent>
            <DialogTitle>Remarks</DialogTitle>
            <textarea className="w-full h-32 p-2 border" value={tempRemarks} onChange={(e) => setTempRemarks(e.target.value)} />
            <Button onClick={async () => { await updateDoc(doc(db, "calendarEvents", remarksModal.id), { remarks: tempRemarks }); setRemarksModal(null); }}>SAVE</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!uploadModal} onOpenChange={() => setUploadModal(null)}>
        <DialogContent>
            <DialogTitle>Upload Photos (Max 10)</DialogTitle>
            <Input type="file" multiple onChange={(e) => {
                if (e.target.files) {
                    const newUrls = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                    setPhotos(prev => ({ ...prev, [uploadModal!]: [...(prev[uploadModal!] || []), ...newUrls] }));
                }
            }} />
            <Button onClick={() => setUploadModal(null)}>SAVE PHOTOS</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewModal} onOpenChange={() => setViewModal(null)}>
        <DialogContent className="max-w-4xl">
            <DialogTitle>Gallery View</DialogTitle>
            <div className="flex overflow-x-auto gap-4 p-4 border rounded min-h-[150px]">
                {photos[viewModal!]?.map((url, idx) => (
                    <img 
    key={idx} 
    src={url} 
    alt="upload" 
    className="w-32 h-32 object-cover rounded cursor-pointer transition-transform hover:scale-105 hover:opacity-80"
    onClick={() => {
        setFullscreenImage({urls: photos[viewModal!], index: idx});
        setViewModal(null); // <--- IDAGDAG MO ITO PARA MAG-CLOSE ANG GALLERY
    }}
/>
                )) || <p className="text-gray-400">No photos found.</p>}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}