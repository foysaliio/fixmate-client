import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
	return (
		<input
			data-slot="input"
			className={cn(
				"h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive read-only:bg-muted/40 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}
