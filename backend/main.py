from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import applications, auth, score

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Credit Risk Scoring Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(score.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "credit-risk-fastapi", "version": "2.0.0"}
