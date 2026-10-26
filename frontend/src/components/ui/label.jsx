"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm font-bold leading-none text-slate-700 dark:text-slate-300 select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
        className
      )}
      {...props} />
  );
}

export { Label }
