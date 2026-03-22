import { motion } from "motion/react";

export const Help = () => {
    return (
        <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-3xl w-full bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-8">
                    How to Use DeepTrust
                </h1>
                
                <div className="text-left space-y-8 text-zinc-700 dark:text-zinc-300">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm">1</span>
                            Upload Media
                        </h2>
                        <p className="ml-10 text-base leading-relaxed">
                            Navigate to the <strong>Analyze</strong> page. You can drag and drop any Image (`.jpg`, `.png`), Audio (`.mp3`, `.wav`), or Video (`.mp4`) file into the upload zone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">2</span>
                            Read the Trust Score
                        </h2>
                        <p className="ml-10 text-base leading-relaxed">
                            Our Machine Learning models run a forensic analysis in milliseconds. 
                            <br/><br/>
                            A high Trust Score (<strong>&gt; 65%</strong>) means the media is likely <strong>Authentic</strong>. A low score (<strong>&lt; 35%</strong>) indicates the file is highly <strong>Manipulated</strong> (e.g. AI-generated, cloned voice, or face-swapped deepfake).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 text-sm">3</span>
                            Check Visual Evidence
                        </h2>
                        <div className="ml-10 text-base leading-relaxed space-y-3">
                            <p>Below the score, we provide raw forensic evidence:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Images & Videos:</strong> You'll see an <em>Error Level Analysis (ELA) Heatmap</em>. Bright, contrasting spots in the heatmap point exactly to where a section of the image was artificially inserted or edited.</li>
                                <li><strong>Audio:</strong> You'll see a raw <em>Waveform Plot</em>. Unnatural smoothness or missing high-frequency variance are signatures of AI voice cloning.</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};
