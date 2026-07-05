"""
PoojaPath AI — Cybersecurity & AI Marketing Agent
==================================================
1. Cybersecurity: Heuristic SQLi/XSS filters + Anomaly Threat Scoring + Auto IP Banning.
2. AI Marketing: Auto-Promotion Copywriter + High-Conversion Email & WhatsApp campaign generator.
"""

import os
import re
import sqlite3
import datetime
import random
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")
load_dotenv()

DB_PATH = "poojapath.db"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ── 1. CYBERSECURITY AI ENGINE ──────────────────────────────────────────────────

# Malicious patterns (SQLi, XSS, Path Traversal)
SQLI_PATTERNS = [
    r"union\s+select", r"select\s+.*\s+from", r"insert\s+into",
    r"delete\s+from", r"drop\s+table", r"or\s+1\s*=\s*1", r"'\s*or\s*'"
]
XSS_PATTERNS = [
    r"<script.*?>", r"javascript:", r"onload\s*=", r"onerror\s*=", r"alert\("
]
PATH_TRAVERSAL = [
    r"\.\./", r"\.\.\\", r"/etc/passwd", r"cmd\.exe", r"/bin/sh"
]

def init_security_db():
    """Initializes tables for security logs and IP blocklists."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS security_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT,
            path TEXT,
            threat_type TEXT,
            threat_score INTEGER,
            user_agent TEXT,
            timestamp TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blocked_ips (
            ip TEXT PRIMARY KEY,
            reason TEXT,
            blocked_at TEXT
        )
    """)
    conn.commit()
    conn.close()

# Initialize DB on import
init_security_db()

def analyze_request_security(ip: str, path: str, query_params: str, body: str, user_agent: str) -> dict:
    """
    Scans the request query, parameters, and body for malicious activity.
    Returns: { is_blocked, threat_score, reason }
    """
    # 1. Check if IP is already banned
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT reason FROM blocked_ips WHERE ip = ?", (ip,))
    blocked = cursor.fetchone()
    conn.close()

    if blocked:
        return {"is_blocked": True, "threat_score": 100, "reason": f"IP Banned: {blocked[0]}"}

    threat_score = 0
    reasons = []

    # 2. Check for bot user agents
    bot_agents = ["sqlmap", "nikto", "dirbuster", "nmap", "headless", "python-requests", "curl"]
    for bot in bot_agents:
        if bot in user_agent.lower():
            threat_score += 35
            reasons.append(f"Suspicious User-Agent: {bot}")

    # 3. Check for SQL Injection
    import urllib.parse
    raw_payload = f"{path} {query_params} {body}".lower()
    payload = urllib.parse.unquote(raw_payload)
    
    for pattern in SQLI_PATTERNS:
        if re.search(pattern, payload):
            threat_score += 85
            reasons.append("Potential SQL Injection signature matched")

    # 4. Check for XSS
    for pattern in XSS_PATTERNS:
        if re.search(pattern, payload):
            threat_score += 85
            reasons.append("Potential XSS signature matched")

    # 5. Check for Path Traversal / Admin probing
    for pattern in PATH_TRAVERSAL:
        if re.search(pattern, payload):
            threat_score += 90
            reasons.append("Potential Path Traversal signature matched")

    # Limit maximum score to 100
    threat_score = min(threat_score, 100)

    # 6. Take action if threat score is critical (>= 80)
    is_blocked = False
    if threat_score >= 80:
        is_blocked = True
        ban_ip(ip, f"Automated Security Block: {', '.join(reasons)}")

    if threat_score > 0:
        log_security_event(ip, path, ", ".join(reasons), threat_score, user_agent)

    return {
        "is_blocked": is_blocked,
        "threat_score": threat_score,
        "reason": ", ".join(reasons) if reasons else "Clean"
    }

def log_security_event(ip: str, path: str, threat_type: str, score: int, ua: str):
    """Logs threat event to DB."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO security_logs (ip, path, threat_type, threat_score, user_agent, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (ip, path, threat_type, score, ua, datetime.datetime.now().isoformat()))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging security event: {e}")

def ban_ip(ip: str, reason: str):
    """Inserts IP into blocklist table."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO blocked_ips (ip, reason, blocked_at) VALUES (?, ?, ?)",
                       (ip, reason, datetime.datetime.now().isoformat()))
        conn.commit()
        conn.close()
        print(f"[SECURITY AGENT] Banned IP: {ip} | Reason: {reason}")
    except Exception as e:
        print(f"Error banning IP {ip}: {e}")


# ── 2. AI MARKETING & PROMOTION AGENT ──────────────────────────────────────────

def generate_social_promotion_copy(blog_title: str, keyword: str, channel: str = "whatsapp") -> str:
    """
    Generates high-conversion promotional text for social shares.
    Uses Groq AI Llama to draft the copy.
    """
    if not GROQ_API_KEY:
        return f"Read our latest spiritual guide on '{blog_title}'! Learn more at https://poojapath.ai/blog"

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        prompt_instruction = (
            "Write a highly engaging, emotionally compelling WhatsApp message (Hinglish mix) "
            "inviting people to read our new blog. Use emojis, bold text format (*bold*), "
            "and end with a clear CTA and link."
            if channel == "whatsapp" else
            "Write a viral, high-ranking Twitter post (under 280 chars) with hashtags."
        )

        system_prompt = (
            "You are an AI Viral Growth Hacker for PoojaPath.ai. "
            "Your goal is to generate promotional copy that gets clicked and shared."
        )

        user_prompt = f"""
Draft promotional copy for:
- Blog Title: "{blog_title}"
- Focus Keyword: "{keyword}"
- Channel: "{channel}"
- Requirements: {prompt_instruction}
- Link: "https://poojapath.ai/blog"
"""

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=500,
            temperature=0.8
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating marketing copy: {e}")
        return f"Read our latest spiritual guide on '{blog_title}'! Learn more at https://poojapath.ai/blog"

def get_marketing_campaign_leads() -> list:
    """
    ML Segmentation for marketing campaigns.
    Finds 'VIP Devotees' and 'At Risk' users to target with conversion pitches.
    """
    leads = []
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Fetch all profiles
        cursor.execute("SELECT email, name, language FROM user_profiles WHERE email_opt_in = 1")
        users = cursor.fetchall()
        conn.close()

        # Score users using local RFM engine and segment
        from main import get_user_score
        for email, name, language in users:
            # Call scoring logic directly
            score_data = get_user_score(email)
            if score_data and score_data.get("tier") in ["VIP Devotee", "At Risk"]:
                leads.append({
                    "email": email,
                    "name": name,
                    "language": language,
                    "tier": score_data["tier"],
                    "cta": score_data["cta"],
                    "recommended_action": score_data["recommended_action"]
                })
    except Exception as e:
        print(f"Error compiling marketing leads: {e}")
        
    return leads
