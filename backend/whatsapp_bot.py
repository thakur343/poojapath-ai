"""
PoojaPath AI — WhatsApp Marketing Bot
=======================================
Uses Meta WhatsApp Business API (free tier: 1000 msgs/month)
Fallback: whatsapp-web.js compatible webhook handler

Setup:
1. Go to https://developers.facebook.com
2. Create App → Business → WhatsApp
3. Get: WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID
4. Add to .env.local
"""

import os
import json
import datetime
import sqlite3
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")
load_dotenv()

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
WHATSAPP_API_URL = f"https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_ID}/messages"
DB_PATH = "poojapath.db"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# ── Message Templates ─────────────────────────────────────────────────────────

DAY1_WELCOME_HI = """Namaste {name} ji! 🙏

PoojaPath AI mein aapka swagat hai! 🕉️

Aaj ka shubh muhurta: *{muhurta}*

Is pavitra samay mein karo aaj ki pooja:
➡️ {link}

“Sarve bhavantu sukhinah...” 🌺
Jai Shri Ram! 🙏"""

DAY1_WELCOME_EN = """Namaste {name}! 🙏

Welcome to PoojaPath AI! Your sacred digital companion. 🕉️

Today's auspicious muhurta: *{muhurta}*

Begin your pooja in this blessed time:
➡️ {link}

“May all beings be happy and free...” 🌺
Blessings!"""

DAY3_KUNDLI_HI = """Namaste {name} ji! 🙏

Aapki kundli mein kuch interesting reveal hua hai...

Aapka ruling planet aur lucky gemstone janiye:
➡️ {link}

Yeh FREE hai — sirf 2 minute mein! ⭐"""

DAY7_OFFER_HI = """Namaste {name} ji! 🙏

Sirf AAJ ke liye special offer:

Personalized Mantra Reading par *₹100 discount!*
Code: *POOJA100*

➡️ {link}

Offer khatam hone se pehle use karo! 🔥"""

FESTIVAL_HI = """Namaste {name} ji! 🙏

*{festival}* ki hardik shubhkamnaen! 🌸

Aaj ki vishesh pooja vidhi aur mantra:
➡️ {link}

*{deity} ji* ki kripa aap par bani rahe! 🙏"""


def get_current_muhurta() -> str:
    """Returns current auspicious time period."""
    hour = datetime.datetime.now().hour
    if 4 <= hour < 6:
        return "Brahma Muhurta (4-6 AM) — Sabse shubh samay"
    elif 6 <= hour < 8:
        return "Pratah Kaal (6-8 AM) — Shubh samay"
    elif 11 <= hour < 12:
        return "Abhijit Muhurta (11:48 AM-12:36 PM) — Sarvasiddhi dayak"
    elif 18 <= hour < 19:
        return "Sandhya Kaal (6 PM) — Sandhya pooja ka samay"
    else:
        return "Aaj ka auspicious time — Pooja ke liye uttam"


def send_whatsapp_message(phone: str, message: str) -> bool:
    """
    Sends WhatsApp message via Meta Business API.
    phone: international format without + (e.g. '919876543210')
    """
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_ID:
        print(f"[WHATSAPP SKIP] Not configured. Would send to {phone}: {message[:50]}...")
        return False

    try:
        import httpx
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": {"body": message}
        }
        response = httpx.post(WHATSAPP_API_URL, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            print(f"[WHATSAPP SENT] -> {phone}")
            return True
        else:
            print(f"[WHATSAPP ERROR] {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[WHATSAPP ERROR] {e}")
        return False


def send_day1_welcome(name: str, phone: str, language: str = "hi"):
    """Send welcome message after signup."""
    muhurta = get_current_muhurta()
    link = "https://poojapath.ai"
    template = DAY1_WELCOME_HI if language == "hi" else DAY1_WELCOME_EN
    msg = template.format(name=name, muhurta=muhurta, link=link)
    return send_whatsapp_message(phone, msg)


def send_day3_kundli_nudge(name: str, phone: str):
    """Send kundli interest message on day 3 if no purchase."""
    msg = DAY3_KUNDLI_HI.format(name=name, link="https://poojapath.ai/kundli")
    return send_whatsapp_message(phone, msg)


def send_day7_offer(name: str, phone: str):
    """Send discount offer on day 7."""
    msg = DAY7_OFFER_HI.format(name=name, link="https://poojapath.ai/kundli")
    return send_whatsapp_message(phone, msg)


def send_festival_message(name: str, phone: str, festival: str, deity: str):
    """Send festival greeting."""
    deity_name = deity.title()
    msg = FESTIVAL_HI.format(
        name=name, festival=festival, deity=deity_name,
        link=f"https://poojapath.ai/deity/{deity}"
    )
    return send_whatsapp_message(phone, msg)


def run_whatsapp_drip_campaign():
    """
    Checks all users and sends appropriate drip message.
    Day 1: Welcome
    Day 3: Kundli nudge (if no purchase)
    Day 7: Discount offer
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT email, name, language, created_at FROM user_profiles WHERE email_opt_in = 1"
    )
    users = cursor.fetchall()
    conn.close()

    today = datetime.date.today()
    print(f"[WHATSAPP] Running drip campaign for {len(users)} users")

    for email, name, language, created_at in users:
        if not created_at:
            continue
        try:
            signup_date = datetime.date.fromisoformat(created_at[:10])
            days_since = (today - signup_date).days
            # Phone would be stored in user_profiles — skip if not present
            # In production, add phone column to user_profiles table
            print(f"  User {email}: day {days_since} since signup")
        except Exception as e:
            print(f"  Error for {email}: {e}")

    print("[WHATSAPP] Drip campaign check complete.")


if __name__ == "__main__":
    print("WhatsApp Bot ready. Configure WHATSAPP_TOKEN in .env.local")
    print("Current muhurta:", get_current_muhurta())
