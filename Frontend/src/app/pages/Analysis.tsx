import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Upload,
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
    AlertCircle,
} from "lucide-react";
import { analyzeFile } from "../../api";
import { AnalysisResponse, AuthenticityIndicator } from "../../types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircularScore({ score, verdict }: { score: number; verdict: AuthenticityIndicator }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (score / 100) * circumference;

    const colorMap: Record<AuthenticityIndicator, string> = {
        Authentic: "#10b981",
        Suspicious: "#f59e0b",
        Manipulated: "#ef4444",
    };

    const color = colorMap[verdict];

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg width="160" height="160" className="rotate-[-90deg]">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="12"
                />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-3xl font-bold text-foreground"
                >
                    {score.toFixed(1)}%
                </motion.span>
                <span className="text-xs text-muted-foreground mt-1">Trust Score</span>
            </div>
        </div>
    );
}

function VerdictBadge({ verdict }: { verdict: AuthenticityIndicator }) {
    const config: Record<
        AuthenticityIndicator,
        { Icon: typeof CheckCircle2; bg: string; border: string; text: string; glow: string }
    > = {
        Authentic: {
            Icon: CheckCircle2,
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            text: "text-emerald-400",
            glow: "0 0 20px rgba(16,185,129,0.25)",
        },
        Suspicious: {
            Icon: AlertTriangle,
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            text: "text-amber-400",
            glow: "0 0 20px rgba(245,158,11,0.25)",
        },
        Manipulated: {
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
            <span className={`font-semibold text-base ${text}`}>{verdict}</span>
        </motion.div>
    );
}

function MediaTypeBadge({ mediaType }: { mediaType: "image" | "audio" | "video" }) {
    const config = {
        image: { label: "Image", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        audio: { label: "Audio", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        video: { label: "Video", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    };
    const { label, color, bg, border } = config[mediaType];
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${bg} ${border} ${color}`}>
            {label}
        </span>
    );
}

// ─── Main Analysis Page ───────────────────────────────────────────────────────

export function Analysis() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFile = useCallback((file: File) => {
        setSelectedFile(file);
        setResult(null);
        setErrorMessage(null);
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

    const handleAnalyze = async () => {
        if (!selectedFile || isLoading) return;
        setIsLoading(true);
        setResult(null);
        setErrorMessage(null);

        try {
            const data = await analyzeFile(selectedFile);
            setResult(data);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setResult(null);
        setIsLoading(false);
        setErrorMessage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const verdictDescription: Record<string, string> = {
        Authentic: "This media appears to be original and unaltered. No manipulation signatures detected.",
        Suspicious: "Anomalies detected. Use caution when sharing or relying on this media.",
        Manipulated: "High confidence of AI manipulation. This media shows clear signs of deepfake generation.",
    };

    const canAnalyze = !!selectedFile && !isLoading;

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
                            <p className="text-muted-foreground text-lg mt-2">
                                Verify digital media authenticity instantly
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Error Banner ── */}
                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400"
                        >
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                            <div className="flex-1 text-sm leading-relaxed">{errorMessage}</div>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="text-red-400/60 hover:text-red-400 transition-colors text-lg leading-none"
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">

                    {/* ── Upload Section ── */}
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
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
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
                                            animate={{ y: isDragOver ? -6 : 0, scale: isDragOver ? 1.1 : 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center"
                                        >
                                            <Upload className="w-8 h-8 text-accent" />
                                        </motion.div>
                                        <div>
                                            <p className="font-semibold text-foreground text-base">
                                                {isDragOver ? "Drop your file here" : "Drop a file or click to browse"}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1.5">
                                                Supports images, videos, and audio files
                                            </p>
                                        </div>
                                    </>
                                )}
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
                                <CircularScore
                                    score={result.trust_score}
                                    verdict={result.authenticity_indicator}
                                />
                                <div className="flex flex-col gap-3 items-center sm:items-start flex-1">
                                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                                        <VerdictBadge verdict={result.authenticity_indicator} />
                                        <MediaTypeBadge mediaType={result.media_type} />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center sm:text-left max-w-xs">
                                        {verdictDescription[result.authenticity_indicator]}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <ShieldCheck className="w-4 h-4 text-accent" />
                                        <span className="text-xs text-muted-foreground">
                                            Analyzed with DeepTrust v1.0
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Evidence */}
                            {result.visual_evidence_base64 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.45 }}
                                    className="glass-card rounded-2xl p-6"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Eye className="w-5 h-5 text-accent" />
                                        <h2 className="font-semibold text-base text-foreground">
                                            {result.media_type === "audio"
                                                ? "Audio Waveform"
                                                : "ELA Heatmap — Forensic Evidence"}
                                        </h2>
                                    </div>
                                    <div className="rounded-xl overflow-hidden border border-border/40">
                                        <img
                                            src={result.visual_evidence_base64}
                                            alt={
                                                result.media_type === "audio"
                                                    ? "Audio waveform visualisation"
                                                    : "Error Level Analysis heatmap"
                                            }
                                            className="w-full object-contain max-h-72"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                        {result.media_type === "audio"
                                            ? "Waveform derived from raw PCM samples. Unnaturally smooth or periodic patterns may indicate synthetic generation."
                                            : "Bright regions in the ELA heatmap indicate higher compression residuals — a forensic signal of image manipulation or deepfake insertion."}
                                    </p>
                                </motion.div>
                            )}

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
