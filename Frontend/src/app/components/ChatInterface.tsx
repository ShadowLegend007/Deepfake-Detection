import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Bot, Sparkles, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { SafetyMeter } from "./SafetyMeter";
import { PieChart } from "./PieChart";
import { MagicInput } from "./MagicInput";

interface ChatInterfaceProps {
    input: string;
    data: any;
    onAnalyze: (text: string) => void;
}

export function ChatInterface({ input, data, onAnalyze }: ChatInterfaceProps) {
    const [step, setStep] = useState<"buffer" | "result">("buffer");

    useEffect(() => {
        setStep("buffer");
        const timer = setTimeout(() => {
            setStep("result");
        }, 2000);
        return () => clearTimeout(timer);
    }, [data, input]);

    return (
        <div className="w-full max-w-5xl mx-auto min-h-[80vh] flex flex-col p-4 gap-6 pb-40">
            {/* User Message */}
            <div className="flex justify-end mb-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-muted/30 backdrop-blur-md px-6 py-3 rounded-[24px] rounded-tr-sm border border-border/50 max-w-[80%]"
                >
                    <p className="text-lg text-foreground">{input}</p>
                </motion.div>
            </div>

            {/* AI Buffer */}
            <AnimatePresence mode="wait">
                {step === "buffer" && (
                    <motion.div
                        key="buffer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 self-start"
                    >
                        <div className="p-2 border border-accent/20 rounded-full bg-accent/5 animate-pulse">
                            <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-muted-foreground animate-pulse text-lg">Thinking...</span>
                    </motion.div>
                )}

                {/* AI Result */}
                {step === "result" && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-8"
                    >
                        {/* Header Section: Product & Insight */}
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h2 className="text-4xl md:text-5xl font-bold gradient-text">{data.productName}</h2>
                                <span className={`self-start md:self-center px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${data.confidence === 'high' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                    data.confidence === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}>
                                    {data.confidence === 'high' && <CheckCircle className="w-4 h-4" />}
                                    {data.confidence.toUpperCase()} CONFIDENCE
                                </span>
                            </div>
                            <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed">
                                {data.mainInsight}
                            </p>
                        </div>

                        {/* Reasoning Block - Full Width for Balance */}
                        <div className="bg-card/50 border border-border/50 p-6 md:p-8 rounded-[32px] hover:bg-card/80 transition-colors shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-accent font-bold uppercase tracking-wider text-sm">
                                <Sparkles className="w-4 h-4" /> AI Analysis
                            </div>
                            <p className="text-lg text-muted-foreground leading-loose">
                                {data.reasoning}
                            </p>
                        </div>

                        {/* Balanced Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Col 1: Safety & Allergens & Age */}
                            <div className="space-y-6">
                                <div className="bg-card/30 border border-border/40 p-6 rounded-[28px] h-full flex flex-col justify-center">
                                    <h3 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-wider text-center">Safety Score</h3>
                                    <div className="flex justify-center transform scale-110">
                                        <SafetyMeter safetyScore={data.safetyScore} size="large" />
                                    </div>
                                </div>

                                {data.allergens && data.allergens.length > 0 && (
                                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-[28px]">
                                        <div className="flex items-center gap-2 mb-3 text-red-400 font-bold uppercase tracking-wider text-sm">
                                            <AlertTriangle className="w-4 h-4" /> Allergens Detected
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.allergens.map((allergen: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium border border-red-500/10">
                                                    {allergen}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Age Recommendations */}
                                <div className="bg-card/20 border border-border/30 p-6 md:p-8 rounded-[32px]">
                                    <h3 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-wider">Age Suitability</h3>
                                    <div className="flex flex-col gap-4">
                                        {data.ageRecommendations?.map((rec: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-1 p-3 rounded-2xl bg-background/40 border border-border/50 text-center hover:bg-background/60 transition-colors">
                                                <span className="font-bold text-foreground">{rec.group}</span>
                                                <span className={`text-sm font-medium ${rec.color}`}>{rec.advice}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Col 2: Nutrition & Pros/Cons */}
                            <div className="space-y-6">
                                <div className="bg-card/30 border border-border/40 p-6 rounded-[28px]">
                                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Nutritional Split</h3>
                                    <PieChart data={data.ingredientBreakdown} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[24px]">
                                        <div className="mb-3 text-emerald-500 font-bold text-sm uppercase flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Pros
                                        </div>
                                        <ul className="space-y-2">
                                            {data.pros?.slice(0, 3).map((p: string, i: number) => (
                                                <li key={i} className="text-sm text-muted-foreground leading-snug">• {p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-[24px]">
                                        <div className="mb-3 text-red-400 font-bold text-sm uppercase flex items-center gap-2">
                                            <XCircle className="w-4 h-4" /> Cons
                                        </div>
                                        <ul className="space-y-2">
                                            {data.cons?.slice(0, 3).map((c: string, i: number) => (
                                                <li key={i} className="text-sm text-muted-foreground leading-snug">• {c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Floating Input */}
            <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
                <div className="max-w-3xl mx-auto shadow-2xl backdrop-blur-xl bg-background/80 rounded-[32px] border border-border/50 p-1.5 transition-all duration-300 hover:shadow-accent/10 hover:border-accent/20">
                    <MagicInput onAnalyze={onAnalyze} />
                </div>
            </div>
        </div >
    );
}
