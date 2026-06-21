"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react"; // Import ito para sa icon (install via 'npm install lucide-react')

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    name: "JOHN MARC GARCES",
    email: "Inventory3@hassarams.com",
    mobile: "09276662267",
    location: "Philippines",
    avatarUrl: ""
  });

  // Load data mula sa localStorage pag-load ng page
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("Profile saved successfully!");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile({ ...profile, avatarUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="p-8 bg-zinc-50 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-lg mb-6">
        <Button variant="ghost" onClick={() => router.back()}>← Back to Tickets</Button>
      </div>

      <Card className="w-full max-w-lg shadow-md border-0">
        <CardHeader className="flex flex-col items-center pb-2 bg-white rounded-t-xl pt-8 relative">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="h-28 w-28 mb-4 border-4 border-zinc-100">
              <AvatarImage src={profile.avatarUrl || "/profile.jpg"} />
              <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-600">JG</AvatarFallback>
            </Avatar>
            {/* Overlay icon para sa pag-upload */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white h-8 w-8" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          
          <h2 className="text-2xl font-bold text-zinc-900">{profile.name}</h2>
          <p className="text-sm text-zinc-500">{profile.email}</p>
        </CardHeader>
        
        <CardContent className="grid gap-5 pt-6 bg-white rounded-b-xl pb-8">
          {[
            { label: "Name", key: "name" },
            { label: "Email Account", key: "email" },
            { label: "Mobile Number", key: "mobile" },
            { label: "Location", key: "location" },
          ].map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{field.label}</label>
              <Input 
                className="bg-zinc-50" 
                value={profile[field.key as keyof typeof profile]} 
                onChange={(e) => setProfile({...profile, [field.key]: e.target.value})} 
              />
            </div>
          ))}

          <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 mt-2 font-bold">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}