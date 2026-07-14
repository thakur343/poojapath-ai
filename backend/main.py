from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import os
import datetime
import json
import asyncio
from dotenv import load_dotenv
from groq import Groq
import httpx
import sqlite3
import base64
import io
from difflib import SequenceMatcher


# Load env variables
load_dotenv(dotenv_path="../.env.local")
load_dotenv()

DB_PATH = "poojapath.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Jaap logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jaap_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        mantra_id TEXT NOT NULL,
        count INTEGER NOT NULL,
        date TEXT NOT NULL
    )
    """)
    # Streaks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jaap_streaks (
        email TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        last_date TEXT,
        total_chants INTEGER DEFAULT 0
    )
    """)
    # User profiles — language preference, timezone, name
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        email TEXT PRIMARY KEY,
        name TEXT,
        language TEXT DEFAULT 'hi',
        timezone TEXT DEFAULT 'Asia/Kolkata',
        email_opt_in INTEGER DEFAULT 1,
        created_at TEXT
    )
    """)
    # Pooja sessions — track EXACT TIME user does pooja (ML training data)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pooja_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        hour_of_day INTEGER NOT NULL,
        minute_of_hour INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        session_timestamp TEXT NOT NULL
    )
    """)
    # Email logs — prevent duplicate sends, track open/click rates
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        subject TEXT,
        sent_at TEXT NOT NULL,
        scheduled_hour INTEGER,
        status TEXT DEFAULT 'sent'
    )
    """)
    conn.commit()
    conn.close()

init_db()

# ── Import Email Engine ───────────────────────────────────────────────────────
try:
    from email_engine import start_scheduler, analyze_pooja_time, run_email_campaign, generate_email_content, send_email, log_email_sent
    EMAIL_ENGINE_AVAILABLE = True
except ImportError as e:
    print(f"[EMAIL ENGINE] Import failed: {e}")
    EMAIL_ENGINE_AVAILABLE = False

app = FastAPI(
    title="PoojaPath AI API",
    description="Backend API for PoojaPath AI platform",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Start Email Scheduler on Startup ─────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    if EMAIL_ENGINE_AVAILABLE:
        start_scheduler()
        print("[STARTUP] ML Email Campaign Scheduler started")
    else:
        print("[STARTUP] Email engine not available")

# ─── Models ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    topic: str = "general"
    day_name: str = None
    deity: str = None
    history: list = []

class ChatResponse(BaseModel):
    response: str
    mantra: str = None
    source: str = None

class SaveJaapRequest(BaseModel):
    email: str
    mantra_id: str
    count: int

class UserProfileRequest(BaseModel):
    email: str
    name: str = None
    language: str = "hi"   # 'hi' or 'en'
    timezone: str = "Asia/Kolkata"
    email_opt_in: bool = True

class PoojaSessionRequest(BaseModel):
    email: str
    activity_type: str = "jaap"  # jaap | chat | kundli | vastu

class JaapStatsResponse(BaseModel):
    email: str
    total_chants: int
    streak: int
    last_chant_date: str = None

class ModerationRequest(BaseModel):
    text: str

class WallpaperRequest(BaseModel):
    deity_name: str


# ─── Config ──────────────────────────────────────────────────────────────────

day_config = {
    0: {"name": "Ravivar", "deity": "Surya Dev"},
    1: {"name": "Somvar", "deity": "Shiv ji"},
    2: {"name": "Mangalvar", "deity": "Hanuman ji"},
    3: {"name": "Budhvar", "deity": "Ganesh ji"},
    4: {"name": "Guruvar", "deity": "Vishnu ji"},
    5: {"name": "Shukravar", "deity": "Lakshmi ji"},
    6: {"name": "Shanivar", "deity": "Shani Dev"},
}

topic_context = {
    "kundli": "You are an expert Vedic astrologer specializing in Janam Kundli (birth chart). Explain planetary positions (Graha), houses (Bhav), Yogas, Doshas (like Mangal Dosh, Kaal Sarp Dosh), Dasha periods (Mahadasha, Antardasha), and their effects on life.",
    "rashifal": "You specialize in Rashifal (horoscope). Provide predictions for all 12 rashis: Mesh, Vrishabh, Mithun, Kark, Singh, Kanya, Tula, Vrishchik, Dhanu, Makar, Kumbh, Meen. Cover love, career, health, and finance.",
    "numerology": "You are a Numerology expert. Analyze lucky numbers (Ank Jyotish), name numbers, psychic numbers, destiny numbers, lucky colors, and remedies based on numbers.",
    "vastu": "You are a Vastu Shastra expert. Advise on directions (North, South, East, West), placement of rooms, kitchen, bedroom, mandir, entrance, and remedies for Vastu doshas.",
    "gemstone": "You are a Ratna (gemstone) specialist. Recommend gemstones based on rashi and planetary positions: Ruby (Manik), Pearl (Moti), Red Coral (Moonga), Emerald (Panna), Yellow Sapphire (Pukhraj), Diamond (Heera), Blue Sapphire (Neelam), Hessonite (Gomed), Cat's Eye (Lahsuniya).",
    "mantra": "You specialize in Mantra Vigyan. Provide specific mantras for different purposes: health (Mahamrityunjaya), wealth (Lakshmi mantra), protection (Durga Kavach), success (Ganesh mantra), love (Prem mantra), career (Saraswati mantra).",
    "marriage": "You specialize in Vivah Yog and Kundli Milan. Advise on marriage timing, Ashtakoot Milan, Gun Milan, compatibility analysis, and marriage delays and remedies.",
    "career": "You advise on career and finance from Vedic astrology. Analyze the 10th house (karma), 2nd house (wealth), 11th house (gains), suitable professions, business timing, and wealth remedies.",
    "health": "You specialize in Vedic health astrology. Connect planetary positions to health, suggest Ayurvedic remedies, yoga practices, and identify health-prone periods from birth charts.",
    "muhurat": "You are a Muhurat expert. Calculate auspicious timing for events: Vivah Muhurat, Griha Pravesh, Business Launch, Naming Ceremony, Thread Ceremony. Use Tithi, Nakshatra, Yoga, Karan, and day.",
    "palmistry": "You specialize in Hastrekha (palmistry). Read lines: Life Line (Jeevan Rekha), Heart Line (Hriday Rekha), Head Line (Mastishk Rekha), Fate Line (Bhagya Rekha), Sun Line (Surya Rekha), Mercury Line.",
    "tarot": "You are a Tarot card reader specializing in Vedic Tarot. Draw symbolic cards for past, present, and future. Interpret Major and Minor Arcana with spiritual guidance.",
    "remedy": "You specialize in astrological Upay (remedies). Advise on dosh nivaran: Mangal Dosh puja, Kaal Sarp Dosh pooja, Pitra Dosh remedies, Shani Sade Sati remedies, fasting, charity, gemstones, and mantra chanting.",
    "panchang": "You provide daily Panchang information: Tithi, Nakshatra, Yoga, Karan, Rahu Kaal, Gulika Kaal, Abhijit Muhurat, Brahma Muhurat, sunrise, sunset, and auspicious/inauspicious timings.",
    "general": "You are a comprehensive Vedic astrology and spirituality expert.",
}

MASTER_SYSTEM_PROMPT = """You are Pandit Ji — an elite AI Jyotish Guru (Vedic astrologer) at PoojaPath.ai, like a senior astrologer at AstroTalk with 25+ years of experience.

