"use client";

import { useState } from "react";

export default function SummarySales() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  const handleSave = () => {
    const gas = parseFloat(formData.gas || 0);
    const print = parseFloat(formData.print || 0);
    const bfast = parseFloat(formData.bfast || 0);
    const lunch = parseFloat(formData.lunch || 0);
    const dinner = parseFloat(formData.dinner || 0);
    const parking = parseFloat(formData.parking || 0);

    const subTotal = gas + print + bfast + lunch + dinner + parking;

    setEntries([...entries, { ...formData, subTotal }]);
    setFormData({});
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <div className="mb-8 p-4 text-center">
        <h1 className="text-xl font-bold text-blue-900 uppercase">
          SUMMARY OF TRAVEL AND FOOD ALLOWANCE
        </h1>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-900 text-white px-6 py-2 rounded mb-6 font-bold hover:bg-blue-800"
      >
        + ADD ENTRY
      </button>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              {["DATE", "AREA", "PURPOSE", "FROM", "TO", "MODE", "PARTICULARS", "COMPANY", "TIN", "GAS", "PRINT", "BFAST", "LUNCH", "DINNER", "PARKING", "SUB TOTAL", "REMARKS", "ACTION"].map((h) => (
                <th key={h} className="p-3 text-[10px] uppercase font-bold text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 text-[10px]">{entry.date ? new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ""}</td>
                <td className="p-2 text-[10px]">{entry.area}</td>
                <td className="p-2 text-[10px]">{entry.purpose}</td>
                <td className="p-2 text-[10px]">{entry.from}</td>
                <td className="p-2 text-[10px]">{entry.to}</td>
                <td className="p-2 text-[10px]">{entry.mode}</td>
                <td className="p-2 text-[10px]">{entry.particulars}</td>
                <td className="p-2 text-[10px]"></td>
                <td className="p-2 text-[10px]"></td>
                <td className="p-2 text-[10px]">{entry.gas}</td>
                <td className="p-2 text-[10px]">{entry.print}</td>
                <td className="p-2 text-[10px]">{entry.bfast}</td>
                <td className="p-2 text-[10px]">{entry.lunch}</td>
                <td className="p-2 text-[10px]">{entry.dinner}</td>
                <td className="p-2 text-[10px]">{entry.parking}</td>
                <td className="p-2 text-[10px] font-bold">{entry.subTotal}</td>
                <td className="p-2 text-[10px]">{entry.remarks}</td>
                <td className="p-2 text-[10px]">
                  <button 
  onClick={() => handleDelete(index)}
  style={{ color: 'red', fontWeight: 'bold' }}
>
  X
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[95vh] min-h-[600px] text-black">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="font-bold text-lg uppercase text-black">Log Travel Data</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl font-bold hover:text-red-600 transition">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col"><label className="text-xs font-bold text-black">Date</label><input type="date" onChange={(e) => setFormData({...formData, date: e.target.value})} className="border p-2 rounded text-black" /></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-black">Area</label><input onChange={(e) => setFormData({...formData, area: e.target.value})} className="border p-2 rounded text-black" /></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-black">Purpose</label><input onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="border p-2 rounded text-black" /></div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-black">Mode of Transpo</label>
                  <select onChange={(e) => setFormData({...formData, mode: e.target.value})} className="border p-2 rounded text-black">
                    <option>-- SELECT MODE --</option>
                    <option>MOTORCYCLE</option><option>TAXI</option><option>BUS</option><option>TRIKE</option><option>VAN</option>
                  </select>
                </div>
                <div className="flex flex-col"><label className="text-xs font-bold text-black">From</label><input onChange={(e) => setFormData({...formData, from: e.target.value})} className="border p-2 rounded text-black" /></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-black">To</label><input onChange={(e) => setFormData({...formData, to: e.target.value})} className="border p-2 rounded text-black" /></div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-black">Particulars</label>
                <select onChange={(e) => setFormData({...formData, particulars: e.target.value})} className="border p-2 rounded text-black">
                  <option>-- SELECT PARTICULARS --</option>
                  <option>FARE</option><option>MEAL</option><option>GAS</option><option>PARKING</option><option>PRINT OUT</option>
                </select>
              </div>

              <div className="border p-3 rounded bg-slate-50">
                <p className="text-xs font-bold mb-2 uppercase text-black">Expense Item Breakdown (PHP)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Transpo/Gas" onChange={(e) => setFormData({...formData, gas: e.target.value})} className="border p-1 rounded text-sm text-black" />
                  <input type="number" placeholder="Print Out" onChange={(e) => setFormData({...formData, print: e.target.value})} className="border p-1 rounded text-sm text-black" />
                  <input type="number" placeholder="Breakfast" onChange={(e) => setFormData({...formData, bfast: e.target.value})} className="border p-1 rounded text-sm text-black" />
                  <input type="number" placeholder="Lunch" onChange={(e) => setFormData({...formData, lunch: e.target.value})} className="border p-1 rounded text-sm text-black" />
                  <input type="number" placeholder="Dinner" onChange={(e) => setFormData({...formData, dinner: e.target.value})} className="border p-1 rounded text-sm text-black" />
                  <input type="number" placeholder="Parking" onChange={(e) => setFormData({...formData, parking: e.target.value})} className="border p-1 rounded text-sm text-black" />
                </div>
              </div>

              <div className="flex flex-col pb-2">
                <label className="text-xs font-bold text-black">Remarks / Shift Time</label>
                <input onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="border p-2 rounded text-black" placeholder="E.G., 08:30 - 19:30" />
              </div>
            </div>

            <div className="mt-4 shrink-0">
              <button onClick={handleSave} className="w-full bg-orange-500 text-white p-3 font-black rounded hover:bg-orange-600 uppercase transition">
                SAVE ENTRY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}