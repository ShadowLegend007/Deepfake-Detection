import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Upload,
    Link as LinkIcon,
    Scan,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Eye,
    Cpu,
    FileWarning,
    ShieldCheck,
    RefreshCw,
    Image,
    Video,
    Music,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Verdict = "authentic" | "suspicious" | "deepfake";

interface AnalysisResult {
    verdict: Verdict;
    score: number; // 0-100 (100 = fully authentic)
    label: string;
    reasons: { icon: string; text: string; severity: "low" | "medium" | "high" }[];
}

// ─── Mock data factory ────────────────────────────────────────────────────────

function generateMockResult(filename: string): AnalysisResult {
    const rand = Math.random();

    if (rand < 0.33) {
        return {
            verdict: "authentic",
            score: Math.floor(Math.random() * 15) + 85,
            label: "Authentic",
            reasons: [
                { icon: "✅", text: "No facial inconsistencies detected", severity: "low" },
                { icon: "✅", text: "Metadata intact and consistent", severity: "low" },
                { icon: "✅", text: "Natural compression artifacts present", severity: "low" },
                { icon: "✅", text: "Lighting and shadow alignment verified", severity: "low" },
            ],
        };
    } else if (rand < 0.66) {
        return {
            verdict: "suspicious",
            score: Math.floor(Math.random() * 25) + 40,
            label: "Suspicious",
            reasons: [
                { icon: "⚠️", text: "Metadata partially missing", severity: "medium" },
                { icon: "⚠️", text: "Minor facial boundary artifacts detected", severity: "medium" },
                { icon: "✅", text: "Audio-visual sync appears normal", severity: "low" },
                { icon: "⚠️", text: "Unusual compression patterns in regions", severity: "medium" },
            ],
        };
    } else {
        return {
            verdict: "deepfake",
            score: Math.floor(Math.random() * 25) + 5,
            label: "Likely Deepfake",
            reasons: [
                { icon: "🚨", text: "Facial inconsistencies detected around eyes", severity: "high" },
                { icon: "🚨", text: "Metadata missing or tampered", severity: "high" },
                { icon: "🚨", text: "Frame anomalies found in temporal analysis", severity: "high" },
                { icon: "⚠️", text: "GAN-generated texture patterns identified", severity: "high" },
            ],
        };
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircularScore({ score, verdict }: { score: number; verdict: Verdict }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (score / 100) * circumference;

    const colorMap: Record<Verdict, string> = {
        authentic: "#10b981",
        suspicious: "#f59e0b",
        deepfake: "#ef4444",
    };

    const color = colorMap[verdict];

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg width="160" height="160" className="rotate-[-90deg]">
                {/* Track */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="12"
                />
                {/* Progress */}
                <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - strokeDash }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-3xl font-bold text-foreground"
                >
                    {score}%
                </motion.span>
                <span className="text-xs text-muted-foreground mt-1">Trust Score</span>
            </div>
        </div>
    );
}

function VerdictBadge({ verdict, label }: { verdict: Verdict; label: string }) {
    const config: Record<
        Verdict,
        { Icon: typeof CheckCircle2; bg: string; border: string; text: string; glow: string }
    > = {
        authentic: {
            Icon: CheckCircle2,
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            text: "text-emerald-400",
            glow: "0 0 20px rgba(16,185,129,0.25)",
        },
        suspicious: {
            Icon: AlertTriangle,
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            text: "text-amber-400",
            glow: "0 0 20px rgba(245,158,11,0.25)",
        },
        deepfake: {
            Icon: XCircle,
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            text: "text-red-400",
            glow: "0 0 20px rgba(239,68,68,0.25)",
        },
    };

    const { Icon, bg, border, text, glow } = config[verdict];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border ${bg} ${border}`}
            style={{ boxShadow: glow }}
        >
            <Icon className={`w-5 h-5 ${text}`} />
            <span className={`font-semibold text-base ${text}`}>{label}</span>
        </motion.div>
    );
}

function ReasonCard({
    icon,
    text,
    severity,
    index,
}: {
    icon: string;
    text: string;
    severity: "low" | "medium" | "high";
    index: number;
}) {
    const severityStyle: Record<string, string> = {
        low: "border-emerald-500/20 bg-emerald-500/5",
        medium: "border-amber-500/20 bg-amber-500/5",
        high: "border-red-500/20 bg-red-500/5",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.35 }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${severityStyle[severity]} backdrop-blur-sm`}
        >
            <span className="text-lg leading-none mt-0.5">{icon}</span>
            <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
        </motion.div>
    );
}

// ─── Main Analysis Page ───────────────────────────────────────────────────────