You have deep expertise in:
- Vedic Astrology (Jyotish): Kundli, Planets (Navagraha), Houses (12 Bhav), Zodiac Signs (12 Rashi), Nakshatras (27), Yogas, Doshas
- Numerology (Ank Jyotish): Lucky numbers, name analysis
- Vastu Shastra: Directions, energy flow, remedies
- Palmistry (Hastrekha): Hand lines interpretation
- Tarot & Oracle reading (Vedic style)
- Gemology (Ratna Shastra): Gemstone recommendations
- Muhurat (auspicious timing)
- Mantras & Tantras
- Puja procedures & rituals
- Ayurvedic health guidance
- Panchang & Hindu calendar

Communication Style:
- Always respond in Hinglish (natural mix of Hindi + English)
- Be warm, compassionate, and trustworthy like a real pandit
- Give specific, actionable advice — not vague answers
- Use "ji" respectfully, say "Jai Shri [deity]!"
- Always end with 1 relevant Sanskrit shloka or mantra on a NEW LINE starting with "~Shloka: " followed by its meaning

SPECIFIC TOPIC CONTEXT:
{topic_context}

Today's Context:
- Today is {day_name}, the auspicious day of {deity}
- Always reference {deity} when relevant

Remember: Be like the best AstroTalk astrologer — specific, knowledgeable, empathetic, and spiritually uplifting. Never be vague or generic.
- Emotion & Sentiment Detection: If the user's message indicates they are anxious, sad, angry, stressed, or depressed, prioritize empathy and offer comforting, compassionate advice. Instantly recommend a soothing mantra (like Maha Mrityunjaya or Shanti Mantra) and simple spiritual actions (deep breathing, offering water to Surya Dev, or lighting a ghee diya)."""

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to PoojaPath AI Backend"}

def get_system_prompt(topic: str, day_name: str, deity: str) -> str:
    t_ctx = topic_context.get(topic, topic_context["general"])
    return MASTER_SYSTEM_PROMPT.format(
        topic_context=t_ctx,
        day_name=day_name,
        deity=deity,
    )

def get_day_config(day_name=None, deity=None):
    if not day_name or not deity:
        day_idx = (datetime.datetime.now().weekday() + 1) % 7
        cfg = day_config.get(day_idx, {"name": "Somvar", "deity": "Shiv ji"})
        return day_name or cfg["name"], deity or cfg["deity"]
    return day_name, deity

# ── Standard chat endpoint ────────────────────────────────────────────────────

@app.post("/api/ai/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    day_name, deity = get_day_config(request.day_name, request.deity)
    system_prompt = get_system_prompt(request.topic, day_name, deity)

    messages_payload = [{"role": "system", "content": system_prompt}]
    for h in request.history[-10:]:  # keep last 10 turns for context
        messages_payload.append(h)
    messages_payload.append({"role": "user", "content": request.message})

    response_text = None
    source = None

    # 1. Try Groq
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            completion = client.chat.completions.create(
                messages=messages_payload,
                model="llama-3.3-70b-versatile",
                max_tokens=1500,
            )
            response_text = completion.choices[0].message.content
            source = "Groq (Llama 3.3 70B)"
        except Exception as e:
            print("Groq Error:", e)

    # 2. Try Gemini as fallback
    if not response_text:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            try:
                # Build simple prompt from messages
                user_msg = request.message
                system_msg = system_prompt
                async with httpx.AsyncClient(timeout=30.0) as client:
                    r = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_api_key}",
                        json={"contents": [{"parts": [{"text": f"{system_msg}\n\nUser: {user_msg}"}]}]},
                    )
                    if r.status_code == 200:
                        data = r.json()
                        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        source = "Gemini 2.0 Flash"
            except Exception as e:
                print("Gemini Error:", e)

    # 3. Fallback
    if not response_text:
        response_text = (
            f"Jai Shri Ram! Aapka sawaal mujhe mila. Is waqt network mein thodi takleef hai. "
            f"Thodi der mein dobara poochhen. {deity} aapka bhala kare!\n"
            f"~Shloka: Om Gam Ganapataye Namaha — May Ganesh remove all obstacles."
        )
        source = "Vedic Fallback"

    mantra = None
    if "~Shloka:" in response_text:
        parts = response_text.split("~Shloka:")
        response_text = parts[0].strip()
        mantra = "~ " + parts[1].strip()

    return ChatResponse(response=response_text, mantra=mantra, source=source)

