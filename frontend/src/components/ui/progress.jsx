"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("relative flex h-2 w-full items-center overflow-hidden rounded-full bg-primary/20", className)}
      {...props}>
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="flex flex-1 h-full w-full bg-inherit">
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn("h-full bg-primary transition-all duration-300 rounded-full", indicatorClassName)} />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress }
