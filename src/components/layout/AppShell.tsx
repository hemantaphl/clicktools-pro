import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-background min-h-screen flex justify-center">
      <div className="app-container flex flex-col">
        <Navbar />
        <main className="flex-1 pb-20 pt-14">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
