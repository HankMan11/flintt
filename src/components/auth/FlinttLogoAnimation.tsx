
import React, { useEffect, useState } from "react";

/**
 * FlinttLogoAnimation shows a large "flintt" text
 * centered on the screen and animates it to the top position,
 * blending into the page logo above the auth card at the same size.
 */
export default function FlinttLogoAnimation({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [animate, setAnimate] = useState(false);
  const [hide, setHide] = useState(false);

  // Final position for logo (matches Auth page logo)
  // We'll use translateY to move the logo upward to about where
  // the card's logo sits, and scale down to the same size as the static logo.

  useEffect(() => {
    // Delay for some dramatic effect before animating
    const timer1 = setTimeout(() => setAnimate(true), 350);
    // After animation, fade out overlay and call onFinish
    const timer2 = setTimeout(() => {
      setHide(true);
      setTimeout(onFinish, 300);
    }, 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
    // eslint-disable-next-line
  }, []);

  // Define the final logo size/same as on Auth page above the card (e.g. 3rem)
  const FINAL_FONT_SIZE = "3rem";
  const INITIAL_FONT_SIZE = "7.5rem";

  // Logo animates from center, then moves up and scales down to FINAL_FONT_SIZE
  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#D6BCFA] via-[#E5DEFF] to-[#F2FCE2] dark:from-[#1A1F2C] dark:to-[#403E43] transition-opacity duration-300",
        hide ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
      style={{ transitionProperty: "opacity" }}
    >
      <span
        className={[
          "block font-extrabold font-sans",
          "text-[#9b87f5] dark:text-[#9b87f5]",
          "select-none user-select-none",
          "origin-top transition-all duration-1000 ease-in-out",
          animate
            // Move up so it exactly overlays the Auth page card logo, and scale to that size
            ? "scale-[0.4] translate-y-[-170px] md:translate-y-[-200px]"
            : "scale-100 translate-y-0",
        ].join(" ")}
        style={{
          fontSize: animate ? FINAL_FONT_SIZE : INITIAL_FONT_SIZE,
          letterSpacing: "0.03em",
          lineHeight: 1,
          textShadow:
            !animate
              ? "0 8px 36px #7E69AB80, 0 2px 8px #fff8"
              : "0 2px 8px #7E69AB70",
          transitionProperty: "transform, font-size, text-shadow",
        }}
      >
        flintt
      </span>
    </div>
  );
}

