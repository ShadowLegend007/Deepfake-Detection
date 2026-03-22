import { Brain, FileText, Shield } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedButton } from "./AnimatedButton";

const features = [
  {
    icon: Brain,
    title: "Intent-First",
    subtitle: "Smart Design That Just Feels Right",
    description: "Infers what matters automatically. Our interface is fast, flexible, and easy to use.",
    color: "from-accent to-accent/50",
  },
  {
    icon: FileText,
    title: "Reasoning",
    subtitle: "Data-driven insights at your fingertips",
    description: "Translates chemistry to plain English. Identify patterns and themes with ease.",
    color: "from-secondary to-secondary/50",
  },
  {
    icon: Shield,
    title: "Privacy",
    subtitle: "Your Data Stays Yours",
    description: "Analyzes locally where possible. We turn feedback into insight, not surveillance.",
    color: "from-accent to-secondary",
  },
];

export function FeatureGrid() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
              className="relative group cursor-pointer"
            >
              <div className="relative p-6 rounded-xl border border-border bg-card hover:border-accent/50 transition-all duration-200 shadow-sm hover:shadow-md h-full">
                {/* Icon */}
                <div className="mb-5">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors duration-200">
                    <Icon className="w-6 h-6 text-accent" strokeWidth={2} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 font-semibold text-lg tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
                  {feature.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {feature.subtitle}
                </p>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}