from fastapi import FastAPI
from supabase import create_client, Client

app = FastAPI()
supabase: Client = create_client("https://your-project-url.supabase.co", "your-anon-key")

@app.get("/")
async def root():
    return {"message": "MealPlannerAI Backend Running!"}
