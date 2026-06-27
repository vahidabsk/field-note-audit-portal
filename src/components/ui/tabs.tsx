import * as React from "react";
import { cn } from "../../lib/utils";

const TabsContext = React.createContext<{ value: string; setValue: (v: string) => void } | null>(null);

export function Tabs({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) {
  return <TabsContext.Provider value={{ value, setValue: onValueChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-2 md:grid-cols-4", className)} {...props} />; }
export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value;
  return <button className={cn("rounded-md px-3 py-3 text-sm font-medium", active ? "bg-white text-primary shadow" : "text-slate-600 hover:text-slate-900")} onClick={() => ctx.setValue(value)}>{children}</button>;
}
export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className="mt-4">{children}</div>;
}
