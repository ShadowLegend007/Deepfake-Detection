import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { LucideIcon } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function AnimatedButton({ icon: Icon, children, className = "", onClick, ...props }: AnimatedButtonProps) {
  // Cast props to any to avoid strict Motion/React event type conflicts
  const motionProps = props as any;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] rounded-full hover:bg-black/60 hover:border-white/20 hover:shadow-[0_8px_32px_-8px_rgba(124,58,237,0.3)] group ${className}`}
      {...motionProps}
    >
      {/* Background slide effect if desired, or just solid */}

      <span className="relative flex items-center gap-2">
        <span>{children}</span>
        {Icon && (
          <Icon className="w-5 h-5 transition-transform duration-300 transform group-hover:translate-x-1" />
        )}
      </span>
    </motion.button>
  );
}