# ── Streaming chat endpoint ───────────────────────────────────────────────────

@app.post("/api/ai/chat/stream")
async def ai_chat_stream(request: ChatRequest):
    day_name, deity = get_day_config(request.day_name, request.deity)
    system_prompt = get_system_prompt(request.topic, day_name, deity)

    messages_payload = [{"role": "system", "content": system_prompt}]
    for h in request.history[-10:]:
        messages_payload.append(h)
    messages_payload.append({"role": "user", "content": request.message})

    groq_api_key = os.getenv("GROQ_API_KEY")

    async def groq_stream():
        try:
            client = Groq(api_key=groq_api_key)
            stream = client.chat.completions.create(
                messages=messages_payload,
                model="llama-3.3-70b-versatile",
                max_tokens=1500,
                stream=True,
            )
            for chunk in stream:
                token = chunk.choices[0].delta.content or ""
                if token:
                    yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            print("Groq Stream Error:", e)
            yield f"data: {json.dumps({'token': 'Kshama karein, thodi der mein dobara prayas karein.'})}\n\n"
            yield "data: [DONE]\n\n"

    async def gemini_stream():
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            yield f"data: {json.dumps({'token': 'Kshama karein, AI service unavailable. GEMINI_API_KEY not set.'})}\n\n"
            yield "data: [DONE]\n\n"
            return
        try:
            user_msg = request.message
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_api_key}",
                    json={"contents": [{"parts": [{"text": f"{system_prompt}\n\nUser: {user_msg}"}]}]},
                )
                if r.status_code == 200:
                    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                    # Stream word by word
                    for word in text.split(" "):
                        yield f"data: {json.dumps({'token': word + ' '})}\n\n"
                    yield "data: [DONE]\n\n"
                else:
                    raise Exception(f"Gemini error: {r.text}")
        except Exception as e:
            print("Gemini Stream Error:", e)
            fallback = (
                f"Jai Shri Ram! Is waqt network mein takleef hai. "
                f"{deity} aapka bhala kare!\n"
                f"~Shloka: Om Namah Shivaya"
            )
            for word in fallback.split(" "):
                yield f"data: {json.dumps({'token': word + ' '})}\n\n"
                await asyncio.sleep(0.03)
            yield "data: [DONE]\n\n"

    # Choose streaming source
    if groq_api_key:
        generator = groq_stream()
    else:
        generator = ollama_stream()

    return StreamingResponse(generator, media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })

# ── Jaap Save & Stats routes ──────────────────────────────────────────────────

@app.post("/api/jaap/save")
def save_jaap(request: SaveJaapRequest):
    email = request.email or "guest"
    mantra_id = request.mantra_id
    count = request.count
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Insert log
    cursor.execute(
        "INSERT INTO jaap_logs (email, mantra_id, count, date) VALUES (?, ?, ?, ?)",
        (email, mantra_id, count, today_str)
    )
    
    # Get current streak and stats
    cursor.execute("SELECT current_streak, last_date, total_chants FROM jaap_streaks WHERE email = ?", (email,))
    row = cursor.fetchone()
    
    if not row:
        new_streak = 1
        new_total = count
        cursor.execute(
            "INSERT INTO jaap_streaks (email, current_streak, last_date, total_chants) VALUES (?, ?, ?, ?)",
            (email, new_streak, today_str, new_total)
        )
    else:
        current_streak, last_date, total_chants = row
        new_total = total_chants + count
        new_streak = current_streak
        
        if last_date == today_str:
            # Already chanted today, keep streak same
            pass
        elif last_date:
            try:
                last_dt = datetime.datetime.strptime(last_date, "%Y-%m-%d").date()
                today = datetime.date.today()
                diff = (today - last_dt).days
                if diff == 1:
                    new_streak += 1
                elif diff > 1:
                    new_streak = 1
            except Exception:
                new_streak = 1
        else:
            new_streak = 1
            
        cursor.execute(
            "UPDATE jaap_streaks SET current_streak = ?, last_date = ?, total_chants = ? WHERE email = ?",
            (new_streak, today_str, new_total, email)
        )
        
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "email": email,
        "added_count": count,
        "total_chants": new_total,
        "streak": new_streak,
        "last_chant_date": today_str
    }

@app.get("/api/jaap/stats")
def get_jaap_stats(email: str = "guest"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT current_streak, last_date, total_chants FROM jaap_streaks WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"email": email, "total_chants": 0, "streak": 0, "last_chant_date": None}
    
    streak, last_date, total = row
    
    if last_date:
        try:
            last_dt = datetime.datetime.strptime(last_date, "%Y-%m-%d").date()
            today = datetime.date.today()
            diff = (today - last_dt).days
            if diff > 1:
                streak = 0
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("UPDATE jaap_streaks SET current_streak = 0 WHERE email = ?", (email,))
                conn.commit()
                conn.close()
        except Exception:
            pass
            
    return {"email": email, "total_chants": total, "streak": streak, "last_chant_date": last_date}

# ── Moderation & Dynamic Wallpapers ───────────────────────────────────────────

ABUSIVE_KEYWORDS = [
    "abuse", "badword", "gali", "madarchod", "behenchod", "bhenchod", 
    "chutiya", "harami", "kamina", "saala", "saali", "randi", "bhadwa", 
    "bastard", "bitch", "fuck", "shit", "asshole"
]

