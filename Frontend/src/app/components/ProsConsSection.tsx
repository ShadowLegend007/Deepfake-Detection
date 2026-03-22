import { CheckCircle, XCircle } from "lucide-react";

interface ProsConsSectionProps {
    pros: string[];
    cons: string[];
}

export function ProsConsSection({ pros, cons }: ProsConsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="glass-card border border-border-glass rounded-xl p-5">
                <h4 className="text-sm font-semibold text-success mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Advantages
                </h4>
                <ul className="space-y-2">
                    {pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Cons */}
            <div className="glass-card border border-border-glass rounded-xl p-5">
                <h4 className="text-sm font-semibold text-destructive mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Disadvantages
                </h4>
                <ul className="space-y-2">
                    {cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
