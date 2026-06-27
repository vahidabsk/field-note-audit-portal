import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "accent" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "default", size = "md", ...props }, ref) {
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-reserve text-primary hover:bg-reserve/80",
    outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
    accent: "bg-accent text-white hover:bg-accent/90",
    destructive: "bg-red-700 text-white hover:bg-red-800",
  }[variant];
  const sizes = {
    sm: "h-10 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
    icon: "h-11 w-11",
  }[size];
  return <button ref={ref} className={cn("inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:pointer-events-none", variants, sizes, className)} {...props} />;
});
