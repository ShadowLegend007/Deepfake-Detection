import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import ClickSpark from './components/ClickSpark';
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { DrawLineText } from "./components/gsap/draw-line-text";
import { Home } from "./pages/Home";
import { Analysis } from "./pages/Analysis";
import { About } from "./pages/About";
import { Help } from "./pages/Help";
import LiquidEther from "./components/LiquidEther";
import SplashCursor from "./components/SplashCursor";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analysis />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      // Priority: 1. Local Storage, 2. System Preference, 3. Default Dark (as requested fallback)
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (savedTheme) return savedTheme;

      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return systemDark ? "dark" : "light";
    }
    return "dark";
  });

  // Detect theme changes & Initialize DOM
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    // Apply initial theme from state to DOM immediately if not set
    if (!document.documentElement.classList.contains("dark") && !document.documentElement.classList.contains("light")) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only react to system changes if no local preference is saved? 
      // Or should we always react? Usually system changes should update if user hasn't hard-locked.
      // But standard behavior with a toggle is: user override > system.
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
        if (e.matches) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  return (
    <BrowserRouter>
      <ClickSpark
        sparkCount={10}
        duration={500}
        extraScale={1.5}
        sparkColor={theme === "light" ? "#7c3aed" : "#ffffff"}
      >
        <AnimatePresence>
          {isLoading && (
            <>
              <motion.div
                key="loading-bg"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`fixed inset-0 z-[100] ${theme === "light" ? "bg-white" : "bg-black"}`}
              />
              <motion.div
                key="loading-text"
                className="fixed inset-0 z-[101] flex items-center justify-center"
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  y: -100,
                  scale: 0.5,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }}
              >
                <DrawLineText
                  text="DeepTrust"
                  fontSize={80}
                  strokeWidth={1.5}
                  color="#7c3aed"
                  duration={2.0}
                  oneByOne={false}
                  onComplete={() => {
                    setTimeout(() => setIsLoading(false), 200);
                  }}
                  className="font-medium"
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {!isLoading && (
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden">
            {/* Global Animated Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              {theme === "dark" ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                  />
                </div>
              ) : (
                <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
                  <SplashCursor
                    SIM_RESOLUTION={128}
                    DYE_RESOLUTION={1440}
                    DENSITY_DISSIPATION={3.5}
                    VELOCITY_DISSIPATION={2}
                    PRESSURE={0.1}
                    CURL={3}
                    SPLAT_RADIUS={0.2}
                    SPLAT_FORCE={6000}
                    COLOR_UPDATE_SPEED={10}
                  />
                </div>
              )}
            </div>

            <div className="relative z-10 w-full">
              {/* Navbar Navigation */}
              <Navbar />

              <div className="relative z-10 w-full">
                <AnimatedRoutes />
              </div>
            </div>
          </div>
        )}
      </ClickSpark>
    </BrowserRouter>
  );
}

export default App;