#!/usr/bin/env python3
"""
RNLearn — Static Site Generator (tools/build.py)
Generates derived pages and indices from content/posts.json.
Standard library only. Fully idempotent and deterministic.
Supports --check to verify files are up to date.
"""

import sys
import os
import json
import re
import datetime
from xml.sax.saxutils import escape as xml_escape

BASE_URL = "https://rakeshnaik1109-cloud.github.io/RNLearn"
SITE_NAME = "RNLearn"
SITE_TAGLINE = "Deep-dive guides, models, and essays across science, economics, and history"
AUTHOR = "Rakesh Naik"
CORRECTIONS_EMAIL = "rakesh_n@cpqct.iitr.ac.in"

CANONICAL_SUBJECTS = [
    "Science",
    "Research",
    "Technology",
    "Finance & Economics",
    "History",
    "Geography",
    "Politics & Society",
    "Philosophy & Ideas",
    "Notes"
]

# Planned series. "parts" is the planned total, so a series still being written
# shows "Part 1 of 8" rather than "Part 1 of 1". "label" prefixes part numbers
# where several series are listed together (the glossary).
SERIES = {
    "how-we-came-to-know": {
        "title": "How We Came To Know",
        "parts": 12,
        "label": "Part",
        "lede": "A structured sequence of articles on how we came to know.",
    },
    "how-machines-learned-to-think": {
        "title": "How Machines Learned to Think",
        "parts": 8,
        "label": "AI Part",
        "lede": "An eight-part history of artificial intelligence, from the first dreams of thinking machines to today's AI and where it may lead.",
    },
    "how-we-measured-the-universe": {
        "title": "How We Measured the Universe",
        "parts": 12,
        "label": "Measure Part",
        "lede": "A twelve-part series on how people measured the size of the Earth, the distances to the Moon, Sun and stars, the speed of light, the age of the Earth and the universe, and the size of atoms, with experiments you can try yourself.",
    },
    "making-sense-of-data": {
        "title": "Making Sense of Data",
        "parts": 9,
        "label": "Data Part",
        "lede": "A nine-part series on the statistics used in real experiments, from averages and spread to uncertainty, ANOVA, regression and experimental design, with interactive figures and worked examples.",
    },
}

def series_meta(s_id, n_posts=0):
    meta = SERIES.get(s_id, {})
    title = meta.get("title") or s_id.replace("-", " ").title()
    return {
        "title": title,
        "parts": max(meta.get("parts", 0), n_posts),
        "label": meta.get("label", "Part"),
        "lede": meta.get("lede") or f"A structured sequence of articles on {title.lower()}.",
    }

