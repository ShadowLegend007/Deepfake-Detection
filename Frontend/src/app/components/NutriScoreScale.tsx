// Helper function to get the proper Nutri-Score gradient colors
const getNutriScoreGradient = (grade: string) => {
    switch (grade.toUpperCase()) {
        case "A":
            return { from: "from-green-700", to: "to-green-600", text: "text-white" };
        case "B":
            return { from: "from-green-600", to: "to-lime-500", text: "text-white" };
        case "C":
            return { from: "from-lime-500", to: "to-yellow-400", text: "text-gray-800" };
        case "D":
            return { from: "from-yellow-400", to: "to-orange-500", text: "text-white" };
        case "E":
            return { from: "from-orange-500", to: "to-red-600", text: "text-white" };
        default:
            return { from: "from-gray-500", to: "to-gray-400", text: "text-white" };
    }
};

// Nutri-Score Scale Component
export function NutriScoreScale({ selectedGrade }: { selectedGrade: string }) {
    return (
        <div className="flex-1">
            <div className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                Grade Scale
            </div>
            {/* Continuous color bar */}
            <div className="relative h-12 w-full max-w-[90%] mx-auto rounded-xl overflow-hidden mb-2 shadow-lg">
                {/* Background gradient */}
                <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-gradient-to-r from-green-700 to-green-600"></div>
                    <div className="flex-1 bg-gradient-to-r from-green-600 to-lime-500"></div>
                    <div className="flex-1 bg-gradient-to-r from-lime-500 to-yellow-400"></div>
                    <div className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                    <div className="flex-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
                </div>

                {/* Grade letters */}
                <div className="absolute inset-0 flex">
                    {["A", "B", "C", "D", "E"].map((grade, index) => (
                        <div
                            key={grade}
                            className={`flex-1 flex items-center justify-center font-bold text-sm transition-all ${grade === selectedGrade ? "scale-110 drop-shadow-2xl" : "opacity-60"
                                } ${index <= 1 ? "text-white" : index === 2 ? "text-gray-800" : "text-white"}`}
                        >
                            {grade}
                        </div>
                    ))}
                </div>

                {/* Highlight indicator for selected grade */}
                {selectedGrade && (
                    <div
                        className="absolute top-0 bottom-0 border-4 border-white rounded-xl transition-all"
                        style={{
                            left: `${["A", "B", "C", "D", "E"].indexOf(selectedGrade) * 20}%`,
                            width: "20%",
                        }}
                    />
                )}
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-2">
                <span>✓ Best Quality</span>
                <span>Worst Quality ✗</span>
            </div>
        </div>
    );
}
