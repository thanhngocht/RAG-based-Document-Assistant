from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.controllers import admin_controller, auth_controller, chat_controller, conversation_controller
from app.database.mongo import init_mongo, close_mongo

app = FastAPI(title=settings.app_name)

# Configure CORS - Allow all localhost ports for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server (default)
        "http://localhost:5174",  # Vite dev server (alternative port)
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)


@app.on_event("startup")
async def startup_event():
    init_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo()

app.include_router(admin_controller.router, prefix=f"{settings.api_prefix}")
app.include_router(auth_controller.router, prefix=f"{settings.api_prefix}")
app.include_router(chat_controller.router, prefix=f"{settings.api_prefix}")
app.include_router(conversation_controller.router, prefix=f"{settings.api_prefix}")


@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI backend!"}

@app.get("/health")
async def health():
    return {"status": "ok"}