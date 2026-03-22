import React from "react";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { SafetyMeter } from "./SafetyMeter";
import { PieChart } from "./PieChart";
import { AllergenWarning } from "./AllergenWarning";
import { ProsConsSection } from "./ProsConsSection";
import { AgeRecommendations } from "./AgeRecommendations";
import { KeyTopicsBadges } from "./KeyTopicsBadges";

interface InsightCardProps {
  productName: string;
  confidence: "high" | "medium" | "low";
  mainInsight: string;
  reasoning: string;
  followUp?: string;
  safetyScore: number;
  ingredientBreakdown: Array<{ name: string; value: number; color?: string }>;
  allergens: string[];
  keyTopics: string[];
  pros: string[];
  cons: string[];
  ageRecommendations: Array<{
    ageGroup: string;
    recommendation: "safe" | "caution" | "avoid";
    note?: string;
  }>;
}

export function InsightCard({
  productName,
  confidence,
  mainInsight,
  reasoning,
  followUp,
  safetyScore,
  ingredientBreakdown,
  allergens,
  keyTopics,
  pros,
  cons,
  ageRecommendations,
}: InsightCardProps) {
  const confidenceConfig = {
    high: {
      color: "text-success",
      bg: "bg-success/10",
      icon: CheckCircle,
      label: "High Confidence",
    },
    medium: {
      color: "text-warning",
      bg: "bg-warning/10",
      icon: AlertCircle,
      label: "Uncertain",
    },
    low: {
      color: "text-destructive",
      bg: "bg-destructive/10",
      icon: AlertCircle,
      label: "Low Confidence",
    },
  };

  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto px-4 mt-8"
    >
      <div className="relative group">
        <div className="relative p-6 md:p-8 rounded-xl border border-border-glass glass-card glow-purple">
          {/* Header */}
          <motion.div
            className="flex items-start justify-between gap-4 mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">
                Analysis: <span className="gradient-text">{productName}</span>
              </h3>
            </div>

            {/* Confidence badge */}
            <motion.div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-pill ${config.bg} border border-${confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'destructive'}/20`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-border-glass mb-6" />

          {/* Key Topics */}
          {keyTopics && keyTopics.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <KeyTopicsBadges topics={keyTopics} />
            </motion.div>
          )}

          {/* Main insight */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <p className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              {mainInsight}
            </p>
          </motion.div>

          {/* Safety Meter */}
          <motion.div
            className="mb-6 p-5 rounded-lg glass-card border border-border-glass"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <SafetyMeter safetyScore={safetyScore} label="Overall Safety" />
          </motion.div>

          {/* Pie Chart */}
          {ingredientBreakdown && ingredientBreakdown.length > 0 && (
            <motion.div
              className="mb-6 p-5 rounded-lg glass-card border border-border-glass"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <PieChart data={ingredientBreakdown} title="Ingredient Breakdown" />
            </motion.div>
          )}

          {/* Allergen Warning */}
          {allergens && allergens.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <AllergenWarning allergens={allergens} />
            </motion.div>
          )}

          {/* Pros and Cons */}
          {pros && cons && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-4">Insights & Recommendations</h4>
              <ProsConsSection pros={pros} cons={cons} />
            </motion.div>
          )}

          {/* Age Recommendations */}
          {ageRecommendations && ageRecommendations.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <AgeRecommendations recommendations={ageRecommendations} />
            </motion.div>
          )}

          {/* Reasoning */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Why This Matters
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {reasoning}
            </p>
          </motion.div>

          {/* Follow-up prompt */}
          {followUp && (
            <>
              <div className="h-px bg-border-glass mb-6" />
              <motion.button
                className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors duration-200 group/button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                whileHover={{ x: 3 }}
              >
                <MessageSquare className="w-4 h-4 transition-transform duration-200" />
                <span className="text-sm">{followUp}</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}