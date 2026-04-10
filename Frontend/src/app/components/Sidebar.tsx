import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, History, Settings, HelpCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from "lucide-react";

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Toggle sidebar
    const toggleSidebar = () => setIsOpen(!isOpen);

    // Sidebar items
    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Sparkles, label: 'Analysis', path: '/analysis' },
        { icon: History, label: 'History', path: '#' },
        { icon: Settings, label: 'Settings', path: '#' },
        { icon: HelpCircle, label: 'Help', path: '#' },
    ];

    const handleNavigation = (path: string) => {
        if (path !== '#') {
            navigate(path);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Hamburger Button (Fixed top-left or top-right as requested "side mounted") */}
            <motion.button
                className="fixed top-6 left-6 z-50 p-2 rounded-full bg-background/50 backdrop-blur-md border border-white/10 text-foreground shadow-lg hover:bg-background/80 transition-colors"
                onClick={toggleSidebar}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>

            {/* Sidebar Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                        />

                        {/* Sidebar Content */}
                        <motion.div
                            className="fixed top-0 left-0 bottom-0 w-64 bg-background/95 backdrop-blur-xl border-r border-white/10 z-50 p-6 flex flex-col shadow-2xl"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            {/* Logo Area */}
                            <div className="flex items-center gap-3 mb-10 mt-14">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    N
                                </div>
                                <span className="text-xl font-bold tracking-tight">NeuraGlance</span>
                            </div>

                            {/* Navigation Items */}
                            <nav className="flex-1 space-y-2">
                                {menuItems.map((item, index) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <motion.button
                                            key={item.label}
                                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all group ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
                                            onClick={() => handleNavigation(item.path)}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 + 0.1 }}
                                        >
                                            <item.icon className={`w-5 h-5 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                                            <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            {/* Bottom Actions */}
                            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Theme</span>
                                    <ThemeToggle />
                                </div>
                                <div className="text-xs text-muted-foreground text-center">
                                    v1.0.0 • NeuraGlance
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
