import { motion } from "motion/react";
import { ShieldCheck, ShieldAlert, BadgeCheck, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface BentoAnalysisProps {
    data: any;
}

export function BentoAnalysis({ data }: BentoAnalysisProps) {
    if (!data) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Moderate";
        return "Poor";
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

                {/* 1. Safety Score - Large Square */}
                <motion.div
                    className="col-span-1 md:col-span-1 row-span-1 glass-card rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Safety Score</h3>
                    <div className={`text-6xl font-bold ${getScoreColor(data.safetyScore)}`}>
                        {data.safetyScore}
                    </div>
                    <p className="text-sm mt-2 text-muted-foreground">{getScoreLabel(data.safetyScore)} Safety Profile</p>
                </motion.div>

                {/* 2. Main Insight - Wide Rectangle */}
                <motion.div
                    className="col-span-1 md:col-span-2 row-span-1 glass-card rounded-3xl p-6 flex flex-col justify-center border-l-4 border-l-primary relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                    <div className="flex items-start gap-3 relative z-10">
                        <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">AI Insight</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {data.mainInsight}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Ingredient Breakdown - Square Chart */}
                <motion.div
                    className="col-span-1 md:col-span-1 row-span-2 glass-card rounded-3xl p-4 flex flex-col items-center justify-center relative"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 w-full text-left pl-2">Composition</h3>
                    <div className="w-full h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.ingredientBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.ingredientBreakdown.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '12px',
                                        padding: '8px 12px',
                                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                                    }}
                                    itemStyle={{ color: 'var(--foreground)', fontSize: '14px', fontWeight: '500' }}
                                    labelStyle={{ color: 'var(--muted-foreground)', fontSize: '13px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {data.ingredientBreakdown.slice(0, 3).map((item: any) => (
                            <div key={item.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                {item.name}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 4. Allergens & Concerns - Tall or Square */}
                <motion.div
                    className="col-span-1 md:col-span-1 row-span-1 glass-card rounded-3xl p-6 relative overflow-hidden bg-red-500/5 hover:bg-red-500/10 transition-colors"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 mb-4 text-red-400">
                        <AlertTriangle size={20} />
                        <h3 className="font-bold">Allergens</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.allergens.length > 0 ? (
                            data.allergens.map((allergen: string) => (
                                <span key={allergen} className="px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-xs font-medium border border-red-500/20">
                                    {allergen}
                                </span>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-sm">None detected</span>
                        )}
                    </div>
                </motion.div>

                {/* 5. Pros - Wide */}
                <motion.div
                    className="col-span-1 md:col-span-2 row-span-1 glass-card rounded-3xl p-6 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h3 className="text-sm text-muted-foreground font-bold mb-3 uppercase tracking-wider">Positives</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.pros.map((pro: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                                <BadgeCheck className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-foreground/80">{pro}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
