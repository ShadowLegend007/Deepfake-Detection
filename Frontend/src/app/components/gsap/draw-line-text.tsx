import { ComponentProps, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type DrawTextProps = {
    afterFill?: boolean;
    color?: string;
    fontSize?: number;
    letterSpacing?: number;
    oneByOne?: boolean;
    strokeWidth?: number;
    text: string;
    wordSpacing?: number;
    duration?: number;
    onComplete?: () => void;
} & ComponentProps<"svg">;

export const DrawLineText = ({
    text,
    oneByOne = true,
    afterFill = true,
    color = "black",
    fontSize = 40,
    wordSpacing = 10,
    strokeWidth = 1,
    letterSpacing = 0,
    duration = 2.5,
    onComplete,
    ...props
}: DrawTextProps) => {
    const wrapperRef = useRef<SVGSVGElement | null>(null);

    const [textDimension, setTextDimension] = useState<{ height: number; width: number }>({ height: 0, width: 0 });

    useGSAP(
        () => {
            const wrapperChildren = wrapperRef.current?.children;
            if (!wrapperChildren) return;
            const children = Array.from(wrapperChildren) as SVGTextElement[];
            let totalWidth = 0;
            let maxHeight = 0;
            children.forEach((el, index) => {
                el.setAttribute("x", totalWidth + "px");
                const elementWidth = el.getBoundingClientRect().width;
                const elementHeight = el.getBoundingClientRect().height;
                if (elementHeight > maxHeight) {
                    maxHeight = elementHeight;
                }
                totalWidth +=
                    +(elementWidth == 0 ? wordSpacing : elementWidth) +
                    (children.length - 1 != index ? letterSpacing : 0);
                const length = el.getComputedTextLength() * 8;
                el.style.strokeDasharray = length + "px";
                el.style.strokeDashoffset = length + "px";
            });
            setTextDimension({ width: totalWidth, height: maxHeight });

            const textChildren = children.filter((el) => el.getBoundingClientRect().width != 0);

            const tl = gsap.timeline();
            tl.to(textChildren, {
                strokeDashoffset: 0,
                duration: duration,
                ease: "linear",
                stagger: oneByOne ? 0.8 : 0,
            });
            if (afterFill) {
                tl.to(textChildren, {
                    fillOpacity: 1,
                    strokeOpacity: 0,
                    duration: 0.6,
                    ease: "power4.in",
                    stagger: oneByOne ? {
                        amount: 0.2,
                        from: "center",
                    } : 0,
                });
            }
            if (onComplete) {
                tl.call(onComplete);
            }
        },
        { scope: wrapperRef, dependencies: [text, onComplete] },
    );

    return (
        <svg
            {...props}
            ref={wrapperRef}
            style={{
                userSelect: "none",
                width: textDimension.width + "px",
                height: textDimension.height * 1.03 + "px",
            }}>
            {text.split("").map((char, i) => (
                <text
                    key={i}
                    style={{
                        stroke: color,
                        fill: color,
                        fillOpacity: 0,
                        fontSize: fontSize,
                        strokeWidth: `${strokeWidth}px`,
                        dominantBaseline: "hanging",
                        textAnchor: "start"
                    }}
                    y={0}
                >
                    {char}
                </text>
            ))}
        </svg>
    );
};
