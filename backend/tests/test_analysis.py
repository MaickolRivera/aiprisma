from fastapi.testclient import TestClient
from app.main import app

def test_analysis_rechaza_body_corto():
    client = TestClient(app)
    respuesta = client.post("/analysis", json={"new": "Titular", "body": "noticia con poco texto"})
    assert respuesta.status_code == 422