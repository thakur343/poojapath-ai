"""
PoojaPath AI — Smart Email Marketing Engine
==========================================
ML-based pooja timing analyzer + AI email generator + auto scheduler

Open-source tools used:
- APScheduler  — job scheduling (pip install apscheduler)
- langdetect   — language detection (pip install langdetect)
- smtplib      — built-in Python SMTP (no cost)
- Groq API     — AI email content generation (already integrated)
- sqlite3      — built-in DB (already integrated)
"""

import sqlite3
import smtplib
import os
import json
import datetime
import statistics
import random
import httpx
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from collections import Counter
from dotenv import load_dotenv
from groq import Groq


# Load env
load_dotenv(dotenv_path="../.env.local")
load_dotenv()

DB_PATH = "poojapath.db"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ── SMTP Email Config ──────────────────────────────────────────────────────────
# Use Gmail SMTP (free). Set in .env.local:
#   EMAIL_SENDER=yourname@gmail.com
#   EMAIL_PASSWORD=your_app_password   (Gmail App Password, not main password)
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = os.getenv("EMAIL_SENDER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")


# ══════════════════════════════════════════════════════════════════════════════
# 1.  ML TIMING ANALYZER
#     Finds the most common hour a user performs pooja
# ══════════════════════════════════════════════════════════════════════════════

def analyze_pooja_time(email: str) -> dict:
    """
    Analyzes pooja_sessions + jaap_logs to predict
    the optimal hour to send reminder emails.

    Algorithm:
    - Collect all session hours for the user
    - Find modal hour (most frequent) using Counter
    - If <3 data points, fall back to cultural defaults
      (Brahma Muhurta 5 AM or evening sandhya 6 PM)
    - Returns: { hour, confidence, basis }
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get pooja session hours
    cursor.execute(
        "SELECT hour_of_day FROM pooja_sessions WHERE email = ? ORDER BY id DESC LIMIT 60",
        (email,)
    )
    session_hours = [row[0] for row in cursor.fetchall()]

    # Also check jaap_logs dates to derive approximate hour (fallback if no sessions)
    cursor.execute(
        "SELECT date FROM jaap_logs WHERE email = ? ORDER BY id DESC LIMIT 30",
        (email,)
    )
    conn.close()

    if len(session_hours) >= 3:
        hour_counts = Counter(session_hours)
        best_hour = hour_counts.most_common(1)[0][0]
        confidence = round(hour_counts[best_hour] / len(session_hours) * 100)
        basis = "ml_pattern"
    elif len(session_hours) == 1 or len(session_hours) == 2:
        best_hour = session_hours[0]
        confidence = 40
        basis = "limited_data"
    else:
        # Cultural default: Brahma Muhurta (5 AM) or evening (6 PM)
        now_hour = datetime.datetime.now().hour
        best_hour = 5 if now_hour < 12 else 18
        confidence = 0
        basis = "cultural_default"

    # Send email 15 minutes BEFORE predicted pooja time
    reminder_hour = max(0, best_hour - 1)

    return {
        "email": email,
        "predicted_pooja_hour": best_hour,
        "reminder_send_hour": reminder_hour,
        "confidence_pct": confidence,
        "basis": basis,
        "sessions_analyzed": len(session_hours)
    }


def get_all_opted_in_users() -> list:
    """Returns all users who have email_opt_in=1"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT email, name, language FROM user_profiles WHERE email_opt_in = 1"
    )
    users = [{"email": r[0], "name": r[1] or "Devotee", "language": r[2] or "hi"}
             for r in cursor.fetchall()]
    conn.close()
    return users


# ══════════════════════════════════════════════════════════════════════════════
# 2.  AI EMAIL CONTENT GENERATOR  (Groq-powered)
# ══════════════════════════════════════════════════════════════════════════════

# ── Favourite Deity and AI Image Generator for Email ──────────────────────────

