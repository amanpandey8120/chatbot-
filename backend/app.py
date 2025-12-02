from dotenv import load_dotenv
load_dotenv()

# backend/app.py
import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from chatbot import QA

app = FastAPI()

# Allow requests from your frontend origin (change http://localhost:5500 or your frontend host)
origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5500"),
    "http://127.0.0.1:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

@app.post("/chat")
def chat(q: Query):
    answer = QA.run(q.question)
    return {"answer": answer}
