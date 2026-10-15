import pytest

from app.api.mappers.news import map_alertas, map_temas

@pytest.mark.parametrize(
    "answer, esperado",
    [
        (
            {
                "tema": {
                    "probabilities": {
                        "salud": 0.1,
                        "deporte": 0.7,
                        "cultura": 0.2,
                    }
                }
            },
            ["deporte", 0.7],
        ),
    ],
)

def test_map_temas(answer, esperado):
    resultado = map_temas(answer)
    assert resultado[0] == esperado

@pytest.mark.parametrize(
    "answer, esperado",
    [
        (
            {
                "alerta_miedo": {"noul": 0.85},
                "alerta_clickbait": {"noul": 0.45},
                "tono_x_pos": {"noul": 0.50},
            },
            [["miedo", 0.85], ["clickbait", 0.45]]
        )
    ]
)
def test_map_alertas(answer, esperado):
    resultado = map_alertas(answer)
    assert resultado == esperado