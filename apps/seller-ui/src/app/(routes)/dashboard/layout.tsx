"use-client"

import SidebarWrapper from "apps/seller-ui/src/shared/components/sidebar/sidebar";
import React from "react";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-black min-h-screen">
      {/* Sidebar */}
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800 text-white p-4">
        <div className="sticky top-0">
          <SidebarWrapper/>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};
export default Layout