"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar"; // Siguraduhing ito ay galing sa npx shadcn add calendar
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { parseISO } from "date-fns";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({ date: "", branch: "", status: "REGULAR", auditor: "" });

  useEffect(() => {
    const q = query(collection(db, "calendarEvents"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData.date || !formData.branch) return;
    await addDoc(collection(db, "calendarEvents"), formData);
    setFormData({ date: "", branch: "", status: "REGULAR", auditor: "" });
  };

  // Helper para maayos ang date comparison
  const bookedDates = trips.map(t => parseISO(t.date));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Calendar Schedule</h1>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">+ ADD DATE</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Event</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            <Input placeholder="Enter Branch" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
            <select className="p-2 border rounded" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="REGULAR">REGULAR</option>
              <option value="SPECIAL">SPECIAL</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <Input placeholder="Auditor Name" value={formData.auditor} onChange={(e) => setFormData({...formData, auditor: e.target.value})} />
            <Button onClick={handleSave}>SAVE DATE</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white p-6 rounded-xl border shadow-sm inline-block">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          // Ginamit ang parseISO para maiwasan ang day-shift error
          modifiers={{ booked: bookedDates }}
          modifiersStyles={{ 
            booked: { backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%' } 
          }}
        />
      </div>

      {/* Info section para sa selected date */}
      <div className="mt-4">
        {date && (
          <p className="text-sm text-zinc-600">
            Selected: {formatDate(date)}
          </p>
        )}
      </div>
    </div>
  );
}

// Simple helper para sa display
function formatDate(date: Date) {
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}