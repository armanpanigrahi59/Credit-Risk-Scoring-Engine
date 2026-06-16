from fastapi import APIRouter, HTTPException

from schemas import ApplicantInput, ScoreResult
from scoring import score_application

router = APIRouter(prefix="/score", tags=["score"])


@router.post("", response_model=ScoreResult)
def score(payload: ApplicantInput):
    try:
        return score_application(payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
