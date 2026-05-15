"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ImageUploadButton from "./ImageUploadButton";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-grid-fade">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex-1">
        <div className="mx-auto max-w-[1500px] flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 min-w-0 px-3 md:px-6 py-6">{children}</main>
        </div>
      </div>
      <Footer />
      <ImageUploadButton />
    </div>
  );
}
