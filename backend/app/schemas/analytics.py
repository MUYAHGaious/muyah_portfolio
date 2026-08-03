from datetime import date

from pydantic import BaseModel, Field


class CollectRequest(BaseModel):
    path: str = Field(min_length=1, max_length=500)
    referrer: str = Field(default="", max_length=500)


class DailyCount(BaseModel):
    day: date
    views: int
    visitors: int


class LabelCount(BaseModel):
    label: str
    count: int


class AnalyticsSummary(BaseModel):
    range_days: int
    total_views: int
    total_visitors: int
    daily: list[DailyCount]
    top_paths: list[LabelCount]
    top_referrers: list[LabelCount]
    devices: list[LabelCount]
