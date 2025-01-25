from fastapi import FastAPI
from supabase import create_client, Client

app = FastAPI()
supabase: Client = create_client("https://ocajouluyegepogyqcyn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jYWpvdWx1eWVnZXBvZ3lxY3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4Mzg5OTgsImV4cCI6MjA1MzQxNDk5OH0.zlRK2kGdlOSTxHf9g9u819M0kDXRr3pnGGdcg3uN0_M")

@app.get("/")
async def root():
    return {"message": "MealPlannerAI Backend Running!"}
