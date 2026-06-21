"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo, useRef } from "react"; // 1. Dagdag: useRef
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
  auditor: string;
  status: "Complete" | "Lack";
}

export default function TripTicketsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // 2. Dagdag: State para sa search
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({}); // 3. Dagdag: Refs para sa scroll
  
  const [newTrip, setNewTrip] = useState({ 
    branch: "", startDate: "", endDate: "", auditor: "MARC",
    staff: Array(4).fill({ name: "", isPresent: true }),
    status: "Complete" as "Complete" | "Lack" 
  });

  // 4. Dagdag: Logic para sa Search at Auto-scroll
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const foundTrip = trips.find(t => t.branch.toLowerCase() === value.toLowerCase());
    if (foundTrip && rowRefs.current[foundTrip.id]) {
      rowRefs.current[foundTrip.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    const q = query(collection(db, "trips"), orderBy("startDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Trip[];
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
        auditor: newTrip.auditor,
        staff: newTrip.staff.filter(s => s.name.trim() !== ""),
        status: newTrip.status
      });
      setNewTrip({ branch: "", startDate: "", endDate: "", auditor: "MARC", staff: Array(4).fill({ name: "", isPresent: true }), status: "Complete" });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteTrip = async (id: string) => {
    await deleteDoc(doc(db, "trips", id));
  };

  return (
    <div className="p-8 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Trip Tickets Overview</h1>
      
      <div className="flex gap-4 mb-6">
        {[{l: "Branches", v: stats.totalBranches, c: "text-green-600"}, {l: "Present", v: stats.present, c: "text-blue-500"}, {l: "Absent", v: stats.absent, c: "text-red-500"}].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border shadow-sm w-48">
            <p className="text-xs text-zinc-500 font-bold uppercase">{s.l}</p>
            <p className={`text-3xl font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* 5. Dito inilagay ang Search Bar sa tabi ng button */}
      <div className="mb-6 flex gap-2">
        <Input 
          placeholder="Search branch..." 
          className="max-w-xs" 
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)} 
        />
        <Dialog>
          <DialogTrigger asChild><Button>+ New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Trip Ticket</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Branch Name" value={newTrip.branch} onChange={(e) => setNewTrip({...newTrip, branch: e.target.value})} />
              <div className="flex gap-2">
                <Input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} />
                <Input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} />
              </div>
              <select className="w-full p-2 border rounded-md" value={newTrip.auditor} onChange={(e) => setNewTrip({...newTrip, auditor: e.target.value})}>
                <option value="MARC">MARC</option>
                <option value="JULE">JULE</option>
                <option value="JAYSON">JAYSON</option>
              </select>
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
              <TableHead>Auditor</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 6. Filter logic dito */}
            {trips.filter(t => t.branch.toLowerCase().includes(searchQuery.toLowerCase())).map((trip) => (
              <TableRow 
                key={trip.id} 
                ref={(el) => { rowRefs.current[trip.id] = el; }} // Nilagyan ng ref
              >
                <TableCell className="font-medium">{trip.branch}</TableCell>
                <TableCell className="font-semibold text-zinc-600">{trip.auditor || "N/A"}</TableCell>
                <TableCell className="text-zinc-500 text-sm">{trip.startDate} - {trip.endDate}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {trip.staff.map((member, i) => (
                      <span key={i} className={cn("px-2 py-1 rounded text-[10px] font-bold text-white", member.isPresent ? "bg-blue-400" : "bg-red-500")}>
                        {member.name}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right"><Button variant="ghost" className="text-red-500" onClick={() => deleteTrip(trip.id)}>Remove</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}