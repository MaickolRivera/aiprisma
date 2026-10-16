export type LayerId = "politica" | "intencion" | "tono" | "sustento";

export interface Layer {
  id: LayerId;
  name: string;
  color: string;
  x: [string, string];
  y: [string, string];
  description: string;
}

export interface LayerReading {
  x: number;
  y: number;
  c: number;
}

export interface AnalysisRequest {
  new: string
  body: string;
}

export interface AnalysisResponse {
  values: Record<LayerId, LayerReading>;
  temas: [string, number][];
  alertas: [string, number][];
}

export interface News extends AnalysisResponse {
  id: string;
  headline: string;
  body: string;
}
