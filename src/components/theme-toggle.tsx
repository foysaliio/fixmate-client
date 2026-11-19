"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme === "dark";
  const duration = reducedMotion ? 0 : 0.18;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Toggle theme"}
      className="size-11 rounded-full shadow-none motion-reduce:transition-none"
      render={<motion.button whileTap={reducedMotion ? undefined : { scale: 0.94 }} />}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span aria-hidden="true" className="relative size-[22px]">
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={dark ? "moon" : "sun"}
              initial={{ opacity: 0, rotate: reducedMotion ? 0 : -25 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: reducedMotion ? 0 : 25 }}
              transition={{ duration }}
              className="absolute inset-0 grid place-items-center"
            >
              {dark ? <Moon className="size-[22px]" /> : <Sun className="size-[22px]" />}
            </motion.span>
          </AnimatePresence>
        ) : (
          <>
            <Sun className="size-[22px] dark:hidden" />
            <Moon className="hidden size-[22px] dark:block" />
          </>
        )}
      </span>
    </Button>
  );
}
