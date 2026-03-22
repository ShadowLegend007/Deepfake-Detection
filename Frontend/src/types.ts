export type MediaType = "image" | "audio" | "video";

export type AuthenticityIndicator = "Authentic" | "Suspicious" | "Manipulated";

export interface AnalysisResponse {
    media_type: MediaType;
    authenticity_indicator: AuthenticityIndicator;
    trust_score: number;
    visual_evidence_base64: string;
}
