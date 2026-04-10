import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";

interface SourceButtonProps {
    url?: string;
    sourceName: string;
    label?: string;
}

export function SourceButton({ url, sourceName, label = "Source" }: SourceButtonProps) {
    const handleClick = () => {
        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
        } else {
            // Google search fallback
            const searchQuery = encodeURIComponent(sourceName);
            window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 hover:bg-card/80 border border-border/50 hover:border-accent/30 rounded-full text-sm font-medium text-foreground transition-all duration-300 backdrop-blur-md"
        >
            <ExternalLink className="w-4 h-4" />
            {label}
        </motion.button>
    );
}