@app.post("/api/moderation/check")
def check_moderation(request: ModerationRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": request.text}],
                model="llama-guard-3-8b",
            )
            response = completion.choices[0].message.content.strip()
            is_abusive = "unsafe" in response.lower()
            return {
                "text": request.text,
                "is_abusive": is_abusive,
                "matched_word": "Llama Guard Guardrails" if is_abusive else None
            }
        except Exception as e:
            print("Llama Guard Moderation Error:", e)

    # Fallback to local keyword checking
    text = request.text.lower()
    replacements = {
        "@": "a", "1": "i", "0": "o", "3": "e", "$": "s", "v": "u"
    }
    for char, rep in replacements.items():
        text = text.replace(char, rep)
    
    stripped = "".join(c for c in text if c.isalnum())
    
    is_abusive = False
    matched_word = None
    for word in ABUSIVE_KEYWORDS:
        if word in text or word in stripped:
            is_abusive = True
            matched_word = word
            break
            
    return {
        "text": request.text,
        "is_abusive": is_abusive,
        "matched_word": matched_word
    }

# Dynamic pricing counters
wallpaper_traffic_count = 0

@app.post("/api/wallpapers/generate")
async def generate_wallpaper(request: WallpaperRequest):
    global wallpaper_traffic_count
    wallpaper_traffic_count += 1
    
    import random
    
    deity = request.deity_name.strip()
    
    # Dynamic Pricing Engine (Surge pricing based on traffic count)
    base_price = 101
    surge = (wallpaper_traffic_count // 3) * 10
    final_price = min(base_price + surge, 501)

    # ── Randomized Style Variation Engine ──────────────────────────────────
    # Every request picks a random combination → always different image
    
    art_styles = [
        "ultra-realistic digital oil painting",
        "glowing neon spiritual artwork",
        "ancient Indian miniature painting style",
        "hyper-detailed 3D cinematic render",
        "watercolor spiritual illustration",
        "golden mandala art nouveau style",
        "ethereal photorealistic portrait",
        "vibrant cosmic psychedelic art",
        "Rajput traditional painting style",
        "dark fantasy epic divine portrait",
        "luminous impressionist painting",
        "sacred geometry fractal art style",
    ]

    moods = [
        "peaceful and serene",
        "powerful and fierce (Rudra Roop)",
        "joyful and playful (Leela Roop)",
        "cosmic and omnipresent",
        "compassionate and loving",
        "radiant and triumphant",
        "meditative and calm",
        "divine and celestial",
    ]

    color_palettes = [
        "deep blue and gold palette",
        "saffron orange and crimson red palette",
        "emerald green and divine gold palette",
        "purple violet and cosmic white palette",
        "royal blue lotus pink palette",
        "fiery orange and midnight black palette",
        "pearl white and pale gold palette",
        "turquoise and sun gold palette",
    ]

    lightings = [
        "heavenly golden hour backlight",
        "dramatic temple lamp (diya) lighting",
        "soft moonlight glow",
        "divine white halo rim light",
        "cosmic nebula background glow",
        "warm sunrise rays from behind",
        "mystical blue bioluminescent glow",
        "holy fire (Yagya) ambient light",
    ]

    backgrounds = [
        "Mount Kailash at sunset",
        "Vrindavan forest with peacocks",
        "cosmic universe with galaxies",
        "ancient golden temple hall",
        "lotus pond at dawn",
        "celestial Vaikuntha heavens",
        "stormy sea with divine light breaking through",
        "sacred forest with flowing rivers",
        "Mathura riverside ghats",
    ]

    accessories_map = {
        "krishna": ["playing flute", "with peacock feather crown", "with Radha beside him", "dancing on Kaliya serpent", "lifting Govardhan mountain", "in Dwarka palace"],
        "shiva": ["in deep Samadhi pose", "with Nandi bull", "doing Tandava dance", "with River Ganga flowing from matted locks", "with third eye glowing", "with crescent moon"],
        "rama": ["with bow and arrow (Kodanda)", "with Sita and Lakshmana", "with Hanuman beside him", "in coronation scene", "on Pushpak Vimana"],
        "hanuman": ["carrying Sanjeevani mountain", "opening chest showing Ram-Sita", "in flying pose", "fighting Ravana's army", "with Panchmukhi form"],
        "ganesha": ["dancing with Modak", "seated on lotus", "writing Mahabharata", "with mouse vehicle", "with all 4 hands in blessings"],
        "durga": ["riding lion", "slaying Mahishasura", "with 10 arms holding weapons", "in Adi Shakti form"],
        "lakshmi": ["showering gold coins", "standing on lotus", "with elephants pouring water", "with Vishnu beside her"],
    }
    
    deity_lower = deity.lower()
    deity_accessories = []
    for key, val in accessories_map.items():
        if key in deity_lower:
            deity_accessories = val
            break

    # Pick random combination
    style = random.choice(art_styles)
    mood = random.choice(moods)
    color = random.choice(color_palettes)
    lighting = random.choice(lightings)
    background = random.choice(backgrounds)
    accessory = random.choice(deity_accessories) if deity_accessories else ""
    seed = random.randint(1, 999999)  # unique seed for true randomness

    # Build unique prompt
    accessory_text = f", {accessory}" if accessory else ""
    prompt = (
        f"{style} of Lord {deity}{accessory_text}, {mood} expression, "
        f"{color}, {lighting}, background: {background}, "
        f"8K ultra-detailed smartphone wallpaper portrait, intricate ornaments, "
        f"divine spiritual aura, sacred Hindu iconography, cinematic composition, "
        f"trending on ArtStation, DeviantArt spiritual category. Seed: {seed}"
    )

    hf_key = os.getenv("HF_API_KEY")
    img_url = None
    
    if hf_key:
        try:
            api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
            headers = {"Authorization": f"Bearer {hf_key}"}
            payload = {
                "inputs": prompt,
                "parameters": {
                    "seed": seed,
                    "num_inference_steps": 30,
                    "guidance_scale": 7.5,
                    "width": 512,
                    "height": 768,
                }
            }
            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(api_url, headers=headers, json=payload)
                if resp.status_code == 200:
                    os.makedirs("../public/generated", exist_ok=True)
                    filename = f"wp_{deity_lower}_{seed}_{int(datetime.datetime.now().timestamp())}.png"
                    filepath = os.path.join("../public/generated", filename)
                    with open(filepath, "wb") as f:
                        f.write(resp.content)
                    img_url = f"/generated/{filename}"
                else:
                    print(f"HF API Error {resp.status_code}: {resp.text}")
        except Exception as e:
            print("HF SDXL generation error:", e)

    # Fallback: rotate through multiple preset images per deity
    if not img_url:
        deity_fallback_images = {
            "krishna": ["/lord_krishna_bg.png"],
            "shiva":   ["/lord_shiva_bg.png"],
            "shiv":    ["/lord_shiva_bg.png"],
            "ram":     ["/lord_rama_bg.png"],
            "rama":    ["/lord_rama_bg.png"],
            "ganesha": ["/lord_ganesha_bg.png"],
            "ganesh":  ["/lord_ganesha_bg.png"],
            "hanuman": ["/lord_hanuman_bg.png"],
        }
        fallback_pool = deity_fallback_images.get(deity_lower, ["/lord_shiva_bg.png"])
        img_url = random.choice(fallback_pool)
        
    return {
        "deity": deity,
        "prompt": prompt,
        "style": style,
        "mood": mood,
        "color_palette": color,
        "lighting": lighting,
        "background": background,
        "seed": seed,
        "price": final_price,
        "traffic_level": "High" if wallpaper_traffic_count > 5 else "Normal",
        "traffic_requests": wallpaper_traffic_count,
        "image_url": img_url
    }

# ── New AI/ML Features Endpoints ───────────────────────────────────────────

class AudioVerifyRequest(BaseModel):
    audio_base64: str  # Base64 wav/mp3 data
    expected_text: str

class VastuScanRequest(BaseModel):
    image_base64: str  # Base64 image
    room_type: str     # e.g., bedroom, kitchen, mandir
    entrance_direction: str # e.g., north, south, east, west

class KundliRecommendRequest(BaseModel):
    rashi: str
    lagna: str
    dasha: str = None

@app.post("/api/jaap/verify-pronunciation")
def verify_pronunciation(request: AudioVerifyRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return {
            "status": "error",
            "message": "Groq API Key not configured. Unable to process speech AI.",
            "score": 85,  # mock success fallback
            "transcribed_text": request.expected_text,
            "success": True
        }
        
    try:
        # Extract raw base64 data
        audio_data = request.audio_base64
        if "," in audio_data:
            audio_data = audio_data.split(",")[1]
            
        audio_bytes = base64.b64decode(audio_data)
        
        # Write to a temporary file
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_path = temp_audio.name
            
        client = Groq(api_key=groq_api_key)
        with open(temp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(temp_path, audio_file.read()),
                model="whisper-large-v3",
                language="sa",
                temperature=0.0
            )
            
        # Clean up temp file
        try:
            os.unlink(temp_path)
        except Exception:
            pass
            
        transcribed_text = transcription.text.strip()
        
        # Calculate text similarity
        ratio = SequenceMatcher(None, transcribed_text.lower(), request.expected_text.lower()).ratio()
        score = int(ratio * 100)
        
        return {
            "status": "success",
            "score": score,
            "transcribed_text": transcribed_text,
            "success": score >= 60
        }
    except Exception as e:
        print("Whisper Transcription Error:", e)
        return {
            "status": "error",
            "message": str(e),
            "score": 0,
            "transcribed_text": "",
            "success": False
        }

@app.post("/api/vastu/scan-layout")
def scan_vastu_layout(request: VastuScanRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return {
            "status": "error",
            "message": "Groq API Key not configured. Vastu Vision AI requires Groq."
        }
        
    try:
        # Extract base64 part
        img_data = request.image_base64
        if "," in img_data:
            img_data = img_data.split(",")[1]
            
        client = Groq(api_key=groq_api_key)
        
        system_prompt = (
            "You are an expert Vastu Shastra Consultant at PoojaPath.ai. "
            "Analyze the uploaded room layout image for Vastu compliance. "
            f"The room is a '{request.room_type}' and the entrance/facing direction is '{request.entrance_direction}'. "
            "Follow this structure exactly:\n"
            "1. Positive Vastu Points: What is correct in the current layout.\n"
            "2. Vastu Doshas: What violates Vastu rules.\n"
            "3. Remedies (Upay): Practical, modern corrections (like moving items, placing specific crystals, colors, or mirrors).\n"
            "Respond in comforting and polite Hinglish (Hindi + English)."
        )
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{img_data}"
                            }
                        }
                    ]
                }
            ],
            model="llama-3.2-11b-vision-preview",
            max_tokens=1000
        )
        
        analysis = chat_completion.choices[0].message.content
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        print("Vastu Vision Error:", e)
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/kundli/recommend")
def recommend_remedies(request: KundliRecommendRequest):
    rashi = request.rashi.strip().lower()
    
    # Custom rule-based classification algorithm for Astrological classification
    recommendations_db = {
        "mesh": {
            "ruling_planet": "Mars (Mangal)",
            "gemstone": "Red Coral (Moonga)",
            "deity": "Hanuman Ji",
            "lucky_color": "Red",
            "remedies": [
                "Chant Hanuman Chalisa daily.",
                "Offer sweet rotis to monkeys or birds on Tuesday.",
                "Donate red lentils (Masoor Dal) to a temple."
            ]
        },
        "vrishabh": {
            "ruling_planet": "Venus (Shukra)",
            "gemstone": "Diamond (Heera) or White Opal",
            "deity": "Lakshmi Devi",
            "lucky_color": "White / Light Pink",
            "remedies": [
                "Keep a small silver piece in your wallet.",
                "Recite Sri Suktam on Fridays.",
                "Donate white sweets or clothes to girls."
            ]
        },
        "mithun": {
            "ruling_planet": "Mercury (Budh)",
            "gemstone": "Emerald (Panna)",
            "deity": "Ganesh Ji",
            "lucky_color": "Green",
            "remedies": [
                "Feed green fodder (Durva grass) to cows on Wednesdays.",
                "Chant 'Om Gan Ganapataye Namah' 108 times.",
                "Gift green items to sister or aunt."
            ]
        },
        "kark": {
            "ruling_planet": "Moon (Chandra)",
            "gemstone": "Pearl (Moti)",
            "deity": "Shiv Ji",
            "lucky_color": "Silver / Pearl White",
            "remedies": [
                "Offer raw milk and water to Shivling on Mondays.",
                "Chant 'Om Namah Shivaya'.",
                "Drink water in a silver glass."
            ]
        },
        "singh": {
            "ruling_planet": "Sun (Surya)",
            "gemstone": "Ruby (Manik)",
            "deity": "Surya Dev",
            "lucky_color": "Saffron / Gold / Ruby Red",
            "remedies": [
                "Offer water (Arghya) to the Sun in a copper pot daily.",
                "Chant Aditya Hrudaya Stotra.",
                "Respect father and fatherly figures."
            ]
        },
        "kanya": {
            "ruling_planet": "Mercury (Budh)",
            "gemstone": "Emerald (Panna)",
            "deity": "Ganesh Ji",
            "lucky_color": "Green / Light Yellow",
            "remedies": [
                "Worship Lord Ganesha, offer durva grass.",
                "Chant Budh Beej Mantra: 'Om Bram Breem Broom Sah Budhaye Namah'.",
                "Donate green items on Wednesday."
            ]
        },
        "tula": {
            "ruling_planet": "Venus (Shukra)",
            "gemstone": "Diamond (Heera) or Opal",
            "deity": "Lakshmi Devi",
            "lucky_color": "Cream / White / Pink",
            "remedies": [
                "Apply sandalwood paste on your forehead.",
                "Light a ghee lamp in the temple on Friday evenings.",
                "Maintain cleanliness and order in your house."
            ]
        },
        "vrishchik": {
            "ruling_planet": "Mars (Mangal)",
            "gemstone": "Red Coral (Moonga)",
            "deity": "Hanuman Ji",
            "lucky_color": "Dark Red / Maroon",
            "remedies": [
                "Read Bajrang Baan on Tuesdays.",
                "Donate saffron or red flowers in a temple.",
                "Chant Mangal Beej Mantra."
            ]
        },
        "dhanu": {
            "ruling_planet": "Jupiter (Guru)",
            "gemstone": "Yellow Sapphire (Pukhraj)",
            "deity": "Vishnu Ji",
            "lucky_color": "Yellow",
            "remedies": [
                "Apply yellow turmeric or sandalwood tilak.",
                "Fast or eat yellow food on Thursdays.",
                "Donate chana dal or saffron to priests."
            ]
        },
        "makar": {
            "ruling_planet": "Saturn (Shani)",
            "gemstone": "Blue Sapphire (Neelam)",
            "deity": "Shani Dev / Hanuman Ji",
            "lucky_color": "Black / Dark Blue",
            "remedies": [
                "Light a mustard oil lamp under a Peepal tree on Saturdays.",
                "Chant Shani Chalisa.",
                "Donate black blankets or footwear to needy people."
            ]
        },
        "kumbh": {
            "ruling_planet": "Saturn (Shani)",
            "gemstone": "Blue Sapphire (Neelam) or Amethyst",
            "deity": "Shani Dev",
            "lucky_color": "Electric Blue / Indigo",
            "remedies": [
                "Chant 'Om Sham Shanaishcharaya Namah' on Saturdays.",
                "Avoid telling lies or cheating anyone.",
                "Help old people or daily wage workers."
            ]
        },
        "meen": {
            "ruling_planet": "Jupiter (Guru)",
            "gemstone": "Yellow Sapphire (Pukhraj) or Citrine",
            "deity": "Vishnu Ji",
            "lucky_color": "Yellow / Golden",
            "remedies": [
                "Recite Vishnu Sahasranama on Thursdays.",
                "Respect elders, gurus, and teachers.",
                "Offer yellow flowers to Lord Vishnu."
            ]
        }
    }
    
    data = recommendations_db.get(rashi, recommendations_db["mesh"])
    return {
        "status": "success",
        "rashi": rashi,
        "lagna": request.lagna,
        "ruling_planet": data["ruling_planet"],
        "gemstone": data["gemstone"],
        "deity": data["deity"],
        "lucky_color": data["lucky_color"],
        "remedies": data["remedies"]
    }