def get_user_favorite_deity(email: str) -> str:
    """
    ML Timing and Preference Analyzer.
    Analyzes jaap_logs to find the deity user chants the most.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT mantra_id, COUNT(*) as cnt FROM jaap_logs WHERE email = ? GROUP BY mantra_id ORDER BY cnt DESC LIMIT 1",
            (email,)
        )
        row = cursor.fetchone()
        conn.close()
        if not row:
            return "shiva"
        
        mantra = row[0].lower()
        if "krishna" in mantra:
            return "krishna"
        elif "shiva" in mantra or "mahadev" in mantra or "shiv" in mantra:
            return "shiva"
        elif "ram" in mantra:
            return "rama"
        elif "ganesh" in mantra:
            return "ganesha"
        elif "hanuman" in mantra:
            return "hanuman"
        elif "durga" in mantra:
            return "durga"
        elif "lakshmi" in mantra:
            return "lakshmi"
        return "shiva"
    except Exception as e:
        print(f"Error analyzing favorite deity: {e}")
        return "shiva"


def generate_deity_image_for_email(deity: str) -> bytes:
    """
    Generates a unique AI spiritual image of the deity.
    Falls back to a random local preset image read as bytes.
    """
    hf_key = os.getenv("HF_API_KEY")
    seed = random.randint(1, 999999)
    
    # Unique SDXL prompt for each deity
    art_styles = [
        "majestic oil painting", "glowing neon spiritual render", 
        "ancient Indian miniature painting", "Watercolor illustration", 
        "celestial gold mandala style"
    ]
    backgrounds = [
        "Mount Kailash at sunset", "Vrindavan forest with holy light", 
        "cosmic universe with golden galaxies", "ancient temple interior with glowing diyas"
    ]
    
    prompt = (
        f"A majestic, ethereal 8K smartphone portrait of Lord {deity.title()}, "
        f"{random.choice(art_styles)}, divine glowing aura, saffron and gold colors, "
        f"cosmic nebula background, hyper-detailed digital art. Seed: {seed}"
    )

    if hf_key:
        try:
            api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
            headers = {"Authorization": f"Bearer {hf_key}"}
            payload = {
                "inputs": prompt,
                "parameters": {
                    "seed": seed,
                    "num_inference_steps": 25,
                    "width": 512,
                    "height": 512
                }
            }
            resp = httpx.post(api_url, headers=headers, json=payload, timeout=60.0)
            if resp.status_code == 200:
                print(f"[AI EMAIL IMAGE] Generated unique image for Lord {deity} (Seed: {seed})")
                return resp.content
            else:
                print(f"[AI EMAIL IMAGE] HF error {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"[AI EMAIL IMAGE] HF generation failed: {e}")

    # Fallback to local preset images
    try:
        # Map deity to local filename
        img_map = {
            "shiva": "lord_shiva_bg.png",
            "krishna": "lord_krishna_bg.png",
            "rama": "lord_rama_bg.png",
            "ganesha": "lord_ganesha_bg.png",
            "hanuman": "lord_hanuman_bg.png"
        }
        filename = img_map.get(deity, "lord_shiva_bg.png")
        filepath = os.path.join("../public", filename)
        
        if os.path.exists(filepath):
            with open(filepath, "rb") as f:
                print(f"[AI EMAIL IMAGE] Loaded static fallback for Lord {deity}")
                return f.read()
    except Exception as e:
        print(f"[AI EMAIL IMAGE] Static fallback read failed: {e}")
        
    return b""


def generate_email_content(name: str, language: str, stats: dict) -> dict:
    """
    Uses Groq (Llama 3.3 70B) to generate a beautifully written,
    emotionally compelling pooja reminder email.

    Returns: { subject, html_body, plain_text }
    """
    if not GROQ_API_KEY:
        # Fallback static email
        return _static_fallback_email(name, language, stats)

    streak = stats.get("streak", 0)
    total = stats.get("total_chants", 0)
    hour = stats.get("predicted_pooja_hour", 6)

    am_pm = "सुबह" if hour < 12 else "शाम"
    time_str = f"{hour}:00 {am_pm}" if language == "hi" else (
        f"{'Morning' if hour < 12 else 'Evening'} {hour % 12 or 12}:00 {'AM' if hour < 12 else 'PM'}"
    )

    system_prompt = (
        "You are a spiritual email copywriter for PoojaPath.ai — India's #1 AI-powered devotion platform. "
        "Write deeply emotional, devotion-inspiring email reminders that make the reader's heart fill with "
        "faith and urge to pray. Use vivid spiritual imagery, Sanskrit shlokas (with translation), "
        "and personal connection. Make it feel like a letter from a trusted Pandit Ji, not a marketing email. "
        "IMPORTANT: You MUST include the inline image tag <div style='text-align:center;margin:24px 0;'><img src='cid:deity_image' style='width:100%;max-width:380px;border-radius:16px;border:2px solid #c9922b;box-shadow:0 8px 30px rgba(232,96,10,0.3);' alt='Divine Lord' /></div> "
        "inside the html_body at an appropriate place so that the attached custom deity image displays properly. "
        "Return ONLY valid JSON with keys: subject, html_body (full HTML email), plain_text."
    )

    if language == "hi":
        user_prompt = f"""
