from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import datetime
import json
import asyncio
from dotenv import load_dotenv
from groq import Groq
import httpx

# Load env variables
load_dotenv(dotenv_path="../.env.local")
load_dotenv()

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

Remember: Be like the best AstroTalk astrologer — specific, knowledgeable, empathetic, and spiritually uplifting. Never be vague or generic."""

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

    # 2. Try Ollama
    if not response_text:
        ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
        ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(ollama_url, json={"model": ollama_model, "messages": messages_payload, "stream": False})
                if r.status_code == 200:
                    response_text = r.json()["message"]["content"]
                    source = f"Ollama ({ollama_model})"
        except Exception as e:
            print("Ollama Error:", e)

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

    async def ollama_stream():
        ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
        ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", ollama_url, json={"model": ollama_model, "messages": messages_payload, "stream": True}) as r:
                    async for line in r.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                token = data.get("message", {}).get("content", "")
                                if token:
                                    yield f"data: {json.dumps({'token': token})}\n\n"
                                if data.get("done"):
                                    break
                            except Exception:
                                pass
            yield "data: [DONE]\n\n"
        except Exception as e:
            print("Ollama Stream Error:", e)
            # Fallback static message streamed word by word
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
