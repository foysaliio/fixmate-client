"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useState, type PointerEvent } from "react";

const borderSides = ["top", "right", "bottom", "left"] as const;

export function useCardBorderHighlight(reducedMotion: boolean | null) {
  const [activeSide, setActiveSide] = useState<(typeof borderSides)[number] | null>(null);
  const lineX = useMotionValue(0);
  const lineY = useMotionValue(0);
  const smoothX = useSpring(lineX, { stiffness: 320, damping: 32 });
  const smoothY = useSpring(lineY, { stiffness: 320, damping: 32 });

  function moveHighlight(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - bounds.left, bounds.width));
    const y = Math.max(0, Math.min(event.clientY - bounds.top, bounds.height));
    const nearest = Math.min(x, bounds.width - x, y, bounds.height - y);

    lineX.set(Math.max(0, Math.min(x - 48, bounds.width - 96)));
    lineY.set(Math.max(0, Math.min(y - 48, bounds.height - 96)));

    if (nearest === x) {
      setActiveSide("left");
    } else if (nearest === bounds.width - x) {
      setActiveSide("right");
    } else if (nearest === y) {
      setActiveSide("top");
    } else {
      setActiveSide("bottom");
    }
  }

  return {
    onPointerEnter: moveHighlight,
    onPointerMove: moveHighlight,
    onPointerLeave: () => setActiveSide(null),
    borderHighlight: borderSides.map((side) => {
      const horizontal = side === "top" || side === "bottom";
      return (
        <motion.span
          key={side}
          aria-hidden="true"
          style={{
            position: "absolute",
            pointerEvents: "none",
            width: horizontal ? 96 : 2,
            height: horizontal ? 2 : 96,
            top: side === "top" ? -1 : horizontal ? undefined : 0,
            bottom: side === "bottom" ? -1 : undefined,
            left: side === "right" ? undefined : 0,
            right: side === "right" ? -1 : undefined,
            background: horizontal
              ? "linear-gradient(to right, transparent, var(--primary), transparent)"
              : "linear-gradient(to bottom, transparent, var(--primary), transparent)",
            x: horizontal ? (reducedMotion ? lineX : smoothX) : undefined,
            y: horizontal ? undefined : reducedMotion ? lineY : smoothY,
          }}
          initial={false}
          animate={{ opacity: activeSide === side ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        />
      );
    }),
  };
}
