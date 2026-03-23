import { useRef } from 'react';
import PixelTransition from '../components/PixelTransition';
import { motion } from 'motion/react';
import { Github, Linkedin, Globe, Instagram } from 'lucide-react';
import { assets } from '../assets/assets';

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
        <div className="flex justify-center w-full max-w-[300px]">
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
                                <a href={socials.github} target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-white hover:text-purple-500 transition-colors">
                                    <Github size={20} />
                                </a>
                            )}
                            {socials.linkedin && (
                                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-white hover:text-blue-500 transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {socials.website && (
                                <a href={socials.website} target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-white hover:text-emerald-500 transition-colors">
                                    <Globe size={20} />
                                </a>
                            )}
                            {socials.instagram && (
                                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-white hover:text-pink-500 transition-colors">
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
                className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-black/5 dark:border-white/10"
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
            image: assets.Rajdeep,
            socials: {
                github: "https://github.com/Rajdeep2302",
                linkedin: "https://www.linkedin.com/in/rajdeep-pal-1b12b02b",
                instagram: "https://www.instagram.com/rajdeeppal2005",
                website: "https://rajdeeppal.me",
            }
        },
        {
            name: "Ritabhas Barick",
            role: "ML Expert",
            image: assets.ritabhas,
            socials: {
                github: "https://github.com/akashsaha477",
                linkedin: "https://www.linkedin.com/in/akash-saha-16a734b8/",
                instagram: "https://www.instagram.com/a_visionary_shutterbug/",

            }
        },
        {
            name: "Subhodeep Mondal",
            role: "Frontend",
            image: assets.Subhodeep,
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
            <section className="min-h-screen flex flex-col justify-center items-center text-center max-w-4xl mx-auto pt-24 px-4">
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600 mb-6 md:mb-10 leading-tight pb-2">
                    DeepTrust
                </h1>

                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl dark:shadow-2xl w-full">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                    <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
                        In an era where synthetic media and generative AI are making it nearly impossible to distinguish reality from fabrication, <strong>DeepTrust</strong> exists to bring forensic truth to the masses. 
                        We combine cutting-edge Error Level Analysis (ELA) for visual data and MFCC structural analysis for audio to instantly detect deepfakes, voice clones, and tampered media.
                    </p>

                    <button
                        onClick={scrollToTeam}
                        className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform duration-200 shadow-lg text-base"
                    >
                        Meet The Creators
                    </button>
                </div>
            </section>

            {/* Team Section */}
            <section ref={teamSectionRef} className="min-h-screen flex flex-col justify-center py-10 pt-16 md:pt-32 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 pb-2">
                        The Hackathon Team
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-muted-foreground">
                        Building tools for a verifiable internet.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 justify-items-center w-full px-4">
                    {teamMembers.map((member, idx) => (
                        <TeamMemberCard key={idx} {...member} />
                    ))}
                </div>
            </section>
        </motion.div>
    );
};