Write a pooja reminder email in Hindi/Hinglish for a devotee named {name}.
Their pooja time is around {time_str}.
They have a {streak}-day streak and {total} total chants.
Make it beautiful, emotional, and devotion-inspiring.
Include: a Sanskrit shloka + meaning, their streak achievement, today's auspicious timing,
and a gentle call-to-action to open PoojaPath AI for today's puja.
HTML should be beautiful with saffron/gold colors, inline CSS, mobile-friendly.
"""
    else:
        user_prompt = f"""
Write a pooja reminder email in English for a devotee named {name}.
Their pooja time is around {time_str}.
They have a {streak}-day streak and {total} total chants.
Make it beautiful, emotional, and devotion-inspiring.
Include: a Sanskrit shloka + English meaning, their streak achievement, today's auspicious timing,
and a gentle call-to-action to open PoojaPath AI for today's puja.
HTML should be beautiful with saffron/gold colors, inline CSS, mobile-friendly.
"""

    try:
        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=2500,
            temperature=0.85,
            response_format={"type": "json_object"}
        )
        content = json.loads(completion.choices[0].message.content)
        return content
    except Exception as e:
        print(f"Groq email generation error: {e}")
        return _static_fallback_email(name, language, stats)


def _static_fallback_email(name: str, language: str, stats: dict) -> dict:
    """Beautiful fallback HTML email when Groq is unavailable"""
    streak = stats.get("streak", 0)

    if language == "hi":
        subject = f"🪔 {name} ji, aaj ki pooja ka samay aa gaya hai!"
        html_body = f"""
