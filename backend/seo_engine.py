"""
PoojaPath AI — SEO Content Engine
==================================
Auto-generates SEO blog posts using Groq AI.
Open Source Tools: rake-nltk (keyword extraction), Groq (content AI)
"""

import os
import json
import datetime
import re
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# High-value keyword targets for PoojaPath
SEO_KEYWORDS = [
    "hanuman chalisa benefits in hindi",
    "om namah shivaya mantra meaning",
    "kundli online free kaise banaye",
    "krishna aarti lyrics meaning",
    "pooja vidhi in hindi complete guide",
    "vastu shastra tips for home direction",
    "gayatri mantra 108 times benefits",
    "navratri pooja vidhi day by day",
    "saturday hanuman puja vidhi hindi",
    "mangal dosh remedies in astrology",
    "brahma muhurta morning pooja time",
    "mahamrityunjaya mantra chanting benefits",
    "diwali puja samagri list complete",
    "shiv tandav stotram meaning hindi",
    "vishnu sahasranama benefits thursday",
]

# Indian festival calendar 2026
FESTIVALS_2026 = {
    "2026-01-14": ("Makar Sankranti", "surya"),
    "2026-02-26": ("Maha Shivratri", "shiva"),
    "2026-03-25": ("Holi", "krishna"),
    "2026-04-14": ("Ram Navami", "rama"),
    "2026-05-12": ("Buddha Purnima", "vishnu"),
    "2026-07-17": ("Guru Purnima", "vishnu"),
    "2026-08-09": ("Shri Krishna Janmashtami", "krishna"),
    "2026-08-22": ("Hariyali Teej", "shiva"),
    "2026-09-10": ("Ganesh Chaturthi", "ganesha"),
    "2026-10-02": ("Navratri Begins", "durga"),
    "2026-10-11": ("Dussehra", "rama"),
    "2026-10-20": ("Diwali", "lakshmi"),
    "2026-11-05": ("Chhath Puja", "surya"),
    "2026-11-10": ("Dev Uthani Ekadashi", "vishnu"),
    "2026-12-25": ("Christmas + Spiritual Day", "general"),
}


def get_upcoming_festival(days_ahead: int = 7) -> dict | None:
    """Returns the next festival within the given number of days."""
    today = datetime.date.today()
    for date_str, (name, deity) in sorted(FESTIVALS_2026.items()):
        try:
            fest_date = datetime.date.fromisoformat(date_str)
        except ValueError:
            continue
        delta = (fest_date - today).days
        if 0 <= delta <= days_ahead:
            return {
                "name": name,
                "deity": deity,
                "date": date_str,
                "days_until": delta
            }
    return None


def slug_from_keyword(keyword: str) -> str:
    """Converts keyword to URL-safe slug."""
    slug = keyword.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    return slug


def generate_blog_post(keyword: str, language: str = "hinglish") -> dict:
    """
    Generates a complete SEO blog post for the given keyword.
    Returns: { slug, title, meta_description, keywords, content_html, word_count }
    """
    if not GROQ_API_KEY:
        return _static_blog_post(keyword)

    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        lang_instruction = (
            "Write in Hinglish (mix of Hindi and English) — use Devanagari for devotional phrases but English for technical terms."
            if language == "hinglish" else
            "Write entirely in Hindi (Devanagari script) with Sanskrit mantras included."
            if language == "hi" else
            "Write in clear, engaging English with Sanskrit terms included with translations."
        )

        system_prompt = (
            "You are an expert SEO content writer and Hindu spiritual scholar for PoojaPath.ai. "
            "Write long-form, deeply informative blog articles that rank on Google. "
            "Include: proper H2/H3 headings, FAQ section, internal link suggestions to /kundli /jaap /vastu /wallpapers, "
            "and a call-to-action to try PoojaPath AI. "
            "Return ONLY valid JSON with these exact keys: title, meta_description, keywords (array of 5), content_html (full HTML article body, 1500+ words)."
        )

        user_prompt = f"""
Write a comprehensive SEO-optimized blog post targeting the keyword: "{keyword}"
{lang_instruction}

Requirements:
- Title: compelling, includes the keyword naturally
- Meta description: 150-160 chars, includes keyword
- Content: 1500-2000 words with H2, H3 headings
- Include a Sanskrit shloka relevant to the topic (with Hindi/English meaning)
- Include practical tips users can apply TODAY
- End with a CTA: "PoojaPath AI par try karein — personalized pooja guidance ke liye"
- Include FAQ section with 4-5 questions
- Mention PoojaPath AI features naturally (kundli, jaap counter, AI Pandit)
"""

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=3000,
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        data = json.loads(completion.choices[0].message.content)
        data["slug"] = slug_from_keyword(keyword)
        data["word_count"] = len(data.get("content_html", "").split())
        data["generated_at"] = datetime.datetime.now().isoformat()
        data["keyword"] = keyword
        return data

    except Exception as e:
        print(f"[SEO ENGINE] Blog generation error: {e}")
        return _static_blog_post(keyword)


def generate_festival_blog(festival_name: str, deity: str) -> dict:
    """Generates a festival-specific blog post — high-traffic seasonal content."""
    keyword = f"{festival_name} puja vidhi 2026"
    return generate_blog_post(keyword, language="hinglish")


def _static_blog_post(keyword: str) -> dict:
    """Fallback static blog when Groq unavailable."""
    slug = slug_from_keyword(keyword)
    return {
        "slug": slug,
        "keyword": keyword,
        "title": f"{keyword.title()} — Complete Guide 2026",
        "meta_description": f"Complete guide to {keyword}. Learn step-by-step method, benefits, and tips. Visit PoojaPath AI for personalized guidance.",
        "keywords": [keyword, "pooja vidhi", "mantra benefits", "poojapath ai", "hindu spirituality"],
        "content_html": f"<h2>Introduction</h2><p>This comprehensive guide covers everything about {keyword}.</p><p>Visit PoojaPath AI for personalized pooja guidance powered by artificial intelligence.</p>",
        "word_count": 50,
        "generated_at": datetime.datetime.now().isoformat()
    }


def run_daily_blog_generation():
    """
    Called by APScheduler daily at 6 AM.
    Generates 5 new blog posts and saves them.
    """
    import random
    print("[SEO ENGINE] Running daily blog generation...")

    # Pick 5 random keywords not yet covered today
    selected = random.sample(SEO_KEYWORDS, min(5, len(SEO_KEYWORDS)))
    results = []

    for keyword in selected:
        print(f"  -> Generating: {keyword}")
        post = generate_blog_post(keyword)
        results.append(post)

    # Also check for upcoming festivals
    festival = get_upcoming_festival(days_ahead=5)
    if festival:
        print(f"  -> Festival post: {festival['name']}")
        fest_post = generate_festival_blog(festival["name"], festival["deity"])
        results.append(fest_post)

    print(f"[SEO ENGINE] Generated {len(results)} blog posts.")
    return results


if __name__ == "__main__":
    # Test
    post = generate_blog_post("hanuman chalisa benefits in hindi")
    print("Generated:", post.get("title"))
    print("Words:", post.get("word_count"))
