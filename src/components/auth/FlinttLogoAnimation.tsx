
import React, { useEffect, useRef, useState } from "react";

/**
 * FlinttLogoAnimation shows a large "flintt" text
 * centered on the screen and animates it to the top position.
 * After animation, it calls onFinish to reveal the auth form.
 */
export default function FlinttLogoAnimation({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [animate, setAnimate] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Start the animation right after mount
    // Give a short delay for dramatic effect
    const timer1 = setTimeout(() => setAnimate(true), 350);
    // After animation duration, hide the overlay
    const timer2 = setTimeout(() => {
      setHide(true);
      // Notify parent to render the content
      setTimeout(onFinish, 200); // Slight delay for fade out
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#D6BCFA] via-[#E5DEFF] to-[#F2FCE2] dark:from-[#1A1F2C] dark:to-[#403E43] transition-opacity duration-200",
        hide ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
      style={{ transitionProperty: "opacity" }}
    >
      {/* Animated logo */}
      <span
        className={[
          "block font-extrabold font-sans",
          "text-[#9b87f5] dark:text-[#9b87f5]",
          "select-none user-select-none",
          "origin-center transition-all duration-1000 ease-in-out",
          animate
            ? "scale-[0.22] translate-y-[-156px] md:translate-y-[-196px]"
            : "scale-100 translate-y-0",
        ].join(" ")}
        style={{
          fontSize: animate ? "4rem" : "9rem",
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