<html>
<body style="margin:0;padding:0;background:#1a0a00;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#2a1200,#0a0500);border:1px solid #c9922b;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#e8600a,#c9922b);padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🕉️</div>
      <h1 style="color:#fff;font-size:24px;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.4);">PoojaPath AI</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">Aapki divya sadhana ka samay ho gaya hai</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#f2c96e;font-size:20px;">Namaste {name} Ji! 🙏</h2>
      <p style="color:#fdf0dc;font-size:15px;line-height:1.8;">
        Bhagwan ki kirpa se aaj bhi aapka din shubh ho. Aapki pooja ka pavitra samay aa gaya hai.
      </p>
      
      <div style="text-align:center;margin:24px 0;">
        <img src="cid:deity_image" style="width:100%;max-width:380px;border-radius:16px;border:2px solid #c9922b;box-shadow:0 8px 30px rgba(232,96,10,0.3);" alt="Divine deity" />
      </div>

      <div style="background:rgba(242,201,110,0.08);border:1px solid #c9922b;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#f2c96e;font-size:16px;font-style:italic;margin:0;">
          "मन एव मनुष्याणां कारणं बन्धमोक्षयोः"
        </p>
        <p style="color:rgba(253,240,220,0.6);font-size:12px;margin:8px 0 0;">
          Man hi manushya ke bandhan aur moksha ka kaaran hai. — Amrit Bindu Upanishad
        </p>
      </div>
      {"<div style='background:rgba(232,96,10,0.1);border:1px solid #e8600a;border-radius:8px;padding:12px;text-align:center;margin:16px 0;'><span style='color:#f2c96e;font-size:14px;font-weight:bold;'>🔥 " + str(streak) + " Din ki Streak! Zabardast!</span></div>" if streak > 0 else ""}
      <div style="text-align:center;margin:24px 0;">
        <a href="https://poojapath.ai" style="background:linear-gradient(135deg,#e8600a,#c9922b);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 4px 20px rgba(232,96,10,0.4);">
          🪔 Aaj ki Pooja Shuru Karo
        </a>
      </div>
      <p style="color:rgba(253,240,220,0.5);font-size:11px;text-align:center;margin-top:24px;">
        Jai Shri Ram 🙏 | PoojaPath AI | <a href="https://poojapath.ai/unsubscribe" style="color:#c9922b;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>"""
    else:
        subject = f"🪔 {name}, Your sacred pooja time has arrived!"
        html_body = f"""
<html>
<body style="margin:0;padding:0;background:#1a0a00;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#2a1200,#0a0500);border:1px solid #c9922b;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#e8600a,#c9922b);padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🕉️</div>
      <h1 style="color:#fff;font-size:24px;margin:0;">PoojaPath AI</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">Your daily divine moment awaits</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#f2c96e;font-size:20px;">Namaste {name} 🙏</h2>
      <p style="color:#fdf0dc;font-size:15px;line-height:1.8;">
        May this auspicious moment fill your heart with peace and devotion. Your sacred pooja time has arrived.
      </p>

      <div style="text-align:center;margin:24px 0;">
        <img src="cid:deity_image" style="width:100%;max-width:380px;border-radius:16px;border:2px solid #c9922b;box-shadow:0 8px 30px rgba(232,96,10,0.3);" alt="Divine deity" />
      </div>

      <div style="background:rgba(242,201,110,0.08);border:1px solid #c9922b;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#f2c96e;font-size:16px;font-style:italic;margin:0;">
          "सर्वे भवन्तु सुखिनः, सर्वे सन्तु निरामयाः"
        </p>
        <p style="color:rgba(253,240,220,0.6);font-size:12px;margin:8px 0 0;">
          May all beings be happy, may all be free from illness.
        </p>
      </div>
      {"<div style='background:rgba(232,96,10,0.1);border:1px solid #e8600a;border-radius:8px;padding:12px;text-align:center;margin:16px 0;'><span style='color:#f2c96e;font-size:14px;font-weight:bold;'>🔥 " + str(streak) + " Day Streak! Keep it going!</span></div>" if streak > 0 else ""}
      <div style="text-align:center;margin:24px 0;">
        <a href="https://poojapath.ai" style="background:linear-gradient(135deg,#e8600a,#c9922b);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 4px 20px rgba(232,96,10,0.4);">
          🪔 Begin Today's Pooja
        </a>
      </div>
      <p style="color:rgba(253,240,220,0.5);font-size:11px;text-align:center;margin-top:24px;">
        Jai Shri Ram 🙏 | PoojaPath AI | <a href="https://poojapath.ai/unsubscribe" style="color:#c9922b;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>"""

    return {"subject": subject, "html_body": html_body, "plain_text": f"Namaste {name}! Your pooja time has arrived. Visit PoojaPath AI."}


# ══════════════════════════════════════════════════════════════════════════════
# 3.  EMAIL SENDER
# ══════════════════════════════════════════════════════════════════════════════