def reading_order(post):
    """Series posts first, grouped by series (in SERIES order) and sorted by part;
    other posts afterwards, newest first."""
    info = post.get("series") or {}
    sid = info.get("id")
    if sid:
        rank = list(SERIES).index(sid) if sid in SERIES else len(SERIES)
        return (0, rank, sid, info.get("part", 999), "")
    d = post.get("date", "0000-00-00")
    inv = "".join(chr(ord("9") - ord(ch) + ord("0")) if ch.isdigit() else ch for ch in d)
    return (1, 0, "", 0, inv)

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s&/_]+', '-', text)
    text = re.sub(r'[^a-z0-9-]', '', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def format_date(iso_date):
    try:
        dt = datetime.datetime.strptime(iso_date, "%Y-%m-%d")
        return dt.strftime("%d %B %Y")
    except Exception:
        return iso_date

def replace_region(html, name, content):
    pattern = rf"(<!--\s*build:start\s+{re.escape(name)}\s*-->)(.*?)(<!--\s*build:end\s+{re.escape(name)}\s*-->)"
    replacement = rf"\1\n{content}\n\3"
    new_html, count = re.subn(pattern, replacement, html, flags=re.DOTALL)
    if count == 0:
        return html
    return new_html

def load_manifest(root_dir):
    path = os.path.join(root_dir, "content", "posts.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def render_post_card(post, rel_prefix=""):
    slug = post["slug"]
    title = post["title"]
    summary = post["summary"]
    subject = post["subject"]
    subject_slug = slugify(subject)
    date_str = format_date(post["date"])
    mins = post.get("readingMinutes", 5)
    post_type = post.get("type", "article")

    series_info = post.get("series")
    series_badge = ""
    cta_text = "Read Article →"
    if series_info and isinstance(series_info, dict) and "part" in series_info:
        part_num = series_info["part"]
        total = series_meta(series_info.get("id", "")).get("parts") or part_num
        series_badge = f'<span class="card-part-badge">Part {part_num} of {total}</span>'
        cta_text = f"Read Part {part_num} →"

    tags_html = "".join(
        f'<a href="{rel_prefix}tags/{slugify(t)}.html" class="post-tag">#{t}</a>'
        for t in post.get("tags", [])
    )

    return f"""<article class="post-card">
  <div class="post-meta">
    {series_badge}
    <a href="{rel_prefix}subjects/{subject_slug}.html" class="post-subject-tag" data-subject="{subject_slug}">{subject}</a>
    <span>•</span>
    <time datetime="{post['date']}">{date_str}</time>
    <span>•</span>
    <span>{mins} min read</span>
  </div>
  <h3 class="post-title"><a href="{rel_prefix}articles/{slug}.html">{title}</a></h3>
  <p class="post-summary">{summary}</p>
  <div class="post-footer">
    <div class="post-tags">{tags_html}</div>
    <a href="{rel_prefix}articles/{slug}.html" class="read-more-btn">{cta_text}</a>
  </div>
</article>"""

def render_featured_card(post, rel_prefix=""):
    slug = post["slug"]
    title = post["title"]
    summary = post["summary"]
    subject = post["subject"]
    subject_slug = slugify(subject)
    date_str = format_date(post["date"])
    mins = post.get("readingMinutes", 5)

    return f"""<div class="post-featured-card">
  <div class="post-featured-badge">Featured Essay</div>
  <div class="post-meta">
    <a href="{rel_prefix}subjects/{subject_slug}.html" class="post-subject-tag" data-subject="{subject_slug}">{subject}</a>
    <span>•</span>
    <time datetime="{post['date']}">{date_str}</time>
    <span>•</span>
    <span>{mins} min read</span>
  </div>
  <h2 class="post-title"><a href="{rel_prefix}articles/{slug}.html">{title}</a></h2>
  <p class="post-summary">{summary}</p>
</div>"""

def generate_listing_page(title, eyebrow, lede, posts, canonical_rel, rel_prefix="../"):
    if posts:
        cards = "\n".join(render_post_card(p, rel_prefix=rel_prefix) for p in posts)
        content = f'<div class="post-grid">\n{cards}\n</div>'
    else:
        content = """<div class="empty-state">
  <h2 class="empty-state-title">No articles published yet</h2>
  <p class="empty-state-text">New deep-dive articles are currently being researched and drafted. Check back soon.</p>
</div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — {SITE_NAME}</title>
  <meta name="description" content="{lede}">
  <link rel="canonical" href="{BASE_URL}/{canonical_rel}">
  <link rel="stylesheet" href="{rel_prefix}css/site.css">
  <link rel="stylesheet" href="{rel_prefix}css/print.css" media="print">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>

  <header class="site-header">
    <div class="container nav-bar">
      <a class="site-brand" href="{rel_prefix}index.html" aria-label="RNLearn Home">
        <span class="site-brand-badge">RN</span>
        <span>{SITE_NAME}</span>
        <span class="site-brand-tagline">{SITE_TAGLINE}</span>
      </a>

      <nav aria-label="Primary navigation">
        <ul class="nav-menu">
          <li><a class="nav-link" href="{rel_prefix}index.html">Home</a></li>
          <li><a class="nav-link" href="{rel_prefix}search.html">Search</a></li>
          <li><a class="nav-link" href="{rel_prefix}glossary.html">Glossary</a></li>
        </ul>
      </nav>

      <div class="nav-actions">
        <a href="{rel_prefix}search.html" class="btn-icon" aria-label="Search articles">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </a>
        <button id="theme-toggle" class="btn-icon" aria-label="Switch theme">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="btn-icon nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
  </header>

  <main id="main-content">
    <section class="hero">
      <div class="container">
        <div class="hero-eyebrow">{eyebrow}</div>
        <h1 class="hero-title">{title}</h1>
        <p class="hero-lede">{lede}</p>
      </div>
    </section>

    <section class="section-block">
      <div class="container">
        {content}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h2 class="footer-title">{SITE_NAME}</h2>
          <p style="font-size:0.9rem; max-width:38ch; margin-bottom:1rem;">
            A static notebook for long-form learning articles, derivations, and essays across science, economics, and history.
          </p>
          <p style="font-size:0.82rem; color:var(--ink-muted);">
            Written and maintained by {AUTHOR}.
          </p>
        </div>
        <div>
          <h2 class="footer-title">Explore</h2>
          <ul class="footer-links">
            <li><a class="footer-link" href="{rel_prefix}index.html">Home</a></li>
            <li><a class="footer-link" href="{rel_prefix}search.html">Search</a></li>
            <li><a class="footer-link" href="{rel_prefix}glossary.html">Glossary</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer-title">More</h2>
          <ul class="footer-links">
            <li><a class="footer-link" href="https://rakeshnaik1109-cloud.github.io/RakeshNaik/">Author Homepage ↗</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div>© 2026 Rakesh Naik. All rights reserved.</div>
        <div>Zero tracking · Zero ads · Pure static HTML/CSS/JS.</div>
      </div>
    </div>
  </footer>

  <script src="{rel_prefix}js/site.js"></script>
</body>
</html>"""

def term_slug(text):
    """Anchor id for a glossary term (mirrors termSlug() in js/glossary.js)."""
    import unicodedata
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


def build_glossary(root_dir, public_posts, files_to_write):
    """Generate js/glossary-data.js and glossary.html from content/glossary.json."""
    path = os.path.join(root_dir, "content", "glossary.json")
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        entries = json.load(f)

    # 1. Data file used by the tap-to-define pop-ups
    rows = [[e["term"], e["definition"], e.get("forms", [])] for e in entries]
    data_js = ("/* RNLearn glossary data. GENERATED by tools/build.py from content/glossary.json; edit that file instead.\n"
               "   Format: [term, definition, [other forms matched as whole words]] */\n"
               "window.RNLEARN_GLOSSARY = " + json.dumps(rows, ensure_ascii=False, indent=1) + ";\n")
    files_to_write[os.path.join("js", "glossary-data.js")] = data_js

    # 2. Where each term appears (whole-word match in the article text)
    letters = "A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF"
    texts = {}
    for p in public_posts:
        ap = os.path.join(root_dir, "articles", f"{p['slug']}.html")
        if not os.path.exists(ap):
            continue
        with open(ap, "r", encoding="utf-8") as f:
            h = f.read()
        a, b = h.find("<article"), h.find("</article>")
        h = h[a:b] if a >= 0 and b > a else h
        h = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
        texts[p["slug"]] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))
    order = sorted(public_posts, key=lambda p: (list(SERIES).index((p.get("series") or {}).get("id")) if (p.get("series") or {}).get("id") in SERIES else 99, (p.get("series") or {}).get("part", 999), p.get("date", "")))

    def appears_in(e):
        forms = sorted([e["term"]] + e.get("forms", []), key=len, reverse=True)
        rx = re.compile("(?<![" + letters + "])(" + "|".join(re.escape(x) for x in forms) + ")(?![" + letters + "])", re.I)
        found = []
        for p in order:
            if p["slug"] in texts and rx.search(texts[p["slug"]]):
                part = (p.get("series") or {}).get("part")
                label = f'{series_meta(p["series"].get("id", ""))["label"]} {part}' if part else p["title"]
                found.append(f'<a href="articles/{p["slug"]}.html" title="{xml_escape(p["title"])}">{label}</a>')
        return found

    def sort_key(e):
        import unicodedata
        t = unicodedata.normalize("NFD", e["term"])
        return "".join(c for c in t if not unicodedata.combining(c)).lower()

    groups = {}
    for e in sorted(entries, key=sort_key):
        k = sort_key(e)[:1].upper()
        k = k if k.isalpha() else "#"
        groups.setdefault(k, []).append(e)

    letter_nav = " ".join(f'<a class="gloss-az-link" href="#letter-{k}">{k}</a>' for k in sorted(groups))
    blocks = []
    for k in sorted(groups):
        items = []
        for e in groups[k]:
            used = appears_in(e)
            used_html = f'<div class="gloss-entry-used">Appears in: {", ".join(used)}</div>' if used else ""
            items.append(f'<div class="gloss-entry" id="{term_slug(e["term"])}">\n'
                         f'  <dt class="gloss-entry-term">{xml_escape(e["term"])}</dt>\n'
                         f'  <dd class="gloss-entry-def">{xml_escape(e["definition"])}{used_html}</dd>\n'
                         f'</div>')
        blocks.append(f'<section class="gloss-letter" id="letter-{k}" aria-labelledby="letter-{k}-h">\n'
                      f'<h2 class="gloss-letter-title" id="letter-{k}-h">{k}</h2>\n<dl>\n' + "\n".join(items) + "\n</dl>\n</section>")

    content = (f'<div class="gloss-tools">\n'
               f'  <label class="sr-only" for="gloss-filter">Filter terms</label>\n'
               f'  <input type="search" id="gloss-filter" class="search-input gloss-filter" placeholder="Filter {len(entries)} terms…" autocomplete="off">\n'
               f'  <nav class="gloss-az" aria-label="Jump to letter">{letter_nav}</nav>\n'
               f'  <p id="gloss-count" class="search-meta" aria-live="polite"></p>\n'
               f'</div>\n' + "\n".join(blocks))
    page = generate_listing_page("Glossary", "Reference",
                                 "Plain-English definitions of the technical words used across RNLearn, with links to the articles where each one appears.",
                                 [], "glossary.html", rel_prefix="")
    empty = page[page.index('<div class="empty-state">'):page.index("</div>", page.index('<div class="empty-state">')) + 6]
    page = page.replace(empty, content)
    page = page.replace("</head>", '  <link rel="stylesheet" href="css/article.css">\n</head>', 1)
    page = page.replace("</body>", '  <script src="js/glossary-page.js"></script>\n</body>', 1)
    files_to_write["glossary.html"] = page


