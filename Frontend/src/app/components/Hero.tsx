import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedButton } from "./AnimatedButton";
import SplitText from "./SplitText";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const handleAnimationComplete = () => {
    // Optional callback
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="container px-4 mx-auto text-center relative z-10 flex flex-col items-center">

        <div className="mb-6 flex justify-center w-full">
          <SplitText
            text="Welcome to NeuraGlance"
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground drop-shadow-[0_0_15px_rgba(124,58,237,0.5)] pb-4 tracking-tighter"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </div>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-10 leading-relaxed animate-fade-in delay-100">
          An AI-native co-pilot that reads labels so you don't have to.{" "}
          <span className="text-foreground font-medium">No forms, just insight.</span>
        </p>

        <div className="mt-8">
          <AnimatedButton onClick={onGetStarted} icon={ArrowRight}>
            Try the Co-Pilot
          </AnimatedButton>
        </div>
      </div>

    </section>
  );
}