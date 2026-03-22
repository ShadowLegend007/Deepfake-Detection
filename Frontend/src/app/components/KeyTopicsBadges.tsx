interface KeyTopicsBadgesProps {
    topics: string[];
}

export function KeyTopicsBadges({ topics }: KeyTopicsBadgesProps) {
    if (!topics || topics.length === 0) return null;

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Topics</h4>
            <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                    <span
                        key={index}
                        className="px-4 py-2 rounded-pill gradient-bg text-white text-sm font-medium glow-purple"
                    >
                        {topic}
                    </span>
                ))}
            </div>
        </div>
    );
}
