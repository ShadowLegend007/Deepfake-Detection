import { motion } from "motion/react";

export const Help = () => {
    return (
        <div className="min-h-screen pt-24 px-6 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-2xl w-full bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                    Need Help?
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
                    Welcome to Incognito! To analyze a product:
                    <br /><br />
                    1. Navigate to the <strong>Analysis</strong> page (Home).
                    <br />
                    2. <strong>Upload an image</strong> of any food product label.
                    <br />
                    3. Let our AI decode the ingredients and give you a verdict!
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    For further assistance, reach out to our team via the About page.
                </p>
            </motion.div>
        </div>
    );
};
