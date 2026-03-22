import { motion, Variants } from "motion/react";
import {
  AlertTriangle,
  Heart,
  Baby,
  User,
  Users,
  Brain,
  Image as ImageIcon,
} from "lucide-react";
import { ProductImages } from "./ProductImages";
import { PieChart } from "./PieChart";
import { DataSourceAttribution } from "./DataSourceAttribution";
import { SourceButton } from "./SourceButton";
import { NutriScoreScale } from "./NutriScoreScale";

interface ProductResultsProps {
  data: any;
  onCheckAnother: () => void;
  searchQuery?: string;
  uploadedFile?: File | null;
  error?: string | null;
}
interface ProductInfo extends Record<string, any> {
  ingredients_text?: string;
}

export function ProductResults({
  data,
  onCheckAnother,
  searchQuery,
  uploadedFile,
  error,
}: ProductResultsProps) {
  if (!data || error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/40 backdrop-blur-xl border-2 border-red-500/30 rounded-[32px] p-12 text-center"
        >
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 text-red-400">
            Analysis Failed
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            {error ||
              "We couldn't find information about this product. Please try another one."}
          </p>

          {/* Display Uploaded Image if available */}
          {uploadedFile && (
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-2 border-border/50 shadow-2xl">
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Uploaded product"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <button
            onClick={onCheckAnother}
            className="px-8 py-4 bg-accent text-white rounded-full font-bold hover:bg-accent/90 transition-all hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const getVerdictColor = (label: string) => {
    switch (label) {
      case "safe":
        return "text-green-500 border-green-500/20 bg-green-500/10";
      case "occasionally_safe":
        return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "unsafe":
        return "text-red-500 border-red-500/20 bg-red-500/10";
      default:
        return "text-gray-500 border-gray-500/20 bg-gray-500/10";
    }
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 70) return "text-green-500";
    if (percent >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getNutritionGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case "A":
        return "bg-green-600 text-white";
      case "B":
        return "bg-lime-500 text-white";
      case "C":
        return "bg-yellow-500 text-black";
      case "D":
        return "bg-orange-500 text-white";
      case "E":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* User Search Query Display */}
      {searchQuery && (
        <motion.div
          variants={itemVariants}
          className="bg-card/40 backdrop-blur-md border-2 border-border/60 rounded-[24px] px-8 py-4 flex items-center gap-4"
        >
          <span className="text-base font-medium text-muted-foreground">
            You searched for:
          </span>
          {!uploadedFile && (
            <span className="text-xl font-bold text-foreground">
              {searchQuery}
            </span>
          )}
          {uploadedFile && (
            <div className="ml-4 flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-accent/50 shadow-lg">
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Uploaded search image"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="flex items-center gap-2 text-base text-accent font-semibold">
                <ImageIcon className="w-5 h-5" />
                Image uploaded
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Product Header */}
      <motion.div
        variants={itemVariants}
        className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-8 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
              {data.product?.brand} {data.product?.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {data.product?.category} • {data.product?.country}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Ingredients Text Section */}
      <motion.div
        variants={itemVariants}
        className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-6 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
      >
        <h3 className="text-2xl font-bold text-accent mb-4 cool-font flex items-center gap-2">
          Ingredients
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          {data.product?.ingredients_text ||
            "Ingredients information is not available for this product."}
        </p>
      </motion.div>

      {/* Main Content Grid: Image & Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image Column */}
        <motion.div variants={itemVariants} className="h-full">
          {data.images?.reference_images &&
          data.images.reference_images.length > 0 ? (
            <div className="h-full">
              <ProductImages
                images={data.images.reference_images}
                productName={`${data.product?.brand} ${data.product?.name}`}
              />
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[24px] p-6 h-full flex flex-col items-center justify-center text-muted-foreground min-h-[300px] shadow-[0_0_30px_rgba(124,58,237,0.1)]">
              <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
              <p>No product image available</p>
            </div>
          )}
        </motion.div>

        {/* Ingredients Breakdown Column */}
        <motion.div variants={itemVariants} className="h-full">
          {(() => {
            const chartData = data.nutrition?.per_100g
              ? [
                  {
                    name: "Protein",
                    value: Number(data.nutrition.per_100g?.protein_g) || 0,
                    color: "#7c3aed",
                    id: "protein",
                  },
                  {
                    name: "Carbohydrates",
                    value:
                      (Number(data.nutrition.per_100g?.carbs_g) || 0) -
                      (Number(data.nutrition.per_100g?.sugar_g) || 0),
                    color: "#8b5cf6",
                    id: "carbs",
                  },
                  {
                    name: "Fats",
                    value:
                      (Number(data.nutrition.per_100g?.fat_g) || 0) -
                      (Number(data.nutrition.per_100g?.sat_fat_g) || 0),
                    color: "#3b82f6",
                    id: "fat",
                  },
                  {
                    name: "Saturated Fats",
                    value: Number(data.nutrition.per_100g?.sat_fat_g) || 0,
                    color: "#60a5fa",
                    id: "sat_fat",
                  },
                  {
                    name: "Sugars",
                    value: Number(data.nutrition.per_100g?.sugar_g) || 0,
                    color: "#10b981",
                    id: "sugar",
                  },
                  {
                    name: "Sodium",
                    value:
                      (Number(data.nutrition.per_100g?.sodium_mg) || 0) / 1000,
                    color: "#f59e0b",
                    id: "sodium",
                  },
                ].filter((item) => item.value > 0)
              : [];

            return (
              <div className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[24px] p-6 h-full shadow-[0_0_30px_rgba(124,58,237,0.1)]">
                {chartData.length > 0 ? (
                  <PieChart title="Nutrition Breakdown" data={chartData} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[250px] text-center p-6">
                    <h3 className="text-2xl font-bold text-accent mb-2 cool-font">
                      Nutrition Breakdown
                    </h3>
                    <p>Detailed nutrition data not available.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      </div>

      {/* Verdict & Overall Score Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Verdict */}
        <div className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-6 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
          <h3 className="text-3xl font-bold text-accent mb-6 cool-font flex items-center gap-3">
            Verdict
          </h3>
          {data.verdict ? (
            <>
              <div
                className={`inline-block px-4 py-2 rounded-full font-bold text-base border-2 ${getVerdictColor(
                  data.verdict?.label
                )}`}
              >
                {data.verdict?.headline}
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {data.verdict?.subtext}
              </p>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center h-[150px]">
              <p>Verdict not available</p>
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-6 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.1)]">
          <h3 className="text-3xl font-bold text-accent mb-6 cool-font flex items-center gap-3">
            Overall Score
          </h3>
          {data.overall_score ? (
            <>
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      42 *
                      (1 - (data.overall_score?.percent || 0) / 100)
                    }`}
                    className={getScoreColor(data.overall_score?.percent || 0)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-2xl font-bold ${getScoreColor(
                      data.overall_score?.percent || 0
                    )}`}
                  >
                    {data.overall_score?.percent}%
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-center mt-3 text-sm">
                {data.overall_score?.interpretation}
              </p>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center h-[120px]">
              <p>Score not available</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Nutri-Score Section (OpenFoodFacts Style) */}
      {data.nutrition_score && (
        <motion.div
          variants={itemVariants}
          className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[24px] p-5 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
        >
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-3xl font-bold text-accent mb-2 cool-font flex items-center gap-3">
                Nutrition Score
              </h3>
              <p className="text-xs text-muted-foreground">By OpenFoodFacts</p>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Large Grade Letter - YOUR RESULT */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Your Result
                </div>
                <div
                  className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold shadow-xl border-4 ${getNutritionGradeColor(
                    data.nutrition_score?.grade || "N/A"
                  )}`}
                >
                  {data.nutrition_score?.grade}
                </div>
              </div>

              <NutriScoreScale
                selectedGrade={data.nutrition_score?.grade || ""}
              />
            </div>

            {/* Data Confidence & Source */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-border/40">
              {data.nutrition?.data_confidence && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border-2 ${
                    data.nutrition.data_confidence.toLowerCase() === "high"
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : data.nutrition.data_confidence.toLowerCase() ===
                        "medium"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  }`}
                >
                  {data.nutrition.data_confidence} Confidence
                </span>
              )}
              <SourceButton
                url={data.nutrition?.source_url}
                sourceName="OpenFoodFacts"
                label="View Source"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Takeaways Row */}
      <motion.div
        variants={itemVariants}
        className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-8 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
      >
        <h3 className="text-3xl font-bold text-accent mb-8 cool-font flex items-center gap-3">
          Key Takeaways
        </h3>
        {data.key_takeaways ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.key_takeaways.possible_concern && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Possible Concern
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.key_takeaways.possible_concern}
                </p>
              </div>
            )}
            {data.key_takeaways.generally_safe && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2 text-green-400 font-bold text-sm">
                  <Heart className="w-4 h-4" />
                  Generally Safe
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.key_takeaways.generally_safe}
                </p>
              </div>
            )}
            {data.key_takeaways.depends_on_use && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-sm">
                  <Brain className="w-4 h-4" />
                  Depends on Use
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.key_takeaways.depends_on_use}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Key takeaways not available.</p>
          </div>
        )}
      </motion.div>

      {/* Age Suitability Row */}
      <motion.div
        variants={itemVariants}
        className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-8 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
      >
        <h3 className="text-3xl font-bold text-accent mb-8 cool-font flex items-center gap-3">
          Age Suitability
        </h3>
        {data.age_suitability ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.age_suitability.children_0_12 && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="w-5 h-5 text-accent" />
                  <span className="font-bold text-lg tech-font">
                    Children (0-12)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.age_suitability.children_0_12}
                </p>
              </div>
            )}
            {data.age_suitability.young_12_45 && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-accent" />
                  <span className="font-bold text-lg tech-font">
                    Young Adults (12-45)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.age_suitability.young_12_45}
                </p>
              </div>
            )}
            {data.age_suitability.adults_45_plus && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="font-bold text-lg tech-font">
                    Adults (45+)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.age_suitability.adults_45_plus}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Age suitability data not available.</p>
          </div>
        )}
      </motion.div>

      {/* Health Suitability Row */}
      <motion.div
        variants={itemVariants}
        className="bg-card/40 backdrop-blur-xl border-2 border-border/60 rounded-[28px] p-8 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
      >
        <h3 className="text-3xl font-bold text-accent mb-8 cool-font flex items-center gap-3">
          Health Suitability
        </h3>
        {data.health_suitability ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.health_suitability.diabetes && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="font-bold mb-2 text-accent text-lg tech-font">
                  🩺 Diabetes
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.health_suitability.diabetes}
                </p>
              </div>
            )}
            {data.health_suitability.heart && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="font-bold mb-2 text-accent text-lg tech-font">
                  ❤️ Heart Health
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.health_suitability.heart}
                </p>
              </div>
            )}
            {data.health_suitability.weight && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="font-bold mb-2 text-accent text-lg tech-font">
                  ⚖️ Weight Management
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.health_suitability.weight}
                </p>
              </div>
            )}
            {data.health_suitability.normal && (
              <div className="bg-background/40 border border-border/50 rounded-[20px] p-4">
                <div className="font-bold mb-2 text-accent text-lg tech-font">
                  ✅ Normal Health
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.health_suitability.normal}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Health suitability data not available.</p>
          </div>
        )}
      </motion.div>

      {/* AI Opinion Row */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-accent/20 rounded-[24px] p-6 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
      >
        <h3 className="text-3xl font-bold text-accent mb-4 cool-font flex items-center gap-3">
          <Brain className="w-8 h-8" />
          AI Opinion
        </h3>
        <p className="text-foreground leading-relaxed text-sm">
          {data.ai_opinion?.text || "AI opinion not available."}
        </p>
      </motion.div>

      {/* Data Source Attribution */}
      {data.meta && (
        <DataSourceAttribution
          dataSource={data.meta.data_source}
          confidenceLevel={data.meta.confidence_level}
          sourceUrl={data.nutrition?.source_url}
        />
      )}

      <p className="text-text-secondary max-w-xl opacity-70 mx-auto my-10 text-sm text-center">
        ⚠️ I may make mistakes. Please double-check the label if needed.
      </p>

      {/* Check Another Button */}
      <motion.div variants={itemVariants} className="flex justify-center pt-6">
        <button
          onClick={onCheckAnother}
          className="px-8 py-4 bg-accent/80 backdrop-blur-xl hover:bg-accent text-white rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl"
        >
          Check Another Product
        </button>
      </motion.div>
    </motion.div>
  );
}