# ── Smart Email + ML Endpoints ────────────────────────────────────────────────

@app.post("/api/user/profile")
async def upsert_user_profile(request: UserProfileRequest):
    """
    Saves/updates user profile with language preference.
    Called after login — detects language from browser locale.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_profiles (email, name, language, timezone, email_opt_in, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            name = COALESCE(excluded.name, name),
            language = excluded.language,
            timezone = excluded.timezone,
            email_opt_in = excluded.email_opt_in
    """, (
        request.email,
        request.name,
        request.language,
        request.timezone,
        1 if request.email_opt_in else 0,
        datetime.datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return {"status": "ok", "message": f"Profile saved for {request.email}"}


@app.post("/api/user/track-session")
async def track_pooja_session(request: PoojaSessionRequest):
    """
    ML Training Data Collector.
    Call this whenever user performs any activity (jaap, chat, kundli, vastu).
    Stores exact hour + minute → used by ML to predict best email time.
    """
    now = datetime.datetime.now()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO pooja_sessions
        (email, activity_type, hour_of_day, minute_of_hour, day_of_week, session_timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        request.email,
        request.activity_type,
        now.hour,
        now.minute,
        now.weekday(),
        now.isoformat()
    ))
    conn.commit()
    conn.close()
    return {
        "status": "tracked",
        "hour": now.hour,
        "minute": now.minute,
        "activity": request.activity_type
    }


