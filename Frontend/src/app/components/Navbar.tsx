import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { HelpCircle, Search, Info, Menu, X, Home } from "lucide-react";
import { useBackendStatus } from "../../hooks/useBackendStatus";

function BackendPill({ compact = false }: { compact?: boolean }) {
    const status = useBackendStatus();

    const cfg = {
        checking: {
            dot: "bg-amber-400",
            glow: "shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]",
            text: "text-amber-400",
            label: "Checking…",
            pulse: true,
        },
        online: {
            dot: "bg-emerald-400",
            glow: "shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]",
            text: "text-emerald-400",
            label: "API Online",
            pulse: true,
        },
        offline: {
            dot: "bg-red-500",
            glow: "shadow-[0_0_6px_2px_rgba(239,68,68,0.5)]",
            text: "text-red-400",
            label: "API Offline",
            pulse: false,
        },
    }[status];

    return (
        <div
            className={`flex items-center gap-1.5 ${
                compact ? "" : "px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
            }`}
            title={`Backend status: ${status}`}
        >
            <span className="relative flex h-2 w-2">
                {cfg.pulse && (
                    <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`}
                    />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot} ${cfg.glow}`} />
            </span>
            {!compact && (
                <span className={`text-xs font-medium ${cfg.text} whitespace-nowrap`}>{cfg.label}</span>
            )}
        </div>
    );
}

export function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto relative">
                {/* Glassmorphism pill-shaped container - Floating Water Glass Effect */}
                <div className="bg-transparent backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full px-6 py-3 shadow-none flex items-center justify-between relative overflow-hidden z-20">
                    {/* Glossy sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 pointer-events-none rounded-full"></div>
                    {/* Logo with gradient text */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            onClick={() => window.location.href = "/"}
                            className="cursor-pointer select-none"
                        >
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
                                DeepTrust
                            </div>
                        </motion.div>
                    </div>

                    {/* Unified Connected Pill (Desktop/Tablet) */}
                    <div className="hidden min-[376px]:flex items-center bg-transparent backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full px-1 py-1 shadow-sm overflow-hidden">

                        {/* Home Link */}
                        <Link
                            to="/"
                            className={`px-3 md:px-4 py-1 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${isActive("/")
                                    ? "text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/20"
                                    : "text-foreground/80 hover:text-purple-500 dark:hover:text-purple-400"
                                }`}
                            aria-label="Home"
                        >
                            <span className="hidden md:inline">Home</span>
                            <span className="md:hidden"><Home size={18} /></span>
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

                        {/* Analyze Link */}
                        <Link
                            to="/analyze"
                            className={`px-3 md:px-4 py-1 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${isActive("/analyze")
                                    ? "text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/20"
                                    : "text-foreground/80 hover:text-purple-500 dark:hover:text-purple-400"
                                }`}
                            aria-label="Analyze"
                        >
                            <span className="hidden md:inline">Analyze</span>
                            <span className="md:hidden"><Search size={18} /></span>
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

                        {/* About Us Link */}
                        <Link
                            to="/about"
                            className={`px-3 md:px-4 py-1 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${isActive("/about")
                                    ? "text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/20"
                                    : "text-foreground/80 hover:text-purple-500 dark:hover:text-purple-400"
                                }`}
                            aria-label="About Us"
                        >
                            <span className="hidden md:inline">About Us</span>
                            <span className="md:hidden"><Info size={18} /></span>
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

                        {/* Help Link */}
                        <Link
                            to="/help"
                            className={`p-1 rounded-full transition-none ${isActive("/help")
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-foreground/80 hover:text-purple-500 dark:hover:text-purple-400"
                                }`}
                            aria-label="Help"
                        >
                            <HelpCircle size={20} />
                        </Link>

                        {/* Divider */}
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

                        {/* Backend Status */}
                        <div className="px-1">
                            <BackendPill />
                        </div>

                        {/* Divider */}
                        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

                        {/* Theme Toggle */}
                        <div className="px-1">
                            <ThemeToggle className="border-none shadow-none bg-transparent hover:border-0 hover:glow-0 p-1 rounded-full text-foreground/80 hover:text-purple-500 transition-none" />
                        </div>
                    </div>

                    {/* Hamburger Button (Mobile <= 375px) */}
                    <div className="block min-[376px]:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-full text-foreground/80 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-20 right-0 left-0 mx-6 min-[376px]:hidden bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-4 flex flex-col gap-2 z-10"
                        >
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 ${isActive("/")
                                        ? "bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                        : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                            >
                                <Home size={20} />
                                Home
                            </Link>
                            <Link
                                to="/analyze"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 ${isActive("/analyze")
                                        ? "bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                        : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                            >
                                <Search size={20} />
                                Analyze
                            </Link>
                            <Link
                                to="/about"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 ${isActive("/about")
                                        ? "bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                        : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                            >
                                <Info size={20} />
                                About Us
                            </Link>
                            <Link
                                to="/help"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center gap-3 ${isActive("/help")
                                        ? "bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                                        : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                            >
                                <HelpCircle size={20} />
                                Help
                            </Link>

                            <div className="w-full h-px bg-black/10 dark:bg-white/10 my-1"></div>

                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-sm font-medium text-foreground/80">Theme</span>
                                <ThemeToggle className="scale-110" />
                            </div>

                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-sm font-medium text-foreground/80">Backend</span>
                                <BackendPill />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
}
