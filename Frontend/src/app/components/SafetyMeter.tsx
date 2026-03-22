import { motion } from "motion/react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface SafetyMeterProps {
  safetyScore: number; // 0-100
  label?: string;
  size?: "small" | "medium" | "large";
}

export function SafetyMeter({ safetyScore, label = "Safety Score", size = "medium" }: SafetyMeterProps) {
  // Determine color based on score
  const getColor = () => {
    if (safetyScore >= 70) return {
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      glow: "shadow-emerald-500/20",
      icon: CheckCircle
    };
    if (safetyScore >= 40) return {
      bg: "bg-yellow-500",
      text: "text-yellow-500",
      glow: "shadow-yellow-500/20",
      icon: AlertTriangle
    };
    return {
      bg: "bg-red-500",
      text: "text-red-500",
      glow: "shadow-red-500/20",
      icon: XCircle
    };
  };

  const getStatus = () => {
    if (safetyScore >= 70) return "Safe to Use";
    if (safetyScore >= 40) return "Use with Caution";
    return "Not Recommended";
  };

  const color = getColor();
  const Icon = color.icon;
  const isSmall = size === "small";

  return (
    <div className={`w-full ${isSmall ? 'scale-90 origin-top-left' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {!isSmall && <Icon className={`w-5 h-5 ${color.text}`} />}
          <span className={`text-sm text-muted-foreground ${isSmall ? 'hidden' : ''}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${isSmall ? 'text-lg' : 'text-2xl'} ${color.text} flex items-center font-bold`}>
            {Math.round(safetyScore)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`relative ${isSmall ? 'h-2' : 'h-3'} bg-secondary dark:bg-secondary rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safetyScore}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color.bg} rounded-full ${color.glow} shadow-lg`}
        />
      </div>

      {/* Status label */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{getStatus()}</span>

        {/* Scale markers */}
        <div className="flex gap-1 text-xs text-muted-foreground">
          <span className="text-red-500">0</span>
          <span>·</span>
          <span className="text-yellow-500">50</span>
          <span>·</span>
          <span className="text-emerald-500">100</span>
        </div>
      </div>
    </div>
  );
}
