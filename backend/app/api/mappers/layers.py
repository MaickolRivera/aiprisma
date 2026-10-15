"""Convierte las respuestas de Laya en la posición de cada capa: {"x", "y", "c"}."""

from app.questions.laya import EJES
CAPAS = ["politica", "intencion", "tono", "sustento"]

def axis_value(answers: dict, eje: str) -> float:
    """Valor de un eje entre -1 y 1"""
    neg_question, _ = EJES[eje]
    pos = answers[f"{eje}_pos"]["noul"]

    if neg_question is None:                 # eje de un polo
        return 2 * pos - 1

    neg = answers[f"{eje}_neg"]["noul"]      # eje de dos polos
    return pos - neg

def axis_confidence(answers: dict, eje: str) -> float:
    """Promedio de la "confidence" de las preguntas de un eje (1 o 2)."""
    # Busca las llaves que existan para este eje: "tono_x_pos" y, si hay, "tono_x_neg".
    keys = [f"{eje}_pos", f"{eje}_neg"]
    confidences = [answers[k]["confidence"] for k in keys if k in answers]
    return sum(confidences) / len(confidences)

def map_layer(answers: dict, capa: str) -> dict:
    """Posición de una capa, por ejemplo "tono" -> {"x": 0.8, "y": 0.41, "c": 0.79}."""
    x = axis_value(answers, f"{capa}_x")
    y = axis_value(answers, f"{capa}_y")

    # La confianza de la capa es el promedio de la confianza de sus dos ejes.
    c = (axis_confidence(answers, f"{capa}_x") + axis_confidence(answers, f"{capa}_y")) / 2

    # Si la noticia no trata un tema político, la capa Política no es confiable
    # aunque el modelo haya respondido con seguridad.
    if capa == "politica":
        c *= answers["politica_aplica"]["noul"]

    return {"x": round(x, 2), "y": round(y, 2), "c": round(c, 2)}

def map_layers(answers: dict) -> dict:
    """Repite map_layer para las 4 capas"""
    return {capa: map_layer(answers, capa) for capa in CAPAS}