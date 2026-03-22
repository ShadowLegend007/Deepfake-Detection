import { ArrowRight, Shield, Zap, Eye } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedButton } from "../components/AnimatedButton";
import SplitText from "../components/SplitText";
import { ScrollReveal } from "../components/ScrollReveal";
import { useNavigate } from "react-router-dom";

const features = [
    {
        icon: Shield,
        title: "Authenticity Detection",
        subtitle: "AI-powered verification",
        description:
            "Detect facial inconsistencies, GAN artifacts, and manipulation traces across images, videos, and audio files.",
    },
    {
        icon: Eye,
        title: "Frame Analysis",
        subtitle: "Deep-level inspection",
        description:
            "Our engine inspects every frame for temporal anomalies, blending edges, and compression artifacts invisible to the human eye.",
    },
    {
        icon: Zap,
        title: "Instant Results",
        subtitle: "Milliseconds, not minutes",
        description:
            "Get a detailed trust score with confidence levels and actionable explanations in seconds — no waiting, no guessing.",
    },
];

export function Home() {
    const navigate = useNavigate();

    return (
        <>
            {/* ── Hero ── */}
            <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-24 pb-16">
                {/* Decorative glows */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div
                        className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"
                        style={{ animationDuration: "4s" }}
                    />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"
                        style={{ animationDuration: "6s", animationDelay: "1s" }}
                    />
                </div>

                <div className="container px-4 mx-auto text-center relative z-10 flex flex-col items-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-8 backdrop-blur-sm"
                    >
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        AI-Powered Media Verification
                    </motion.div>

                    {/* Title */}
                    <div className="mb-4 flex justify-center w-full">
                        <SplitText
                            text="DeepTrust"
                            className="text-6xl md:text-8xl lg:text-9xl font-bold text-foreground drop-shadow-[0_0_30px_rgba(124,58,237,0.4)] tracking-tighter"
                            delay={80}
                            duration={0.6}
                            ease="power3.out"
                            splitType="chars"
                            from={{ opacity: 0, y: 40, rotateX: -30 }}
                            to={{ opacity: 1, y: 0, rotateX: 0 }}
                            threshold={0.1}
                            rootMargin="-100px"
                            textAlign="center"
                            onLetterAnimationComplete={() => {}}
                        />
                    </div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-10 leading-relaxed"
                    >
                        Verify digital media authenticity instantly.{" "}
                        <span className="text-foreground font-medium">
                            Upload any image, video, or audio — we'll tell you the truth.
                        </span>
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-4"
                    >
                        <AnimatedButton onClick={() => navigate("/analyze")} icon={ArrowRight}>
                            Start Analyzing
                        </AnimatedButton>
                    </motion.div>
                </div>
            </section>

            {/* ── Feature Grid ── */}
            <section className="py-20 bg-black/10">
                <div className="w-full max-w-6xl mx-auto px-4">
                    <ScrollReveal>
                        <h2 className="text-center text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            How DeepTrust Works
                        </h2>
                        <p className="text-center text-text-secondary mb-12 text-base max-w-xl mx-auto">
                            Three layers of analysis. One definitive answer.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <ScrollReveal key={feature.title}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.1,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className="relative group cursor-pointer h-full"
                                    >
                                        <div className="relative p-6 rounded-xl border border-border bg-card hover:border-accent/50 transition-all duration-200 shadow-sm hover:shadow-md h-full">
                                            <div className="mb-5">
                                                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors duration-200">
                                                    <Icon className="w-6 h-6 text-accent" strokeWidth={2} />
                                                </div>
                                            </div>
                                            <h3 className="mb-2 font-semibold text-lg tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm font-medium text-muted-foreground mb-3">
                                                {feature.subtitle}
                                            </p>
                                            <p className="text-muted-foreground leading-relaxed text-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 border-t border-white/5 glass-card mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2026 DeepTrust. Verify digital media authenticity.
                </div>
            </footer>
        </>
    );
}