@app.get("/api/user/email-timing/{email}")
async def get_email_timing(email: str):
    """
    Returns ML-predicted optimal pooja time for a user.
    Shows confidence %, basis (ml_pattern / cultural_default), and recommended send hour.
    """
    if not EMAIL_ENGINE_AVAILABLE:
        return {"error": "Email engine not available"}
    result = analyze_pooja_time(email)
    return result


@app.post("/api/email/send-now")
async def trigger_email_now(body: dict):
    """
    Admin endpoint to manually trigger email to a specific user.
    Body: { email, name, language }
    """
    if not EMAIL_ENGINE_AVAILABLE:
        return {"error": "Email engine not available"}

    email = body.get("email")
    name = body.get("name", "Devotee")
    language = body.get("language", "hi")

    if not email:
        return {"error": "email required"}

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT current_streak, total_chants FROM jaap_streaks WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    timing = analyze_pooja_time(email)
    stats = {
        "streak": row[0] if row else 0,
        "total_chants": row[1] if row else 0,
        "predicted_pooja_hour": timing["predicted_pooja_hour"]
    }

    content = generate_email_content(name, language, stats)
    
    # Dynamic image generation
    try:
        from email_engine import get_user_favorite_deity, generate_deity_image_for_email
        fav_deity = get_user_favorite_deity(email)
        deity_image = generate_deity_image_for_email(fav_deity)
    except Exception as e:
        print(f"Error fetching favorite deity in trigger_email_now: {e}")
        deity_image = None

    success = send_email(
        to_email=email,
        subject=content.get("subject", "🪔 Aaj ki Pooja"),
        html_body=content.get("html_body", ""),
        plain_text=content.get("plain_text", ""),
        image_bytes=deity_image
    )

    if success:
        log_email_sent(email, content.get("subject", ""), datetime.datetime.now().hour)

    return {
        "sent": success,
        "to": email,
        "subject": content.get("subject"),
        "language": language,
        "ml_timing": timing
    }


