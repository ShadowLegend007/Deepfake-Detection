import { AlertTriangle } from "lucide-react";

interface AllergenWarningProps {
    allergens: string[];
}

export function AllergenWarning({ allergens }: AllergenWarningProps) {
    if (!allergens || allergens.length === 0) return null;

    return (
        <div className="glass-card border border-border-glass rounded-xl p-5">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-warning mb-2">Allergen Warning</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        This product may contain the following allergens:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {allergens.map((allergen, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 rounded-pill bg-warning/10 text-warning text-xs font-medium border border-warning/20"
                            >
                                {allergen}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
