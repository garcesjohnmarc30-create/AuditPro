"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
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
  auditor: string;
  status: string;
}

export default function TripTicketsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const initialTripState = { 
    branch: "", 
    startDate: "", 
    endDate: "", 
    auditor: "MARC",
    staff: Array(5).fill({ name: "", isPresent: true }),
    status: "Complete"
  };

  const [newTrip, setNewTrip] = useState(initialTripState);

  const analytics = {
    branches: trips.length,
    present: trips.flatMap(t => t.staff || []).filter(s => s.isPresent).length,
    absent: trips.flatMap(t => t.staff || []).filter(s => !s.isPresent).length,
    completeStaff: trips.filter(t => t.status === "Complete").length,
    incompleteStaff: trips.filter(t => t.status !== "Complete").length,
  };

  useEffect(() => {
    const q = query(collection(db, "trips"), orderBy("startDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
      setTrips(tripsData);
    });
    return () => unsubscribe();
  }, []);

  const saveTrip = async () => {
    if (!newTrip.branch) return;
    try {
      const tripData = {
        branch: newTrip.branch,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        auditor: newTrip.auditor,
        // Sinave ang buong array para manatili ang 5 slots
        staff: newTrip.staff, 
        status: newTrip.status 
      };

      if (editingId) {
        await updateDoc(doc(db, "trips", editingId), tripData);
      } else {
        await addDoc(collection(db, "trips"), tripData);
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setNewTrip(initialTripState);
    } catch (e) {
      console.error("Error saving document: ", e);
    }
  };

  const deleteTrip = async (id: string) => {
    await deleteDoc(doc(db, "trips", id));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="p-8 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Trip Tickets Overview</h1>
      <p className="text-zinc-500 mb-6">Manage and monitor all audit branch assignments.</p>

      <div className="flex flex-row gap-8 mb-8">
        {[
          { label: "BRANCHES", val: analytics.branches, color: "text-zinc-900" },
          { label: "PRESENT", val: analytics.present, color: "text-blue-500" },
          { label: "ABSENT", val: analytics.absent, color: "text-red-500" },
          { label: "COMPLETE STAFF", val: analytics.completeStaff, color: "text-green-600" },
          { label: "INCOMPLETE", val: analytics.incompleteStaff, color: "text-red-600" },
        ].map((item, i) => (
          <div key={i} className="flex-1">
            <div className="text-[10px] font-bold text-zinc-500">{item.label}</div>
            <div className={`text-3xl font-bold ${item.color}`}>{item.val}</div>
          </div>
        ))}
      </div>
      
      <div className="mb-6 flex gap-2">
        <Input placeholder="Search branch..." className="max-w-xs bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setNewTrip(initialTripState); }}>+ New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Edit Ticket" : "Add New Trip Ticket"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Branch Name" value={newTrip.branch} onChange={(e) => setNewTrip({...newTrip, branch: e.target.value})} />
              <div className="flex gap-2">
                <Input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} />
                <Input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} />
              </div>
              <select className="w-full p-2 border rounded-md" value={newTrip.auditor} onChange={(e) => setNewTrip({...newTrip, auditor: e.target.value})}>
                {["MARC", "JULE", "JAYSON", "MARC/JULE", "MARC/JAYSON"].map(val => <option key={val} value={val}>{val}</option>)}
              </select>
              <select className="w-full p-2 border rounded-md" value={newTrip.status} onChange={(e) => setNewTrip({...newTrip, status: e.target.value})}>
                <option value="Complete">Complete Staff</option>
                <option value="Incomplete">Incomplete</option>
              </select>
              {/* Laging 5 slots ang ipapakita */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" checked={newTrip.staff[i]?.isPresent ?? true} onChange={(e) => {
                    const s = [...newTrip.staff];
                    s[i] = { name: s[i]?.name || "", isPresent: e.target.checked };
                    setNewTrip({...newTrip, staff: s});
                  }} />
                  <Input placeholder={`Staff ${i + 1}`} value={newTrip.staff[i]?.name || ""} onChange={(e) => {
                    const s = [...newTrip.staff];
                    s[i] = { name: e.target.value, isPresent: s[i]?.isPresent ?? true };
                    setNewTrip({...newTrip, staff: s});
                  }} />
                </div>
              ))}
              <Button onClick={saveTrip}>{editingId ? "Update Ticket" : "Save Ticket"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead>Branch</TableHead><TableHead>Auditor</TableHead><TableHead>Date Range</TableHead><TableHead>Status</TableHead><TableHead>Staff</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.filter(t => t.branch.toLowerCase().includes(searchQuery.toLowerCase())).map((trip) => (
              <TableRow key={trip.id} className="border-none hover:bg-zinc-100">
                <TableCell className="font-medium">{trip.branch}</TableCell>
                <TableCell>{trip.auditor}</TableCell>
                <TableCell className="text-sm">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</TableCell>
                <TableCell>
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", trip.status === "Complete" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {trip.status === "Complete" ? "COMPLETE" : "INCOMPLETE"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {trip.staff.filter(m => m.name.trim() !== "").map((member, i) => (
                      <span key={i} className={cn("px-2 py-1 rounded text-[10px] font-bold text-white", member.isPresent ? "bg-blue-500" : "bg-red-500")}>{member.name}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right flex gap-2 justify-end">
                  <Button variant="ghost" className="text-blue-500 h-8" onClick={() => { 
                    setNewTrip(trip); 
                    setEditingId(trip.id); 
                    setIsDialogOpen(true); 
                  }}>Edit</Button>
                  <Button variant="ghost" className="text-red-500 h-8" onClick={() => deleteTrip(trip.id)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}