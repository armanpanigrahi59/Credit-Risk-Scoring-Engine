from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth_utils import get_current_user
from database import get_db
from models import Application, User
from schemas import ApplicantInput, ApplicationRead
from scoring import score_application

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationRead, status_code=201)
def create_application(payload: ApplicantInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = score_application(payload)
    application = Application(
        user_id=current_user.id,
        applicant_data=payload.model_dump(),
        score_result=result.model_dump(),
        status=result.decision,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("", response_model=list[ApplicationRead])
def list_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Application).order_by(Application.created_at.desc())
    if current_user.role != "admin":
        query = query.filter(Application.user_id == current_user.id)
    return query.all()


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(application_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    if current_user.role != "admin" and application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
    return application
