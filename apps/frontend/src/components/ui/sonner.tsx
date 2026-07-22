"use client";

import { Toaster as Sonner } from "sonner";

// Minimal Toaster: the app is light-only (no theme toggle), so we skip the
// next-themes coupling that shadcn's default sonner ships with.
export function Toaster() {
  return <Sonner position="bottom-right" richColors />;
}
