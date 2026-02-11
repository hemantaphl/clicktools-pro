import { ReactNode, useEffect } from "react";

import { useLocation } from "react-router-dom";

import { Navbar } from "./Navbar";

import { BottomNav } from "./BottomNav";

import { PullToRefresh } from "@/components/common/PullToRefresh";

import { useBackButton } from "@/hooks/useBackButton";



// ✅ UPDATED: Added user to props interface

interface AppShellProps {

  children: ReactNode;

  user: any;

}



export function AppShell({ children, user }: AppShellProps) {

  const location = useLocation();

 

  // Handle Android back button

  useBackButton();



  // Scroll to top on route change

  useEffect(() => {

    window.scrollTo(0, 0);

  }, [location.pathname]);



  return (

    <div className="bg-background min-h-screen flex justify-center">

      <PullToRefresh />

      <div className="app-container flex flex-col min-h-screen">

        {/* ✅ UPDATED: Pass user to Navbar */}

        <Navbar user={user} />

       

        <main className="flex-1 pb-bottom-nav pt-navbar">

          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}