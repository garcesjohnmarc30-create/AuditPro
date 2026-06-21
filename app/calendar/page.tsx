"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth 
} from "date-fns";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({ date: "", branch: "", status: "REGULAR", auditor: "" });

  useEffect(() => {
    const q = query(collection(db, "calendarEvents"));
    return onSnapshot(q, (snapshot) => {
      setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSave = async () => {
    if (!formData.date || !formData.branch) return;
    await addDoc(collection(db, "calendarEvents"), formData);
    setFormData({ date: "", branch: "", status: "REGULAR", auditor: "" });
  };

  // Helper para sa Color Coding
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "SPECIAL":
        return "bg-green-50 border-green-200 text-green-900";
      case "CANCELLED":
        return "bg-red-50 border-red-200 text-red-900";
      case "REGULAR":
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Calendar Schedule</h1>
      
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-6">
        <div className="justify-self-start">
          <Dialog>
            <DialogTrigger asChild><Button>+ ADD DATE</Button></DialogTrigger>
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
        </div>

        <div className="justify-self-center">
          <h2 className="text-2xl font-bold w-48 text-center">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>

        <div className="justify-self-end flex gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>Prev</Button>
          <Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-zinc-200 border border-zinc-200 rounded-lg overflow-hidden shadow-lg">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-zinc-100 p-2 text-center font-bold text-xs uppercase text-zinc-600">{day}</div>
        ))}
        
        {calendarDays.map((day) => {
          const dayTrips = trips.filter(t => isSameDay(parseISO(t.date), day));
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div key={day.toString()} className={`bg-white min-h-[120px] p-2 ${!isCurrentMonth ? 'bg-zinc-50' : ''}`}>
              <span className={`text-sm font-semibold ${!isCurrentMonth ? 'text-zinc-300' : 'text-zinc-900'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayTrips.map((trip, i) => (
                  <div key={i} className={`p-1 rounded border ${getStatusStyles(trip.status)}`}>
                    <p className="text-xs font-bold truncate leading-tight">{trip.branch}</p>
                    <p className="text-[9px] uppercase font-semibold">{trip.status}</p>
                    <p className="text-[9px] font-medium opacity-80 truncate">{trip.auditor}</p>
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