def build_site(root_dir, check_mode=False):
    manifest = load_manifest(root_dir)
    # Sort deterministically by date descending, then title ascending
    manifest.sort(key=lambda p: (p.get("date", ""), p.get("title", "")), reverse=True)

    public_posts = [p for p in manifest if not p.get("draft", False)]

    files_to_write = {}

    # 1. Subject Pages
    subjects_map = {s: [] for s in CANONICAL_SUBJECTS}
    for p in public_posts:
        s = p.get("subject")
        if s in subjects_map:
            subjects_map[s].append(p)
        else:
            subjects_map.setdefault(s, []).append(p)

    for subj, posts in subjects_map.items():
        s_slug = slugify(subj)
        title = subj
        eyebrow = "Subject Archive"
        lede = f"Long-form guides, notes, and analytical pieces exploring {subj.lower()}."
        if subj == "History":
            eyebrow = "Subject Archive • Master Series"
            lede = "How We Came To Know: A 12-part comprehensive journey through the history and philosophy of science from prehistory to modern epistemology."
        elif subj == "Science" and any((x.get("series") or {}).get("id") == "how-we-measured-the-universe" for x in posts):
            eyebrow = "Subject Archive • Series"
            lede = "How We Measured the Universe: a twelve-part series on how people measured the Earth, the Moon, the Sun, the stars, light, time and atoms, with experiments you can try yourself."
            if any((x.get("series") or {}).get("id") == "making-sense-of-data" for x in posts):
                lede += " Making Sense of Data: a nine-part series on the statistics used in real experiments."
        elif subj == "Technology" and any((x.get("series") or {}).get("id") == "how-machines-learned-to-think" for x in posts):
            eyebrow = "Subject Archive • Series"
            lede = "How Machines Learned to Think: an eight-part history of artificial intelligence, from the first dreams of thinking machines to today’s AI and where it may lead."
        posts.sort(key=reading_order)
        html = generate_listing_page(title, eyebrow, lede, posts, f"subjects/{s_slug}.html")
        files_to_write[os.path.join("subjects", f"{s_slug}.html")] = html

    # 2. Tag Pages
    tags_map = {}
    for p in public_posts:
        for t in p.get("tags", []):
            tags_map.setdefault(t, []).append(p)

    for tag, posts in tags_map.items():
        t_slug = slugify(tag)
        title = f"#{tag}"
        eyebrow = "Tag Archive"
        lede = f"Articles and notes indexed under the topic #{tag}."
        posts.sort(key=reading_order)
        html = generate_listing_page(title, eyebrow, lede, posts, f"tags/{t_slug}.html")
        files_to_write[os.path.join("tags", f"{t_slug}.html")] = html

    # 3. Series Pages & Article Series Links
    series_map = {}
    for p in manifest:
        s_info = p.get("series")
        if s_info and isinstance(s_info, dict) and "id" in s_info:
            s_id = s_info["id"]
            series_map.setdefault(s_id, []).append(p)

    for s_id, s_posts in series_map.items():
        s_posts.sort(key=lambda x: (x.get("series") or {}).get("part", 1))
        # Build series page for public posts
        pub_s_posts = [p for p in s_posts if not p.get("draft", False)]
        meta = series_meta(s_id, len(s_posts))
        title = meta["title"]
        eyebrow = "Reading Path Series"
        lede = meta["lede"]
        html = generate_listing_page(title, eyebrow, lede, pub_s_posts, f"series/{s_id}.html")
        files_to_write[os.path.join("series", f"{s_id}.html")] = html

        # Update each article's series banner
        for idx, art in enumerate(s_posts):
            art_slug = art["slug"]
            art_file = os.path.join(root_dir, "articles", f"{art_slug}.html")
            if os.path.exists(art_file):
                with open(art_file, "r", encoding="utf-8") as f:
                    art_html = f.read()

                part_num = (art.get("series") or {}).get("part", idx + 1)
                total_parts = meta["parts"]

                prev_link = ""
                if idx > 0:
                    prev_p = s_posts[idx - 1]
                    prev_link = f'<a href="{prev_p["slug"]}.html">← Part {idx}: {prev_p["title"]}</a>'
                else:
                    prev_link = '<span>First part</span>'

                next_link = ""
                if idx < len(s_posts) - 1:
                    next_p = s_posts[idx + 1]
                    next_link = f'<a href="{next_p["slug"]}.html">Part {idx + 2}: {next_p["title"]} →</a>'
                elif part_num < total_parts:
                    next_link = f'<span>Part {part_num + 1} coming soon</span>'
                else:
                    next_link = '<span>Final part</span>'

                banner_content = f"""<div class="series-banner">
  <div class="series-banner-title">Series: <a href="../series/{s_id}.html">{title}</a> (Part {part_num} of {total_parts})</div>
  <div class="series-banner-links">
    {prev_link}
    {next_link}
  </div>
</div>"""

                art_html = replace_region(art_html, "series-top", banner_content)
                art_html = replace_region(art_html, "series-bottom", banner_content)
                files_to_write[os.path.join("articles", f"{art_slug}.html")] = art_html

    # Determine deterministic build timestamp from latest public post, or fixed epoch
    if public_posts:
        latest_iso = public_posts[0].get("updated") or public_posts[0].get("date", "2026-11-12")
    else:
        latest_iso = "2026-11-12"

    try:
        latest_dt = datetime.datetime.strptime(latest_iso, "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
    except Exception:
        latest_dt = datetime.datetime(2026, 11, 12, 0, 0, 0, tzinfo=datetime.timezone.utc)

    build_date_iso = latest_dt.strftime("%Y-%m-%d")
    build_date_rfc822 = latest_dt.strftime("%a, %d %b %Y 00:00:00 GMT")

    # 4. Search Index (search-index.json)
    search_records = []
    for p in public_posts:
        search_records.append({
            "slug": p["slug"],
            "url": f"articles/{p['slug']}.html",
            "title": p["title"],
            "summary": p["summary"],
            "subject": p["subject"],
            "tags": p.get("tags", []),
            "date": p["date"],
            "type": p.get("type", "article")
        })
    files_to_write["search-index.json"] = json.dumps(search_records, indent=2, ensure_ascii=False) + "\n"

    # 5. Update index.html generated regions
    index_path = os.path.join(root_dir, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            index_html = f.read()

        # Featured Post
        featured = next((p for p in public_posts if p.get("featured")), None)
        if featured:
            featured_content = render_featured_card(featured, rel_prefix="")
        elif public_posts:
            featured_content = render_featured_card(public_posts[0], rel_prefix="")
        else:
            featured_content = """<div class="empty-state">
  <h2 class="empty-state-title">No articles published yet</h2>
  <p class="empty-state-text">New deep-dive articles are currently being researched and drafted. Check back soon.</p>
</div>"""
        index_html = replace_region(index_html, "featured-post", featured_content)

        # Latest Posts
        if public_posts:
            posts_content = '<div class="post-grid">\n' + "\n".join(render_post_card(p, rel_prefix="") for p in public_posts[:6]) + '\n</div>'
        else:
            posts_content = """<div class="empty-state">
  <h2 class="empty-state-title">Articles coming soon</h2>
  <p class="empty-state-text">New deep-dive guides and analytical articles are currently in preparation. Check back soon or search by topic.</p>
</div>"""
        index_html = replace_region(index_html, "latest-posts", posts_content)

        # Subjects List
        subjects_html = []
        for s in CANONICAL_SUBJECTS:
            s_slug = slugify(s)
            count = len(subjects_map.get(s, []))
            subjects_html.append(f'<a href="subjects/{s_slug}.html" class="subject-chip" data-subject="{s_slug}"><span class="subject-chip-dot"></span>{s} <span style="opacity:0.6;font-size:0.75rem;">({count})</span></a>')
        index_html = replace_region(index_html, "subjects-list", "\n".join(subjects_html))

        # Series List
        series_html = []
        for s_id, s_posts in series_map.items():
            pub_s_count = len([p for p in s_posts if not p.get("draft", False)])
            if pub_s_count > 0:
                meta = series_meta(s_id, len(s_posts))
                title = meta["title"]
                count_txt = f'{meta["parts"]} part series' + ("" if pub_s_count >= meta["parts"] else f' · {pub_s_count} published so far')
                series_html.append(f'<div class="post-card"><h3 class="post-title"><a href="series/{s_id}.html">{title}</a></h3><p class="post-summary">{count_txt}</p></div>')
        if series_html:
            series_block = '<div class="post-grid">\n' + "\n".join(series_html) + '\n</div>'
        else:
            series_block = '<p style="color:var(--ink-muted);font-size:0.9rem;">No reading series active yet.</p>'
        index_html = replace_region(index_html, "series-list", series_block)

        files_to_write["index.html"] = index_html

    # Glossary page and pop-up data
    build_glossary(root_dir, public_posts, files_to_write)

    # Check or Write
    differences = []
    for rel_path, expected_content in files_to_write.items():
        full_path = os.path.join(root_dir, rel_path)
        if not os.path.exists(full_path):
            differences.append(f"Missing file: {rel_path}")
        else:
            with open(full_path, "r", encoding="utf-8") as f:
                existing = f.read()
            if existing != expected_content:
                differences.append(f"Content out of date: {rel_path}")

    if check_mode:
        if differences:
            print(f"FAILED: {len(differences)} generated file(s) are out of date:")
            for d in differences:
                print(f" - {d}")
            sys.exit(1)
        else:
            print("SUCCESS: All generated files are up to date.")
            sys.exit(0)
    else:
        for rel_path, content in files_to_write.items():
            full_path = os.path.join(root_dir, rel_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
        print(f"Successfully generated {len(files_to_write)} file(s).")

if __name__ == "__main__":
    check_mode = "--check" in sys.argv
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    build_site(root_dir, check_mode=check_mode)
