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
import { Trash2, Edit2, Plus } from "lucide-react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({ date: "", branch: "", status: "REGULAR", auditor: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-6">
        <div className="justify-self-start">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ date: "", branch: "", status: "REGULAR", auditor: "" }); }}>
                <Plus className="mr-2 h-4 w-4" /> ADD DATE
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Edit Event" : "Add Event"}</DialogTitle></DialogHeader>
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
        </div>

        <div className="justify-self-center">
          <h2 className="text-2xl font-bold w-48 text-center text-blue-900">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>

        <div className="justify-self-end flex gap-2">
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

          return (
            <div key={day.toString()} className={`min-h-[120px] p-2 ${isCurrentMonth ? 'bg-blue-50' : 'bg-blue-100/50'}`}>
              <span className={`text-sm font-semibold ${!isCurrentMonth ? 'text-blue-300' : 'text-blue-900'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayTrips.map((trip) => (
                  <div key={trip.id} className={`p-1 rounded border group relative ${getStatusStyles(trip.status)}`}>
                    <p className="text-xs font-bold truncate leading-tight pr-5">{trip.branch}</p>
                    <p className="text-[9px] uppercase font-semibold">{trip.status}</p>
                    <p className="text-[9px] font-medium opacity-80 truncate">{trip.auditor}</p>
                    
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => startEditing(trip)} className="hover:text-blue-800"><Edit2 size={10}/></button>
                      <button onClick={() => handleDelete(trip.id)} className="hover:text-red-700"><Trash2 size={10}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}