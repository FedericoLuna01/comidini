import * as React from "react"

import { cn } from "@repo/ui/lib/utils"
import { LucideLoaderCircle } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LucideLoaderCircle
      data-slot="loading-spinner"
      className={cn("size-5 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
