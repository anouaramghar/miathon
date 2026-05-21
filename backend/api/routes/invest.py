from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pipeline import create_job, run_invest_pipeline, stream_job

router = APIRouter()

class AnalyzeRequest(BaseModel):
    profile: str
    city: str
    neighborhood: str = ""
    budget: str

@router.post("/analyze")
async def analyze(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    job_id = create_job()
    background_tasks.add_task(run_invest_pipeline, job_id, request.model_dump())
    return {"job_id": job_id}

@router.get("/stream/{job_id}")
async def stream(job_id: str):
    return StreamingResponse(
        stream_job(job_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
