import type * as React from "react";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";
import { Separator } from "./separator.js";

function Heading({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="heading"
			className={cn(
				"@container/card-header grid auto-rows-min md:grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=heading-button]:md:grid-cols-[1fr_auto] mb-4",
				className,
			)}
			{...props}
		/>
	);
}

function HeadingTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<h2
			data-slot="heading-title"
			className={cn("text-3xl leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function HeadingDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<p
			data-slot="heading-description"
			className={cn("text-muted-foreground text-md", className)}
			{...props}
		/>
	);
}

function HeadingButton({
	className,
	asChild = false,
	...props
}: React.ComponentProps<typeof Button> & { asChild?: boolean }) {
	return (
		<Button
			data-slot="heading-button"
			className={cn(
				"md:col-start-2 md:row-span-2 md:row-start-1 self-center md:justify-self-end",
				className,
			)}
			asChild={asChild}
			{...props}
		/>
	);
}

function HeadingSeparator({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<Separator
			data-slot="heading-separator"
			className={cn("col-span-full", className)}
			{...props}
		/>
	);
}

export {
	Heading,
	HeadingTitle,
	HeadingDescription,
	HeadingButton,
	HeadingSeparator,
};
