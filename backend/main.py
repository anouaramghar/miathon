from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import invest, radar

app = FastAPI(title="InvestMap Maroc API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invest.router, prefix="/api")
app.include_router(radar.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
