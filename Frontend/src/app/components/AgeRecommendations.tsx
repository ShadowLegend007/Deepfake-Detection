import { Baby, Users, User, UserCheck } from "lucide-react";

interface AgeRecommendation {
    ageGroup: string;
    recommendation: "safe" | "caution" | "avoid";
    note?: string;
}

interface AgeRecommendationsProps {
    recommendations: AgeRecommendation[];
}

const getIcon = (ageGroup: string) => {
    const group = ageGroup.toLowerCase();
    if (group.includes('baby') || group.includes('infant')) return Baby;
    if (group.includes('child')) return Users;
    if (group.includes('teen')) return User;
    return UserCheck;
};

const getColorClasses = (recommendation: string) => {
    switch (recommendation) {
        case 'safe':
            return 'bg-success/10 text-success border-success/20';
        case 'caution':
            return 'bg-warning/10 text-warning border-warning/20';
        case 'avoid':
            return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
            return 'bg-muted/10 text-muted-foreground border-border';
    }
};

const getLabel = (recommendation: string) => {
    switch (recommendation) {
        case 'safe':
            return '✓ Safe';
        case 'caution':
            return '⚠ Use with Caution';
        case 'avoid':
            return '✗ Not Recommended';
        default:
            return 'Unknown';
    }
};

export function AgeRecommendations({ recommendations }: AgeRecommendationsProps) {
    return (
        <div className="glass-card border border-border-glass rounded-xl p-5">
            <h4 className="text-sm font-semibold text-foreground mb-4">Age-Specific Recommendations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((rec, index) => {
                    const Icon = getIcon(rec.ageGroup);
                    const colorClasses = getColorClasses(rec.recommendation);

                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border ${colorClasses}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{rec.ageGroup}</span>
                            </div>
                            <div className="text-xs font-semibold mb-1">
                                {getLabel(rec.recommendation)}
                            </div>
                            {rec.note && (
                                <p className="text-xs opacity-80">{rec.note}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
