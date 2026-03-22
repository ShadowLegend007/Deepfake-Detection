import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string | ((t: number) => number);
    splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    threshold?: number;
    rootMargin?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    textAlign?: React.CSSProperties['textAlign'];
    onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 1.25,
    ease = 'power3.out',
    splitType = 'chars',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = '-100px',
    tag = 'div', // Default to div to avoid p nesting issues
    textAlign = 'center',
    onLetterAnimationComplete
}) => {
    const ref = useRef<HTMLElement>(null);
    const animationCompletedRef = useRef(false);

    // Helper to split text
    const renderContent = () => {
        if (splitType === 'chars' || splitType === 'words, chars') {
            return text.split('').map((char, i) => (
                <span
                    key={i}
                    className="split-char inline-block"
                    style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                    {char}
                </span>
            ));
        }
        // Simple words split
        if (splitType === 'words') {
            return text.split(' ').map((word, i) => (
                <span key={i} className="split-word inline-block mr-[0.25em]">
                    {word}
                </span>
            ));
        }
        // Fallback or lines (lines are hard to do without the plugin or complex CSS calculation, treating as block)
        return text;
    };

    useGSAP(
        () => {
            if (!ref.current) return;
            if (animationCompletedRef.current) return;

            const elements = ref.current.querySelectorAll('.split-char, .split-word');

            if (elements.length === 0) {
                // If simply text (lines), animate the container or text content? 
                // For now, let's assume we fall back to simple reveal if split failed or wasn't chars/words
                gsap.fromTo(
                    ref.current,
                    { ...from },
                    {
                        ...to,
                        duration,
                        ease,
                        scrollTrigger: {
                            trigger: ref.current,
                            start: `top ${100 - (threshold * 100)}%`,
                            once: true
                        },
                        onComplete: () => {
                            animationCompletedRef.current = true;
                            onLetterAnimationComplete?.();
                        }
                    }
                );
                return;
            }

            gsap.fromTo(
                elements,
                { ...from },
                {
                    ...to,
                    duration,
                    ease,
                    stagger: delay / 1000,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: `top ${100 - (threshold * 100)}%`,
                        once: true,
                    },
                    onComplete: () => {
                        animationCompletedRef.current = true;
                        onLetterAnimationComplete?.();
                    }
                }
            );
        },
        { dependencies: [text, delay, duration, ease, from, to, threshold], scope: ref }
    );

    const Tag = tag as any;

    return (
        <Tag
            ref={ref}
            className={`${className} split-parent`}
            style={{ textAlign, overflow: 'hidden' }}
        >
            {renderContent()}
        </Tag>
    );
};

export default SplitText;
