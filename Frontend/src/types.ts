// TypeScript type definitions for backend API responses

export interface AnalysisResponse {
    status: string;
    input: InputInfo;
    product: ProductInfo;
    marketing: MarketingInfo;
    images: ImagesData;
    nutrition: NutritionData;
    verdict: VerdictInfo;
    overall_score: OverallScore;
    nutrition_score: NutritionScore;
    key_takeaways: KeyTakeaways;
    age_suitability: AgeSuitability;
    health_suitability: HealthSuitability;
    ai_opinion: AIOpinion;
    meta: MetaData;
}

export interface InputInfo {
    product_name: string;
    input_type: "image" | "text";
    image_provided: boolean;
}

export interface ProductInfo {
    name: string;
    brand: string;
    category: string;
    country: string;
}

export interface MarketingInfo {
    labels: string[];
    claims: string[];
}

export interface ImagesData {
    input_image: any;
    reference_images: string[];
    source: string;
}

export interface NutritionData {
    per_100g: NutritionPer100g;
    source_url: string;
    data_confidence: string;
}

export interface NutritionPer100g {
    energy_kcal: number;
    protein_g: number;
    carbs_g: number;
    sugar_g: number;
    fat_g: number;
    sat_fat_g: number;
    sodium_mg: number;
}

export interface VerdictInfo {
    label: "safe" | "occasionally_safe" | "not_safe";
    headline: string;
    subtext: string;
}

export interface OverallScore {
    percent: number;
    interpretation: string;
}

export interface NutritionScore {
    grade: "A" | "B" | "C" | "D" | "E";
}

export interface KeyTakeaways {
    possible_concern: string;
    generally_safe: string;
    depends_on_use: string;
}

export interface AgeSuitability {
    children_0_12: string;
    young_12_45: string;
    adults_45_plus: string;
}

export interface HealthSuitability {
    diabetes: string;
    heart: string;
    weight: string;
    normal: string;
}

export interface AIOpinion {
    text: string;
}

export interface MetaData {
    data_source: string;
    analysis_type: string;
    confidence_level: string;
}
