import { motion } from "motion/react";
import { Sparkles, Brain } from "lucide-react";

export function LoadingAnalysis() {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[32px] p-12 text-center shadow-2xl"
            >
                {/* Animated Icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="inline-block mb-6"
                >
                    <div className="relative">
                        <Brain className="w-16 h-16 text-accent" />
                        <motion.div
                            animate={{
                                opacity: [0.5, 1, 0.5],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-6 h-6 text-accent" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Loading Text */}
                <motion.h2
                    animate={{
                        opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="text-2xl md:text-3xl font-bold gradient-text mb-3"
                >
                    Searching codebase, analyzing with AI...
                </motion.h2>

                <p className="text-muted-foreground text-lg">
                    This may take a few moments
                </p>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                            className="w-2 h-2 bg-accent rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
