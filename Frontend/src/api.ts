import { AnalysisResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function analyzeFile(file: File): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail ?? `${response.status} ${response.statusText}`;
        throw new Error(detail);
    }

    return response.json() as Promise<AnalysisResponse>;
}
