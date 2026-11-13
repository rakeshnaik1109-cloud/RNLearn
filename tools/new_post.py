#!/usr/bin/env python3
"""
RNLearn — New Article Scaffolding Tool (tools/new_post.py)
Creates a new article from templates/article.html, creates empty figure JS if needed,
and adds the post entry to content/posts.json with draft: true.
"""

import sys
import os
import json
import re
import argparse
import datetime

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

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s&/_]+', '-', text)
    text = re.sub(r'[^a-z0-9-]', '', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def main():
    parser = argparse.ArgumentParser(description="Create a new RNLearn article.")
    parser.add_argument("title", help="Title of the article")
    parser.add_argument("--subject", required=True, help="Subject (e.g. Science, Technology)")
    parser.add_argument("--type", default="explainer", choices=["tutorial", "essay", "explainer", "note", "review"], help="Article type")
    parser.add_argument("--summary", default="", help="Short summary (< 200 chars)")
    parser.add_argument("--tags", default="", help="Comma-separated tags")
    parser.add_argument("--series", default="", help="Series ID")
    parser.add_argument("--part", type=int, default=1, help="Part in series")
    parser.add_argument("--interactive", action="store_true", help="Enable interactive figures and create js/figs/<slug>.js")
    parser.add_argument("--math", action="store_true", help="Enable KaTeX mathematics rendering")
    parser.add_argument("--mins", type=int, default=8, help="Estimated reading minutes")

    args = parser.parse_args()
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    slug = slugify(args.title)
    today_iso = datetime.date.today().isoformat()
    formatted_date = datetime.date.today().strftime("%d %B %Y")
    summary = args.summary or f"An in-depth {args.type} on {args.title}."
    tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else [slugify(args.subject)]

    # 1. Update content/posts.json
    manifest_path = os.path.join(root_dir, "content", "posts.json")
    posts = []
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            try:
                posts = json.load(f)
            except Exception:
                posts = []

    if any(p.get("slug") == slug for p in posts):
        print(f"Error: Post with slug '{slug}' already exists in content/posts.json")
        sys.exit(1)

    new_entry = {
        "slug": slug,
        "title": args.title,
        "summary": summary[:200],
        "subject": args.subject,
        "tags": tags,
        "date": today_iso,
        "updated": None,
        "type": args.type,
        "readingMinutes": args.mins,
        "series": {"id": args.series, "part": args.part} if args.series else None,
        "featured": False,
        "draft": True,
        "interactive": args.interactive,
        "math": args.math
    }
    posts.insert(0, new_entry)

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # 2. Create Figure JS if interactive
    fig_scripts = ""
    if args.interactive:
        figs_dir = os.path.join(root_dir, "js", "figs")
        os.makedirs(figs_dir, exist_ok=True)
        fig_js_path = os.path.join(figs_dir, f"{slug}.js")
        if not os.path.exists(fig_js_path):
            with open(fig_js_path, "w", encoding="utf-8") as f:
                f.write(f"""/* Figures for {slug} */
(function () {{
  'use strict';
  // Example figure:
  // FIG['example-{slug}'] = function (figEl) {{
  //   var container = figEl.querySelector('.fig-container');
  //   // Use FIG helpers here
  // }};
}})();
""")
        fig_scripts = f"""<script defer src="../js/fig-core.js"></script>
  <script defer src="../js/figs/{slug}.js"></script>"""

    # 3. KaTeX header if math
    katex_head = ""
    if args.math:
        katex_head = """<!-- KaTeX (pinned jsDelivr) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>"""

    # 4. Read template and write article
    tmpl_path = os.path.join(root_dir, "templates", "article.html")
    with open(tmpl_path, "r", encoding="utf-8") as f:
        tmpl = f.read()

    initial_content = f"""<section id="introduction">
  <h2>1. Introduction</h2>
  <p>Write your introduction here. Clearly define all terms and establish the primary question.</p>
</section>

<section id="analysis">
  <h2>2. Core Derivation and Analysis</h2>
  <p>Develop the mathematical and physical or historical model from first principles.</p>
</section>"""

    initial_references = """<li>Author, A. (Year). <em>Title of Work</em>. Publisher / Journal, Volume(Issue), pages.</li>"""
    initial_toc = """<li><a class="toc-link" href="#introduction">1. Introduction</a></li>
              <li><a class="toc-link" href="#analysis">2. Core Derivation</a></li>
              <li><a class="toc-link" href="#references">References</a></li>"""

    replacements = {
        "{{TITLE}}": args.title,
        "{{SLUG}}": slug,
        "{{SUMMARY}}": summary,
        "{{SUBJECT}}": args.subject,
        "{{SUBJECT_SLUG}}": slugify(args.subject),
        "{{DATE}}": today_iso,
        "{{FORMATTED_DATE}}": formatted_date,
        "{{READING_MINUTES}}": str(args.mins),
        "{{TYPE}}": args.type,
        "{{KATEX_HEAD}}": katex_head,
        "{{FIG_SCRIPTS}}": fig_scripts,
        "{{CONTENT}}": initial_content,
        "{{REFERENCES}}": initial_references,
        "{{TOC_ITEMS}}": initial_toc,
        "{{SERIES_BANNER_TOP}}": "",
        "{{SERIES_BANNER_BOTTOM}}": ""
    }

    out_html = tmpl
    for k, v in replacements.items():
        out_html = out_html.replace(k, v)

    articles_dir = os.path.join(root_dir, "articles")
    os.makedirs(articles_dir, exist_ok=True)
    art_path = os.path.join(articles_dir, f"{slug}.html")

    with open(art_path, "w", encoding="utf-8") as f:
        f.write(out_html)

    print(f"Created article: articles/{slug}.html")
    if args.interactive:
        print(f"Created figure script: js/figs/{slug}.js")
    print(f"Added draft entry to content/posts.json")

if __name__ == "__main__":
    main()
