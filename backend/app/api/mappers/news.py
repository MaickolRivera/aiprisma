"""Arma la respuesta completa del análisis a partir de las respuestas de Laya."""

from app.api.mappers.layers import map_layers

def map_temas(answers: dict) -> list:
    """Temas ordenados de mayor a menor ...]."""
    probabilities = answers["tema"]["probabilities"]
    
    # .items() da pares (tema, probabilidad); se ordenan por la probabilidad (posición 1).
    ordenados = sorted(probabilities.items(), key=lambda par: par[1], reverse=True)

    return [[tema, round(prob, 2)] for tema, prob in ordenados][:5]

def map_alertas(answers: dict) -> list:
    """Alertas de mayor a menor ...]."""
    alertas = [
        [nombre.removeprefix("alerta_"), round(respuesta["noul"], 2)]
        for nombre, respuesta in answers.items()
        if nombre.startswith("alerta_")
    ]
    return sorted(alertas, key=lambda par: par[1], reverse=True)[:5]

def map_news(answers: dict) -> dict:
    """Respuesta final de /analysis."""
    return {
        "values": map_layers(answers),
        "temas": map_temas(answers),
        "alertas": map_alertas(answers),
    }
