"use client";

import Splash from "./Splash";
import { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Splash />
      {children}
    </>
  );
}
