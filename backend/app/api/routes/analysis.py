from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from app.questions.laya import QUESTIONS
from app.api.mappers.news import map_news

router = APIRouter()

class NewsIn(BaseModel):
    new: str
    body: str = Field(min_length=300)

@router.post("/analysis")
def analyze(news: NewsIn, request: Request):
    model = request.app.state.laya
    result = model.predict(news.model_dump(), QUESTIONS)
    return map_news(result["answers"])