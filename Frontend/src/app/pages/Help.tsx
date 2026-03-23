import { motion } from "motion/react";
import Stepper, { Step } from "../components/Stepper";
import StarBorder from "../components/StarBorder";

export const Help = () => {
    return (
        <div className="min-h-screen pt-[100px] pb-16 px-6 flex flex-col items-center justify-start lg:justify-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-5xl w-full"
            >
                <StarBorder as="div" className="w-full text-left" color="#8b5cf6" speed="6s" thickness={2}>
                    <div className="rounded-3xl p-4 md:p-6 w-full h-full text-center">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                            How to Use DeepTrust
                        </h1>
                        
                        <div className="text-left text-zinc-800 dark:text-zinc-300">
                            <Stepper
                                initialStep={1}
                                backButtonText="Previous"
                                nextButtonText="Next"
                            >
                                <Step>
                                    <div className="flex flex-col gap-2 py-2">
                                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                            Upload Media
                                        </h2>
                                        <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                                            Navigate to the <strong className="text-foreground">Analyze</strong> page. You can drag and drop any Image (`.jpg`, `.png`), Audio (`.mp3`, `.wav`), or Video (`.mp4`) file into the upload zone.
                                        </p>
                                    </div>
                                </Step>
                                <Step>
                                    <div className="flex flex-col gap-2 py-2">
                                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                            Read the Trust Score
                                        </h2>
                                        <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                                            Our Machine Learning models run a forensic analysis in milliseconds. 
                                            <br/><br/>
                                            A high Trust Score (<strong className="text-foreground">&gt; 65%</strong>) means the media is likely <strong className="text-foreground">Authentic</strong>. A low score (<strong className="text-foreground">&lt; 35%</strong>) indicates the file is highly <strong className="text-foreground">Manipulated</strong> (e.g. AI-generated, cloned voice, or face-swapped deepfake).
                                        </p>
                                    </div>
                                </Step>
                                <Step>
                                    <div className="flex flex-col gap-2 py-2">
                                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                            Check Visual Evidence
                                        </h2>
                                        <div className="text-base leading-relaxed space-y-2 text-zinc-700 dark:text-zinc-300">
                                            <p>Below the score, we provide raw forensic evidence:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li><strong className="text-foreground">Images & Videos:</strong> You'll see an <em className="text-foreground">Error Level Analysis Heatmap</em>. Bright spots point exactly to edited sections.</li>
                                                <li><strong className="text-foreground">Audio:</strong> You'll see a raw <em className="text-foreground">Waveform Plot</em>. Unnatural smoothness indicates AI voice cloning.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Step>
                            </Stepper>
                        </div>
                    </div>
                </StarBorder>
            </motion.div>
        </div>
    );
};