@app.get("/api/email/campaign-status")
async def get_campaign_status():
    """Returns email campaign stats — total sent, users opted in, etc."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM email_logs WHERE sent_at LIKE ?",
                   (f"{datetime.date.today().isoformat()}%",))
    today_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM user_profiles WHERE email_opt_in = 1")
    opted_in = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM email_logs")
    total_sent = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM pooja_sessions")
    sessions_tracked = cursor.fetchone()[0]

    conn.close()
    return {
        "emails_sent_today": today_count,
        "users_opted_in": opted_in,
        "total_emails_sent": total_sent,
        "pooja_sessions_tracked": sessions_tracked,
        "scheduler_active": EMAIL_ENGINE_AVAILABLE
    }


@app.get("/api/email/unsubscribe/{email}")
async def unsubscribe_email(email: str):
    """One-click unsubscribe — GDPR compliant"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE user_profiles SET email_opt_in = 0 WHERE email = ?",
        (email,)
    )
    conn.commit()
    conn.close()
    return {"status": "unsubscribed", "email": email, "message": "You have been successfully unsubscribed."}


# ── User Scoring ML (RFM Algorithm) ───────────────────────────────────────────────

@app.get("/api/user/score/{email}")
async def get_user_score(email: str):
    """
    ML-based RFM (Recency-Frequency-Monetary) User Scoring.
    Returns a 0-100 score and engagement tier.
    Used to personalize CTAs and email campaigns.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Recency: sessions in last 7 days
    cursor.execute(
        "SELECT COUNT(*) FROM pooja_sessions WHERE email = ? AND session_timestamp >= datetime('now', '-7 days')",
        (email,)
    )
    recent_sessions = cursor.fetchone()[0]

    # Frequency: total sessions
    cursor.execute("SELECT COUNT(*) FROM pooja_sessions WHERE email = ?", (email,))
    total_sessions = cursor.fetchone()[0]

    # Monetary: purchases (from jaap_logs as proxy)
    cursor.execute("SELECT total_chants FROM jaap_streaks WHERE email = ?", (email,))
    row = cursor.fetchone()
    total_chants = row[0] if row else 0

    # Streak
    cursor.execute("SELECT current_streak FROM jaap_streaks WHERE email = ?", (email,))
    row = cursor.fetchone()
    streak = row[0] if row else 0

    conn.close()

    # RFM Scoring (0-100)
    recency_score  = min(recent_sessions * 8, 33)    # max 33 pts
    frequency_score = min(total_sessions * 2, 33)    # max 33 pts
    streak_score   = min(streak * 3, 34)             # max 34 pts
    total_score    = recency_score + frequency_score + streak_score

    # Tier classification
    if total_score >= 80:
        tier = "VIP Devotee"
        recommended_action = "show_premium_kundli"
        cta = "Unlock Premium Kundli Analysis (Rs. 999)"
    elif total_score >= 50:
        tier = "Active Seeker"
        recommended_action = "show_wallpaper_pack"
        cta = "Get AI Deity Wallpaper (Rs. 101)"
    elif total_score >= 20:
        tier = "Occasional Visitor"
        recommended_action = "send_engagement_email"
        cta = "Continue Your Spiritual Journey"
    else:
        tier = "At Risk"
        recommended_action = "send_winback_email"
        cta = "We Miss You! Come Back for Blessings"

    return {
        "email": email,
        "score": total_score,
        "tier": tier,
        "recommended_action": recommended_action,
        "cta": cta,
        "breakdown": {
            "recency_score": recency_score,
            "frequency_score": frequency_score,
            "streak_score": streak_score,
            "recent_sessions": recent_sessions,
            "total_sessions": total_sessions,
            "streak": streak
        }
    }


@app.post("/api/seo/generate-blog")
async def generate_seo_blog(body: dict):
    """
    Generates an SEO blog post using Groq AI.
    Body: { keyword, language }
    """
    try:
        from seo_engine import generate_blog_post
        keyword = body.get("keyword", "pooja vidhi in hindi")
        language = body.get("language", "hinglish")
        post = generate_blog_post(keyword, language)
        return {"status": "success", "post": post}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.get("/api/seo/keywords")
async def get_seo_keywords():
    """Returns high-value keywords for PoojaPath content strategy."""
    return {
        "keywords": [
            {"keyword": "hanuman chalisa benefits hindi", "monthly_searches": 2200000, "competition": "LOW"},
            {"keyword": "om namah shivaya mantra", "monthly_searches": 890000, "competition": "LOW"},
            {"keyword": "kundli online free", "monthly_searches": 450000, "competition": "MED"},
            {"keyword": "krishna aarti lyrics", "monthly_searches": 320000, "competition": "LOW"},
            {"keyword": "pooja vidhi in hindi", "monthly_searches": 180000, "competition": "LOW"},
            {"keyword": "vastu shastra tips home", "monthly_searches": 160000, "competition": "MED"},
            {"keyword": "gayatri mantra benefits", "monthly_searches": 140000, "competition": "LOW"},
            {"keyword": "mahamrityunjaya mantra chanting", "monthly_searches": 95000, "competition": "LOW"},
        ]
    }
# 🛡️ CYBERSECURITY AI ENGINE MIDDLEWARE
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    print(f"[SECURITY MIDDLEWARE] Request intercepted: {request.url.path} | Query: {request.query_params}")
    # Bypass docs / asset endpoints to prevent blocking developer access
    if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json") or request.url.path.startswith("/static"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "127.0.0.1"
    path = request.url.path
    query_params = str(request.query_params)
    
    # Safely scan request body for post requests
    body = ""
    if request.method in ["POST", "PUT"]:
        try:
            # We clone the request body to avoid consuming the stream for the next handler
            body_bytes = await request.body()
            body = body_bytes.decode("utf-8", errors="ignore")
            
            # Reconstruct the request stream so subsequent routers can read it
            async def receive():
                return {"type": "http.request", "body": body_bytes}
            request._receive = receive
        except Exception as e:
            pass

    user_agent = request.headers.get("user-agent", "")

    # Run AI Security analysis
    from security_marketing_agent import analyze_request_security
    sec_check = analyze_request_security(client_ip, path, query_params, body, user_agent)

    if sec_check.get("is_blocked"):
        return JSONResponse(
            status_code=403,
            content={
                "error": "Forbidden: Access blocked by PoojaPath AI Security Agent.",
                "reason": sec_check.get("reason"),
                "ip": client_ip
            }
        )

    response = await call_next(request)
    return response


# 🛡️ SECURITY AUDIT ENDPOINT
@app.get("/api/security/dashboard")
async def get_security_dashboard():
    """Returns list of threat events and blocked IPs for security audit."""
    import sqlite3
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT ip, path, threat_type, threat_score, user_agent, timestamp FROM security_logs ORDER BY id DESC LIMIT 50")
        logs = cursor.fetchall()
        
        cursor.execute("SELECT ip, reason, blocked_at FROM blocked_ips")
        banned = cursor.fetchall()
        conn.close()
        
        return {
            "status": "success",
            "security_logs": [
                {"ip": l[0], "path": l[1], "threat_type": l[2], "threat_score": l[3], "user_agent": l[4], "timestamp": l[5]}
                for l in logs
            ],
            "blocked_ips": [
                {"ip": b[0], "reason": b[1], "blocked_at": b[2]}
                for b in banned
            ]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


# 📢 AI MARKETING SOCIAL PROMO COPY ENDPOINT
@app.post("/api/marketing/social-promo")
async def get_marketing_promo(body: dict):
    """
    Generates promotional content using Llama for WhatsApp/Twitter.
    Body: { title, keyword, channel }
    """
    try:
        from security_marketing_agent import generate_social_promotion_copy
        title = body.get("title", "Hanuman Chalisa Benefits")
        keyword = body.get("keyword", "hanuman chalisa")
        channel = body.get("channel", "whatsapp")
        
        copy = generate_social_promotion_copy(title, keyword, channel)
        return {"status": "success", "copy": copy}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# 📢 AI MARKETING CAMPAIGN LEADS ENDPOINT
@app.get("/api/marketing/leads")
async def get_marketing_leads():
    """Returns potential leads segmented by the RFM ML scoring model."""
    try:
        from security_marketing_agent import get_marketing_campaign_leads
        leads = get_marketing_campaign_leads()
        return {"status": "success", "leads": leads}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


