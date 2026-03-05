import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Start fade-out at 1700ms so the transition completes around 2000ms
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1700);

    // Call onDone after 2000ms total
    const doneTimer = setTimeout(() => {
      onDone();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      data-ocid="splash.panel"
      className={
        fadingOut ? "animate-[splashFadeOut_0.3s_ease-out_forwards]" : ""
      }
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        colorScheme: "light",
      }}
    >
      {/* Main content group - logo, title, tagline */}
      <div
        className="animate-[fadeInUp_0.5s_ease-out_forwards]"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          opacity: 0,
          padding: "0 1.5rem",
        }}
      >
        {/* Logo */}
        <img
          src="/assets/uploads/Screenshot_2026-03-05-21-53-01-57_92460851df6f172a4592fca41cc2d2e6-1.jpg"
          alt="Question Paper Maker Logo"
          style={{
            width: "clamp(140px, 45vw, 220px)",
            height: "auto",
            objectFit: "contain",
            borderRadius: "1rem",
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: 700,
            color: "#1a237e",
            fontSize: "clamp(1.5rem, 6vw, 2.25rem)",
            letterSpacing: "-0.02em",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Question Paper Maker
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontWeight: 400,
            color: "#37474f",
            fontSize: "clamp(0.875rem, 3vw, 1.0625rem)",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: "320px",
          }}
        >
          Transforming Ideas into Perfect Question Papers.
        </p>
      </div>

      {/* Footer loading text */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* Animated dots loader */}
        <div
          style={{
            display: "flex",
            gap: "0.375rem",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#7c3aed",
                display: "inline-block",
                animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#7c8db0",
            margin: 0,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}
          className="animate-pulse"
        >
          Generating Intelligence...
        </p>
      </div>
    </div>
  );
}
