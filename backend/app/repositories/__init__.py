from app.repositories.user_repository import UserRepository
from app.repositories.record_repository import RecordRepository
from app.repositories.consent_repository import ConsentRepository
from app.repositories.access_request_repository import AccessRequestRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.research_repository import ResearchRepository

__all__ = [
    "UserRepository",
    "RecordRepository",
    "ConsentRepository",
    "AccessRequestRepository",
    "PredictionRepository",
    "ResearchRepository",
]