export function Analysis() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Helpers ─────────────────────────────────────────

    const getFileIcon = (file: File) => {
        if (file.type.startsWith("image/")) return <Image className="w-5 h-5 text-purple-400" />;
        if (file.type.startsWith("video/")) return <Video className="w-5 h-5 text-blue-400" />;
        if (file.type.startsWith("audio/")) return <Music className="w-5 h-5 text-pink-400" />;
        return <FileWarning className="w-5 h-5 text-muted-foreground" />;
    };

    const humanSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // ── Handlers ─────────────────────────────────────────

    const handleFile = useCallback((file: File) => {
        setSelectedFile(file);
        setUrlInput("");
        setResult(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleAnalyze = () => {
        if (!selectedFile && !urlInput.trim()) return;
        setIsLoading(true);
        setResult(null);

        // Simulate API delay
        setTimeout(() => {
            const name = selectedFile?.name ?? urlInput;
            setResult(generateMockResult(name));
            setIsLoading(false);
        }, 2800);
    };

    const handleReset = () => {
        setSelectedFile(null);
        setUrlInput("");
        setResult(null);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const canAnalyze = (!!selectedFile || urlInput.trim().length > 0) && !isLoading;

    // ─────────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto flex flex-col gap-8">
                {/* ── Page Header ── */}
                <AnimatePresence mode="wait">
                    {!result && (
                        <motion.div
                            key="header"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent pb-2">
                                DeepTrust
                            </h1>
                            <p className="text-text-secondary text-lg mt-2">
                                Verify digital media authenticity instantly
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Upload Section ── */}
                <AnimatePresence mode="wait">
                    {!result && !isLoading && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col gap-5"
                        >
                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragOver(true);
                                }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
                                    flex flex-col items-center justify-center gap-4 py-14 px-6 text-center
                                    ${isDragOver
                                        ? "border-purple-400 bg-purple-500/10 scale-[1.01]"
                                        : selectedFile
                                        ? "border-purple-500/40 bg-purple-500/5"
                                        : "border-border hover:border-purple-500/50 hover:bg-purple-500/5"
                                    }
                                `}
                                style={{
                                    boxShadow: isDragOver ? "0 0 30px rgba(124,58,237,0.2)" : "none",
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*,audio/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {selectedFile ? (
                                    <>
                                        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                                            {getFileIcon(selectedFile)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-base">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {humanSize(selectedFile.size)} · Click to change
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            animate={{
                                                y: isDragOver ? -6 : 0,
                                                scale: isDragOver ? 1.1 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                            className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center"
                                        >
                                            <Upload className="w-8 h-8 text-accent" />
                                        </motion.div>
                                        <div>
                                            <p className="font-semibold text-foreground text-base">
                                                {isDragOver
                                                    ? "Drop your file here"
                                                    : "Drop a file or click to browse"}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1.5">
                                                Supports images, videos, and audio files
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                <div className="flex-1 h-px bg-border" />
                                <span>or paste a URL</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* URL Input */}
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => {
                                        setUrlInput(e.target.value);
                                        if (e.target.value) setSelectedFile(null);
                                    }}
                                    placeholder="https://example.com/video.mp4"
                                    className="
                                        w-full pl-11 pr-4 py-3.5 rounded-xl
                                        bg-input border border-border
                                        text-foreground placeholder:text-muted-foreground
                                        focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30
                                        transition-all duration-200 text-sm
                                    "
                                />
                            </div>

                            {/* Analyze Button */}
                            <motion.button
                                whileHover={canAnalyze ? { scale: 1.02 } : {}}
                                whileTap={canAnalyze ? { scale: 0.97 } : {}}
                                onClick={handleAnalyze}
                                disabled={!canAnalyze}
                                className={`
                                    w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3
                                    transition-all duration-300
                                    ${canAnalyze
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_24px_rgba(124,58,237,0.35)] hover:shadow-[0_0_36px_rgba(124,58,237,0.5)]"
                                        : "bg-card border border-border text-muted-foreground cursor-not-allowed"
                                    }
                                `}
                            >
                                <Scan className="w-5 h-5" />
                                Analyze Media
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── Loading Spinner ── */}
                    {isLoading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-24 gap-8"
                        >
                            {/* Animated ring */}
                            <div className="relative w-24 h-24">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ repeat: Infinity, duration: 2.1, ease: "linear" }}
                                    className="absolute inset-2 rounded-full border-4 border-transparent border-b-pink-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu className="w-8 h-8 text-purple-400" />
                                </div>
                            </div>

                            {/* Progress steps */}
                            <div className="flex flex-col gap-2 text-center">
                                {[
                                    "Extracting media fingerprint…",
                                    "Running deepfake detection models…",
                                    "Compiling trust score…",
                                ].map((step, i) => (
                                    <motion.p
                                        key={step}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.7, duration: 0.4 }}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {step}
                                    </motion.p>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Results ── */}
                    {result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.55 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Result header card */}
                            <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                                {/* Circular progress */}
                                <CircularScore score={result.score} verdict={result.verdict} />

                                {/* Verdict + details */}
                                <div className="flex flex-col gap-3 items-center sm:items-start flex-1">
                                    <VerdictBadge verdict={result.verdict} label={result.label} />

                                    <p className="text-sm text-muted-foreground text-center sm:text-left max-w-xs">
                                        {result.verdict === "authentic"
                                            ? "This media appears to be original and unaltered. No manipulation signatures detected."
                                            : result.verdict === "suspicious"
                                            ? "Anomalies detected. Use caution when sharing or relying on this media."
                                            : "High confidence of AI manipulation. This media shows clear signs of deepfake generation."}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-1">
                                        <ShieldCheck className="w-4 h-4 text-accent" />
                                        <span className="text-xs text-muted-foreground">
                                            Analyzed with DeepTrust AI v2.1
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Explanation cards */}
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-5">
                                    <Eye className="w-5 h-5 text-accent" />
                                    <h2 className="font-semibold text-base text-foreground">
                                        Explanation Panel
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {result.reasons.map((r, i) => (
                                        <ReasonCard
                                            key={i}
                                            icon={r.icon}
                                            text={r.text}
                                            severity={r.severity}
                                            index={i}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Reset */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleReset}
                                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-accent/5 text-foreground/80 hover:text-foreground text-sm font-medium transition-all duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Analyze Another File
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
