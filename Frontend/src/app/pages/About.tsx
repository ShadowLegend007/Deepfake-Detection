
import { useRef } from 'react';
import PixelTransition from '../components/PixelTransition';
import { motion } from 'motion/react';
import { Github, Linkedin, Globe, Instagram } from 'lucide-react';

const TeamMemberCard = ({
    name,
    role,
    image,
    socials
}: {
    name: string;
    role: string;
    image: string;
    socials: { github?: string; linkedin?: string; website?: string; instagram?: string };
}) => {
    return (
        <div className="flex justify-center w-full">
            <PixelTransition
                firstContent={
                    <div className="relative w-full h-full">
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-3 left-2 right-2 text-center">
                            <h3 className="text-white text-sm font-bold truncate leading-tight">{name}</h3>
                        </div>
                    </div>
                }
                secondContent={
                    <div className="w-full h-full bg-white dark:bg-zinc-900 flex flex-col items-center justify-center p-2 text-center">
                        <h3 className="text-gray-900 dark:text-white text-base font-bold mb-1 leading-tight">{name}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mb-2 leading-tight">{role}</p>

                        <div className="flex gap-3">
                            {socials.github && (
                                <a
                                    href={socials.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-600 dark:text-white hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                                >
                                    <Github size={20} />
                                </a>
                            )}
                            {socials.linkedin && (
                                <a
                                    href={socials.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-600 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                >
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {socials.website && (
                                <a
                                    href={socials.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-600 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                                >
                                    <Globe size={20} />
                                </a>
                            )}
                            {socials.instagram && (
                                <a
                                    href={socials.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-600 dark:text-white hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                                >
                                    <Instagram size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                }
                gridSize={10}
                pixelColor="#ffffff"
                animationStepDuration={0.4}
                aspectRatio="130%"
                className="w-[300px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-black/5 dark:border-white/10"
            />
        </div>
    );
};

export const About = () => {
    const teamSectionRef = useRef<HTMLDivElement>(null);

    const scrollToTeam = () => {
        teamSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const teamMembers = [
        {
            name: "Rajdeep Pal",
            role: "Team Lead",
            image: "https://i.ibb.co/p6FSjw9b/Rajdeep.jpg",
            socials: {
                github: "https://github.com/Rajdeep2302",
                linkedin: "https://www.linkedin.com/in/rajdeep-pal-1b12b02b",
                instagram: "https://www.instagram.com/rajdeeppal2005",
                website: "https://rajdeeppal.me",
            }
        },
        {
            name: "Akash Saha",
            role: "ML Expert",
            image: "https://i.ibb.co/Xrw1vLm6/Akash.jpg",
            socials: {
                github: "https://github.com/akashsaha477",
                linkedin: "https://www.linkedin.com/in/akash-saha-16a734b8/",
                instagram: "https://www.instagram.com/a_visionary_shutterbug/",

            }
        },
        {
            name: "Subhodeep Mondal",
            role: "Frontend",
            image: "https://i.ibb.co/wNyL4525/Subhodeep.jpg",
            socials: {
                github: "https://github.com/ShadowLegend007",
                linkedin: "https://www.linkedin.com/in/subhodeep-mondal-a3a2762b5/",
                instagram: "https://www.instagram.com/shadowlegend_007/",
                website: "https://subhodeep.me",
            }
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-7xl mx-auto px-4 sm:px-8"
        >
            {/* About Us Section */}
            <section className="min-h-screen flex flex-col justify-center items-center text-center max-w-4xl mx-auto pt-20 px-4">
                <h1 className="text-4xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600 mb-6 md:mb-10">
                    About Us
                </h1>

                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl dark:shadow-2xl">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission & Vision</h2>
                    <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 md:mb-8">
                        Incognito is an intelligent, AI-driven application designed to decode product ingredients instantly.
                        It acts as a co-pilot for consumers, combining real-world database data (OpenFoodFacts) with
                        Generative AI (Google Gemini) to interpret food labels like a nutritionist.
                    </p>

                    <button
                        onClick={scrollToTeam}
                        className="px-6 md:px-8 py-2 md:py-3 bg-black text-white dark:bg-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform duration-200 shadow-lg text-sm md:text-base"
                    >
                        Meet Our Team
                    </button>
                </div>
            </section>

            {/* Team Section */}
            <section ref={teamSectionRef} className="min-h-screen flex flex-col justify-center py-10 pt-16 md:pt-32 md:pb-10">
                <div className="text-center mb-6">
                    <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2">Meet the Team</h2>
                    <p className="text-xl md:text-3xl font-semibold text-indigo-600 dark:text-indigo-400">Team Incognito</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 md:gap-6 justify-items-center px-4 mb-10">
                    {teamMembers.map((member, idx) => (
                        <TeamMemberCard key={idx} {...member} />
                    ))}
                </div>
            </section>
        </motion.div>
    );
};
