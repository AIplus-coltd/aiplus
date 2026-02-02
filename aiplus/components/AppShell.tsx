"use client";

import Splash from "./Splash";
import BottomNav from "./BottomNav";
import { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        fontFamily: "var(--font-geist-sans, sans-serif)",
        position: "relative",
        paddingBottom: 64,
      }}
    >
      <Splash />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 80px 0" }}>{children}</main>
      <BottomNav />
    </div>
  );
}
