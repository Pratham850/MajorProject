import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

env_path = Path("c:/AlphaProjects/MajorProject/.env")
load_dotenv(dotenv_path=env_path)

key = os.getenv("GEMINI_API_KEY")
if key:
    clean_key = key.strip().strip("\"'")
    genai.configure(api_key=clean_key)
    model = genai.GenerativeModel("gemini-flash-latest")
    res = model.generate_content("Reply with SUCCESS")
    print(res.text.strip())
else:
    print("GEMINI_API_KEY is not configured.")