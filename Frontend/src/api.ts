import { AnalysisResponse } from "./types";

// API base URL - change this if backend runs on different host/port
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Analyzes a product by name or image
 * @param productName - Optional product name to search
 * @param imageFile - Optional image file to analyze
 * @returns Promise with analysis response
 */
export async function analyzeProduct(
    productName?: string,
    imageFile?: File
): Promise<AnalysisResponse> {
    // Build FormData for multipart/form-data request
    const formData = new FormData();

    if (productName) {
        formData.append("product_name", productName);
    }

    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `API request failed: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        const data: AnalysisResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to analyze product: ${error.message}`);
        }
        throw new Error("Failed to analyze product: Unknown error");
    }
}
