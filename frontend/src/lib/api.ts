import type { AnalysisRequest, AnalysisResponse } from "@/types";

const API_URL = import.meta.env.VITE_API_URL_LOCAL

export async function postAnalysis(payload: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await fetch(`${API_URL}/analysis`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 422) {
            throw new Error("La noticia es muy corta: el cuerpo necesita al menos 300 caracteres.");
        }
        throw new Error(`Error del servidor (${response.status})`);
    }

    const data: AnalysisResponse = await response.json();
    return data;
}