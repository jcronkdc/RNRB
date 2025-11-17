"use client";

import { MotionConfig } from "framer-motion";
import React, { useEffect, useState, type PropsWithChildren } from "react";

export function MotionProvider({ children }: PropsWithChildren) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShouldReduceMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
      <React.Fragment>{children}</React.Fragment>
    </MotionConfig>
  );
}