def send_email(to_email: str, subject: str, html_body: str, plain_text: str, image_bytes: bytes = None) -> bool:
    """Sends HTML email via Gmail SMTP with optional inline deity image"""
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print(f"[EMAIL SKIP] SMTP not configured. Would send to: {to_email} | {subject}")
        return False

    try:
        # Use multipart/related for inline images (MIME standard)
        msg = MIMEMultipart("related")
        msg["Subject"] = subject
        msg["From"] = f"PoojaPath AI 🕉️ <{EMAIL_SENDER}>"
        msg["To"] = to_email
        msg["X-Mailer"] = "PoojaPath-AI-v1"

        # Alternative text/html part
        msg_alt = MIMEMultipart("alternative")
        msg.attach(msg_alt)
        msg_alt.attach(MIMEText(plain_text, "plain", "utf-8"))
        msg_alt.attach(MIMEText(html_body, "html", "utf-8"))

        # Attach deity image inline if bytes are provided
        if image_bytes:
            msg_img = MIMEImage(image_bytes)
            msg_img.add_header("Content-ID", "<deity_image>")
            msg_img.add_header("Content-Disposition", "inline", filename="deity.png")
            msg.attach(msg_img)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, to_email, msg.as_string())

        print(f"[EMAIL SENT] OK -> {to_email} | {subject}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] FAIL {to_email}: {e}")
        return False



