import type { AnalysisRequest, AnalysisResponse } from "@/types";
import { postAnalysis } from "@/lib/api";
import { analyzeInBrowser } from "@/lib/laya/engine";

export const ANALYSIS_MODE: "browser" | "api" = import.meta.env.VITE_ANALYSIS_MODE === "api" ? "api" : "browser";

export function analyze(payload: AnalysisRequest): Promise<AnalysisResponse> {
  return ANALYSIS_MODE === "api" ? postAnalysis(payload) : analyzeInBrowser(payload);
}
