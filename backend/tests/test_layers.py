import pytest
from app.api.mappers.layers import axis_value, map_layer

# Eje de un polo (tono_x): valor = 2 * P(pos) - 1
@pytest.mark.parametrize("pos, esperado", [
    (0.0, -1.0),   # nada sensacionalista -> polo sobrio
    (0.5, 0.0),    # el modelo no sabe    -> centro
    (1.0, 1.0),    # muy sensacionalista  -> polo sensacionalista
    (0.9, 0.8),
])
def test_axis_value_un_polo(pos, esperado):
    answers = {"tono_x_pos": {"noul": pos}}

    assert axis_value(answers, "tono_x") == pytest.approx(esperado)

# Eje de dos polos (tono_y): valor = P(pos) - P(neg)
@pytest.mark.parametrize("neg, pos, esperado", [
    (0.0, 0.0, 0.0),     # ni esperanza ni miedo -> centro
    (0.0, 1.0, 1.0),     # solo miedo            -> polo miedo
    (1.0, 0.0, -1.0),    # solo esperanza        -> polo esperanza
    (0.53, 0.0, -0.53),  # la noticia del Mundial
])
def test_axis_value_dos_polos(neg, pos, esperado):
    answers = {
        "tono_y_neg": {"noul": neg},
        "tono_y_pos": {"noul": pos},
    }

    assert axis_value(answers, "tono_y") == pytest.approx(esperado)

# Comprobar que se multiplica el promedio de los ejes con el parametro de politica aplica
def test_politica_c_por_aplica():
    answers = {
        "politica_x_neg": {"noul": 0.0, "confidence": 1.0},
        "politica_x_pos": {"noul": 0.0, "confidence": 1.0},
        "politica_y_neg": {"noul": 0.0, "confidence": 1.0},
        "politica_y_pos": {"noul": 0.0, "confidence": 1.0},
        "politica_aplica": {"noul": 0.5},
    }

    resultado = map_layer(answers, "politica")

    assert resultado["c"] == 0.5