def log_email_sent(email: str, subject: str, scheduled_hour: int):
    """Saves email send record to DB"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO email_logs (email, subject, sent_at, scheduled_hour) VALUES (?, ?, ?, ?)",
        (email, subject, datetime.datetime.now().isoformat(), scheduled_hour)
    )
    conn.commit()
    conn.close()


def already_sent_today(email: str) -> bool:
    """Prevents duplicate emails in same day"""
    today = datetime.date.today().isoformat()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM email_logs WHERE email = ? AND sent_at LIKE ?",
        (email, f"{today}%")
    )
    exists = cursor.fetchone() is not None
    conn.close()
    return exists


# ══════════════════════════════════════════════════════════════════════════════
# 4.  MAIN SCHEDULER JOB  (runs every hour)
# ══════════════════════════════════════════════════════════════════════════════

def run_email_campaign():
    """
    Called by APScheduler every hour.
    Checks which users have their predicted pooja hour == current hour.
    Generates personalized email and sends it.
    """
    current_hour = datetime.datetime.now().hour
    print(f"[EMAIL CAMPAIGN] Running at hour {current_hour}:00")

    users = get_all_opted_in_users()
    sent_count = 0
    skip_count = 0

    for user in users:
        email = user["email"]
        name = user["name"]
        language = user["language"]

        # Skip if already emailed today
        if already_sent_today(email):
            skip_count += 1
            continue

        # ML prediction
        timing = analyze_pooja_time(email)
        if timing["reminder_send_hour"] != current_hour:
            continue  # Not their time yet

        # Get user stats
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT current_streak, total_chants FROM jaap_streaks WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        stats = {
            "streak": row[0] if row else 0,
            "total_chants": row[1] if row else 0,
            "predicted_pooja_hour": timing["predicted_pooja_hour"]
        }

        # Generate AI email
        print(f"  → Generating email for {email} ({language}) ...")
        content = generate_email_content(name, language, stats)

        # Dynamic AI/ML Image generator based on user's favorite deity
        fav_deity = get_user_favorite_deity(email)
        deity_image = generate_deity_image_for_email(fav_deity)

        # Send with deity image attachment
        success = send_email(
            to_email=email,
            subject=content.get("subject", "🪔 Aapki Pooja ka Samay"),
            html_body=content.get("html_body", ""),
            plain_text=content.get("plain_text", ""),
            image_bytes=deity_image
        )

        if success:
            log_email_sent(email, content.get("subject", ""), current_hour)
            sent_count += 1

    print(f"[EMAIL CAMPAIGN] Done. Sent: {sent_count} | Skipped: {skip_count}")
    return {"sent": sent_count, "skipped": skip_count}


# ══════════════════════════════════════════════════════════════════════════════
# 5.  SCHEDULER SETUP  (APScheduler — open source)
# ══════════════════════════════════════════════════════════════════════════════

def start_scheduler():
    """
    Starts APScheduler background scheduler.
    Runs email campaign every hour on the hour.
    """
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
        scheduler.add_job(
            run_email_campaign,
            "cron",
            minute=0,          # at :00 every hour
            id="pooja_email_campaign",
            replace_existing=True,
            max_instances=1
        )
        # Schedule daily festival check at 7:00 AM
        scheduler.add_job(
            check_and_send_festival_emails,
            "cron",
            hour=7,
            minute=0,
            id="pooja_festival_campaign",
            replace_existing=True,
            max_instances=1
        )
        scheduler.start()
        print("[SCHEDULER] APScheduler started - runs every hour at :00, daily festival check at 7 AM.")
        return scheduler
    except ImportError:
        print("[SCHEDULER] APScheduler not installed. Run: pip install apscheduler")
        return None


# ══════════════════════════════════════════════════════════════════════════════
# 6.  FESTIVAL CAMPAIGN ENGINE
#     Sends special emails 3 days before + day of each Indian festival
# ══════════════════════════════════════════════════════════════════════════════

FESTIVALS_2026 = {
    "2026-01-14": ("Makar Sankranti", "surya"),
    "2026-02-26": ("Maha Shivratri", "shiva"),
    "2026-03-25": ("Holi", "krishna"),
    "2026-04-14": ("Ram Navami", "rama"),
    "2026-08-09": ("Shri Krishna Janmashtami", "krishna"),
    "2026-09-10": ("Ganesh Chaturthi", "ganesha"),
    "2026-10-02": ("Navratri Begins", "durga"),
    "2026-10-11": ("Dussehra", "rama"),
    "2026-10-20": ("Diwali", "lakshmi"),
    "2026-11-05": ("Chhath Puja", "surya"),
}


def check_and_send_festival_emails():
    """
    Called daily. Checks if any festival is in 3 days or today.
    Sends high-impact festival emails to all opted-in users.
    """
    today = datetime.date.today()
    users = get_all_opted_in_users()
    sent_count = 0

    for date_str, (festival_name, deity) in FESTIVALS_2026.items():
        try:
            fest_date = datetime.date.fromisoformat(date_str)
        except ValueError:
            continue

        delta = (fest_date - today).days

        if delta == 3:
            phase = "preparation"
            subject_hi = f"3 din baad {festival_name}! Karo taiyari"
            subject_en = f"{festival_name} is in 3 days! Prepare your puja"
        elif delta == 0:
            phase = "dayof"
            subject_hi = f"Aaj hai {festival_name}! Jai {deity.title()}!"
            subject_en = f"Today is {festival_name}! Begin your sacred puja!"
        elif delta == -1:
            phase = "followup"
            subject_hi = f"{festival_name} ki badhaiyan! Blessings share karo"
            subject_en = f"{festival_name} blessings! Share the divine joy"
        else:
            continue

        print(f"[FESTIVAL EMAIL] Sending '{festival_name}' ({phase}) to {len(users)} users")

        for user in users:
            if already_sent_today(user["email"]):
                continue

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT current_streak, total_chants FROM jaap_streaks WHERE email = ?",
                           (user["email"],))
            row = cursor.fetchone()
            conn.close()

            stats = {
                "streak": row[0] if row else 0,
                "total_chants": row[1] if row else 0,
                "festival_name": festival_name,
                "festival_deity": deity,
                "festival_phase": phase,
                "predicted_pooja_hour": 6
            }

            lang = user.get("language", "hi")
            subject = subject_hi if lang == "hi" else subject_en

            content = generate_festival_email(user["name"], lang, festival_name, deity, stats)
            success = send_email(user["email"], subject, content["html_body"], content["plain_text"])

            if success:
                log_email_sent(user["email"], subject, datetime.datetime.now().hour)
                sent_count += 1

    print(f"[FESTIVAL EMAIL] Done. Sent: {sent_count}")
    return sent_count


def generate_festival_email(name: str, language: str, festival: str, deity: str, stats: dict) -> dict:
    """Generates a beautiful festival-themed email."""
    deity_name = deity.title()
    siteurl = "https://poojapath.ai"

    if language == "hi":
        html_body = f"""
