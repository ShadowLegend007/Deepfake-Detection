import { motion } from "motion/react";
import { AlertTriangle, Shield } from "lucide-react";
import { SourceButton } from "./SourceButton";

interface DataSourceAttributionProps {
    dataSource: string;
    confidenceLevel: string;
    sourceUrl?: string;
}

export function DataSourceAttribution({ dataSource, confidenceLevel, sourceUrl }: DataSourceAttributionProps) {
    const getConfidenceColor = (level: string) => {
        // --- FIX START: Add safety check ---
        if (!level) return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        // --- FIX END ---

        switch (level.toLowerCase()) {
            case "high":
                return "text-green-500 bg-green-500/10 border-green-500/20";
            case "medium":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "low":
                return "text-red-500 bg-red-500/10 border-red-500/20";
            default:
                return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-[24px] p-5 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
        >
            <h3 className="text-3xl font-bold text-accent mb-6 cool-font flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Data Source & Attribution
            </h3>

            <div className="space-y-3">
                {/* Data Source */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Source</div>
                        {/* Add fallback for dataSource as well just in case */}
                        <div className="text-base font-bold text-foreground">{dataSource || "Unknown Source"}</div>
                    </div>
                    <SourceButton url={sourceUrl} sourceName={dataSource} label="View Source" />
                </div>

                {/* Confidence Level */}
                <div>
                    <div className="text-xs text-muted-foreground mb-1">Data Confidence</div>
                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-xs uppercase ${getConfidenceColor(
                            confidenceLevel
                        )}`}
                    >
                        {/* Fallback text if confidenceLevel is missing */}
                        {confidenceLevel || "N/A"}
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[16px] p-3 mt-2">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-bold text-yellow-500">Medical Disclaimer:</span> This data is
                            AI-analyzed and provided for informational purposes only. For medical advice, dietary
                            recommendations, or health concerns, please consult with a qualified healthcare
                            professional or registered dietitian.
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}