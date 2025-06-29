import * as React from "react"
import { cn } from "../lib/utils.js"

function Heading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="heading"
      className={cn(
        "flex flex-col mb-5 gap-1",
        className
      )}
      {...props}
    />
  )
}

function HeadingTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h2
      data-slot="heading-title"
      className={cn("text-3xl leading-none font-semibold", className)}
      {...props}
    />
  )
}

function HeadingDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="heading-description"
      className={cn("text-muted-foreground text-md", className)}
      {...props}
    />
  )
}

export {
  Heading,
  HeadingTitle,
  HeadingDescription,
}