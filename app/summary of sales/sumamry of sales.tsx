"use client";

import { useState, ChangeEvent, FormEvent } from "react";

// 1. Dito natin dinedefine ang shape ng ating data
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
  // 2. Ginagamit natin ang interface para malaman ng TS kung ano ang laman ng logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [formData, setFormData] = useState<LogEntry>({
    date: "", area: "", gas: 0, parking: 0, bfast: 0, lunch: 0, dinner: 0, print: 0
  });

  // Logic para sa pag-compute ng totals
  const totalTranspo = logs.reduce((sum, item) => sum + (Number(item.gas) || 0) + (Number(item.parking) || 0), 0);
  const totalFood = logs.reduce((sum, item) => sum + (Number(item.bfast) || 0) + (Number(item.lunch) || 0) + (Number(item.dinner) || 0), 0);
  const grandTotal = totalTranspo + totalFood + logs.reduce((sum, item) => sum + (Number(item.print) || 0), 0);

  // 3. Inayos ang handler para sa tamang type safety
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumberField = ["gas", "parking", "bfast", "lunch", "dinner", "print"].includes(name);
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: isNumberField ? parseFloat(value) || 0 : value 
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
      
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="border p-2 rounded" required />
        <input name="area" type="text" placeholder="Area" value={formData.area} onChange={handleInputChange} className="border p-2 rounded" required />
        <input name="gas" type="number" placeholder="Gas" value={formData.gas} onChange={handleInputChange} className="border p-2 rounded" />
        <input name="parking" type="number" placeholder="Parking" value={formData.parking} onChange={handleInputChange} className="border p-2 rounded" />
        <button type="submit" className="col-span-2 bg-slate-900 text-white p-2 rounded font-bold hover:bg-slate-800">ADD ENTRY</button>
      </form>
      
      {/* Table Section */}
      <div className="mt-6">
        <h2 className="text-sm font-black uppercase tracking-wide mb-3">Live Log Matrix Table</h2>
        <div className="overflow-x-auto">
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
                <tr key={index} className="border-b hover:bg-slate-50">
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.area}</td>
                  <td className="p-2">₱{(Number(item.gas) + Number(item.parking) + Number(item.bfast) + Number(item.lunch) + Number(item.dinner) + Number(item.print)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-4 bg-slate-900 text-white rounded-lg p-4 grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold">Logged Rows</p>
          <p className="text-xl font-black text-amber-400">{logs.length}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold">Total Transpo</p>
          <p className="text-xl font-black">₱{totalTranspo.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold">Total Food</p>
          <p className="text-xl font-black text-emerald-400">₱{totalFood.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-slate-400 font-bold">Grand Total</p>
          <p className="text-xl font-black text-amber-400">₱{grandTotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}