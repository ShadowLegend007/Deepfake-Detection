import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Camera } from "lucide-react";
import { useRef } from "react";

interface CameraUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
    onCameraCapture: () => void;
}

export function CameraUploadModal({ isOpen, onClose, onFileSelect, onCameraCapture }: CameraUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
            onClose();
        }
    };

    const handleCameraClick = () => {
        onCameraCapture();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-[28px] p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-foreground">Upload Product Image</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted/50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {/* Upload File */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleFileUpload}
                                    className="w-full flex items-center gap-4 p-4 bg-background/60 hover:bg-background/80 border border-border/50 hover:border-accent/30 rounded-[20px] transition-all duration-300"
                                >
                                    <div className="p-3 bg-accent/10 rounded-full">
                                        <Upload className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-foreground">Upload File</div>
                                        <div className="text-sm text-muted-foreground">Choose from your device</div>
                                    </div>
                                </motion.button>

                                {/* Open Camera */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCameraClick}
                                    className="w-full flex items-center gap-4 p-4 bg-background/60 hover:bg-background/80 border border-border/50 hover:border-accent/30 rounded-[20px] transition-all duration-300"
                                >
                                    <div className="p-3 bg-accent/10 rounded-full">
                                        <Camera className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-foreground">Open Camera</div>
                                        <div className="text-sm text-muted-foreground">Take a photo now</div>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