<html><body style="margin:0;padding:0;background:#0a0500;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#2a1200,#0a0500);border:2px solid #C9922B;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#E8600A,#C9922B);padding:40px;text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">🌸</div>
      <h1 style="color:#fff;font-size:26px;margin:0;">{festival}</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">PoojaPath AI ki taraf se hardik shubhkamnaen</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#F2C96E;font-size:20px;">Namaste {name} Ji! 🙏</h2>
      <p style="color:#FDF0DC;font-size:15px;line-height:1.8;">{festival} ka pavitra parva aa gaya hai. Aaj {deity_name} ji ki vishesh pooja karo aur unka aashirwad pao.</p>
      <div style="background:rgba(242,201,110,0.08);border:1px solid #C9922B;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#F2C96E;font-size:16px;font-style:italic;margin:0;">&quot;Om Namah {deity_name}aya Namah&quot;</p>
        <p style="color:rgba(253,240,220,0.6);font-size:12px;margin:8px 0 0;">{deity_name} ji ke charno mein pranipat</p>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="{siteurl}" style="background:linear-gradient(135deg,#E8600A,#C9922B);color:#fff;text-decoration:none;padding:16px 36px;border-radius:50px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 4px 20px rgba(232,96,10,0.4);">Aaj Ki Vishesh Pooja Karo 🪔</a>
      </div>
      <p style="color:rgba(253,240,220,0.5);font-size:11px;text-align:center;margin-top:24px;">Jai {deity_name}! | PoojaPath AI | <a href="{siteurl}/unsubscribe" style="color:#C9922B;">Unsubscribe</a></p>
    </div>
  </div>
</body></html>"""
    else:
        html_body = f"""
<html><body style="margin:0;padding:0;background:#0a0500;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#2a1200,#0a0500);border:2px solid #C9922B;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#E8600A,#C9922B);padding:40px;text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">🌸</div>
      <h1 style="color:#fff;font-size:26px;margin:0;">{festival}</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">Sacred blessings from PoojaPath AI</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#F2C96E;font-size:20px;">Namaste {name}! 🙏</h2>
      <p style="color:#FDF0DC;font-size:15px;line-height:1.8;">The sacred festival of {festival} is here. Offer your prayers to {deity_name} Ji and receive divine blessings.</p>
      <div style="background:rgba(242,201,110,0.08);border:1px solid #C9922B;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#F2C96E;font-size:16px;font-style:italic;margin:0;">&quot;Sarve Bhavantu Sukhinah&quot;</p>
        <p style="color:rgba(253,240,220,0.6);font-size:12px;margin:8px 0 0;">May all beings be happy and prosperous.</p>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="{siteurl}" style="background:linear-gradient(135deg,#E8600A,#C9922B);color:#fff;text-decoration:none;padding:16px 36px;border-radius:50px;font-size:14px;font-weight:bold;display:inline-block;box-shadow:0 4px 20px rgba(232,96,10,0.4);">Begin Your Sacred Puja Today</a>
      </div>
      <p style="color:rgba(253,240,220,0.5);font-size:11px;text-align:center;margin-top:24px;">Jai {deity_name}! | PoojaPath AI | <a href="{siteurl}/unsubscribe" style="color:#C9922B;">Unsubscribe</a></p>
    </div>
  </div>
</body></html>"""

    return {
        "html_body": html_body,
        "plain_text": f"Namaste {name}! {festival} ki hardik shubhkamnaen! Visit {siteurl} for today's puja guide."
    }


if __name__ == "__main__":
    # Test mode — run campaign immediately
    print("Running test email campaign...")
    run_email_campaign()

