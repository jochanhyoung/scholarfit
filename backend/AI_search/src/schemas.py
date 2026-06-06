from pydantic import BaseModel, Field
from typing import Optional


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=300)
    grade: int = Field(default=1, ge=1, le=10)
    gpa: float = Field(default=0.0, ge=0.0, le=4.5)
    income_decile: int = Field(default=10, ge=1, le=10)
    is_new: bool = False
    region_id: Optional[int] = None
    city: Optional[str] = Field(default=None, max_length=20)
    district: Optional[str] = Field(default=None, max_length=30)
    degree_level: str = "학부"
    gender: Optional[str] = None


class ScholarshipResult(BaseModel):
    scholarship_id: str
    title: str
    organization: str
    qualification: str
    amount: str
    deadline: str
    required_docs: str
    score: float
    source_url: Optional[str] = None
    ai_comment: Optional[str] = None


class SearchResponse(BaseModel):
    results: list[ScholarshipResult]
