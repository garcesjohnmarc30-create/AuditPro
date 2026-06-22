"use client";

import { useState, ChangeEvent, FormEvent } from "react";

// 1. Interface definition para mawala ang "never" type errors
interface LogEntry {
  date: string;
  area: string;
  gas: number;
  parking: number;
  bfast: number;
  lunch: number;
  dinner: number;
  print: number;
}

export default function SummarySales() {
  // 2. Explicitly type ang useState
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [formData, setFormData] = useState<LogEntry>({
    date: "", area: "", gas: 0, parking: 0, bfast: 0, lunch: 0, dinner: 0, print: 0
  });

  // Computation
  const totalTranspo = logs.reduce((sum, item) => sum + Number(item.gas) + Number(item.parking), 0);
  const totalFood = logs.reduce((sum, item) => sum + Number(item.bfast) + Number(item.lunch) + Number(item.dinner), 0);
  const grandTotal = totalTranspo + totalFood + logs.reduce((sum, item) => sum + Number(item.print), 0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: ["gas", "parking", "bfast", "lunch", "dinner", "print"].includes(name) 
        ? parseFloat(value) || 0 
        : value 
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLogs([...logs, formData]);
    setFormData({ date: "", area: "", gas: 0, parking: 0, bfast: 0, lunch: 0, dinner: 0, print: 0 });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-sm font-black text-slate-700 bg-amber-400/20 px-3 py-1.5 rounded-md mb-4 uppercase tracking-wider">
        Log Travel Data
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="border p-2 rounded" required />
        <input name="area" type="text" placeholder="Area" value={formData.area} onChange={handleInputChange} className="border p-2 rounded" required />
        <input name="gas" type="number" placeholder="Gas" value={formData.gas} onChange={handleInputChange} className="border p-2 rounded" />
        <input name="parking" type="number" placeholder="Parking" value={formData.parking} onChange={handleInputChange} className="border p-2 rounded" />
        <button type="submit" className="col-span-2 bg-slate-900 text-white p-2 rounded font-bold hover:bg-slate-800">ADD ENTRY</button>
      </form>

      {/* Table Section */}
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="text-slate-500 border-b">
            <th className="p-2">Date</th>
            <th className="p-2">Area</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{item.date}</td>
              <td className="p-2">{item.area}</td>
              <td className="p-2">₱{(Number(item.gas) + Number(item.parking) + Number(item.bfast) + Number(item.lunch) + Number(item.dinner) + Number(item.print)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}