"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface StaffMember {
  name: string;
  isPresent: boolean;
}

export interface Trip {
  id: string;
  branch: string;
  startDate: string;
  endDate: string;
  staff: StaffMember[];
  status: "Complete" | "Lack";
}

export default function TripTicketsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newTrip, setNewTrip] = useState({ 
    branch: "", startDate: "", endDate: "", 
    staff: Array(4).fill({ name: "", isPresent: true }),
    status: "Complete" as "Complete" | "Lack" 
  });

  useEffect(() => {
    const q = query(collection(db, "trips"), orderBy("startDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
      setTrips(tripsData);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    if (!trips || trips.length === 0) return { totalBranches: 0, present: 0, absent: 0 };
    let present = 0;
    let absent = 0;
    trips.forEach(t => {
      if (t.staff && Array.isArray(t.staff)) {
        t.staff.forEach(s => {
          if (s?.name && typeof s.name === 'string') {
            s.isPresent ? present++ : absent++;
          }
        });
      }
    });
    return { totalBranches: new Set(trips.map(t => t.branch)).size, present, absent };
  }, [trips]);

  const addTrip = async () => {
    if (!newTrip.branch) return;
    try {
      await addDoc(collection(db, "trips"), {
        branch: newTrip.branch,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        staff: newTrip.staff.filter(s => s.name.trim() !== ""),
        status: newTrip.status
      });
      setNewTrip({ branch: "", startDate: "", endDate: "", staff: Array(4).fill({ name: "", isPresent: true }), status: "Complete" });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await deleteDoc(doc(db, "trips", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  return (
    <div className="p-8 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Trip Tickets Overview</h1>
      <div className="flex gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border shadow-sm w-48">
          <p className="text-xs text-zinc-500 font-bold uppercase">Branches</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalBranches}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm w-48">
          <p className="text-xs text-zinc-500 font-bold uppercase">Present</p>
          <p className="text-3xl font-bold text-blue-500">{stats.present}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm w-48">
          <p className="text-xs text-zinc-500 font-bold uppercase">Absent</p>
          <p className="text-3xl font-bold text-red-500">{stats.absent}</p>
        </div>
      </div>

      <div className="mb-6">
        <Dialog>
          <DialogTrigger asChild><Button>+ New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Trip Ticket</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Branch Name" value={newTrip.branch} onChange={(e) => setNewTrip({...newTrip, branch: e.target.value})} />
              <Input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} />
              <Input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} />
              <select className="w-full p-2 border rounded-md" value={newTrip.status} onChange={(e) => setNewTrip({...newTrip, status: e.target.value as "Complete" | "Lack"})}>
                <option value="Complete">Complete Staff</option>
                <option value="Lack">Lack of Staff</option>
              </select>
              {newTrip.staff.map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" checked={newTrip.staff[i].isPresent} onChange={(e) => {
                    const s = [...newTrip.staff]; s[i] = {...s[i], isPresent: e.target.checked}; setNewTrip({...newTrip, staff: s});
                  }} />
                  <Input placeholder={`Staff ${i + 1}`} value={newTrip.staff[i].name} onChange={(e) => {
                    const s = [...newTrip.staff]; s[i] = {...s[i], name: e.target.value}; setNewTrip({...newTrip, staff: s});
                  }} />
                </div>
              ))}
              <Button onClick={addTrip}>Save Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">{trip.branch}</TableCell>
                <TableCell className="text-zinc-500 text-sm">{trip.startDate} - {trip.endDate}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {trip.staff.map((member, i) => (
                        <span key={i} className={cn("px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm", member.isPresent ? "bg-blue-400" : "bg-red-500")}>
                          {member.name}
                        </span>
                      ))}
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold w-fit uppercase", trip.status === "Complete" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {trip.status === "Complete" ? "Complete Staff" : "Lack of Staff"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right"><Button variant="ghost" className="text-red-500 h-8" onClick={() => deleteTrip(trip.id)}>Remove</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}