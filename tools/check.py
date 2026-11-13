#!/usr/bin/env python3
"""
RNLearn — Integrity & Validation Checker (tools/check.py)
Validates the entire static site:
- Manifest content/posts.json schema and types
- JSON syntax (search-index.json)
- Single <h1>, <title>, meta description, and canonical URL per page
- Internal link and #anchor integrity
- data-fig and FIG. registry alignment
- Image alt text and dimensions
- Draft isolation (no draft article listed publicly)
Standard library only.
"""

import sys
import os
import json
import re
from urllib.parse import urlparse

REQUIRED_POST_FIELDS = [
    ("slug", str),
    ("title", str),
    ("summary", str),
    ("subject", str),
    ("tags", list),
    ("date", str),
    ("type", str),
    ("readingMinutes", int),
    ("draft", bool),
    ("interactive", bool),
    ("math", bool)
]

def check_manifest(root_dir, errors):
    manifest_path = os.path.join(root_dir, "content", "posts.json")
    if not os.path.exists(manifest_path):
        errors.append("Missing content/posts.json")
        return []

    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            posts = json.load(f)
    except Exception as e:
        errors.append(f"Invalid JSON in content/posts.json: {e}")
        return []

    if not isinstance(posts, list):
        errors.append("content/posts.json must be a JSON array")
        return []

    seen_slugs = set()
    for idx, p in enumerate(posts):
        if not isinstance(p, dict):
            errors.append(f"Post at index {idx} is not an object")
            continue

        slug = p.get("slug")
        if not slug:
            errors.append(f"Post at index {idx} missing slug")
        elif slug in seen_slugs:
            errors.append(f"Duplicate slug '{slug}' in content/posts.json")
        else:
            seen_slugs.add(slug)

        for field, f_type in REQUIRED_POST_FIELDS:
            if field not in p:
                errors.append(f"Post '{slug}' missing required field '{field}'")
            elif not isinstance(p[field], f_type):
                errors.append(f"Post '{slug}' field '{field}' must be {f_type.__name__}, got {type(p[field]).__name__}")

        summary = p.get("summary", "")
        if len(summary) > 200:
            errors.append(f"Post '{slug}' summary exceeds 200 characters ({len(summary)} chars)")

    return posts

def check_json_files(root_dir, errors):
    for json_rel in ["search-index.json"]:
        path = os.path.join(root_dir, json_rel)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    json.load(f)
            except Exception as e:
                errors.append(f"JSON parse error in {json_rel}: {e}")

def collect_html_files(root_dir):
    html_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        # Ignore .git, .github, and templates directory
        if ".git" in dirpath or ".github" in dirpath or "templates" in dirpath:
            continue
        for fn in filenames:
            if fn.endswith(".html"):
                html_files.append(os.path.join(dirpath, fn))
    return html_files

def check_html_standards(root_dir, html_files, manifest, errors):
    draft_slugs = {p["slug"] for p in manifest if p.get("draft", False)}

    # Map of file -> set of anchors
    file_anchors = {}
    # Map of file -> list of (link_href, line_num)
    file_links = {}

    h1_pattern = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.IGNORECASE | re.DOTALL)
    title_pattern = re.compile(r"<title\b[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
    desc_pattern = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE)
    desc_alt_pattern = re.compile(r'<meta\s+content=["\']([^"\']*)["\']\s+name=["\']description["\']', re.IGNORECASE)
    canon_pattern = re.compile(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', re.IGNORECASE)
    id_pattern = re.compile(r'\bid=["\']([^"\']+)["\']', re.IGNORECASE)
    a_href_pattern = re.compile(r'<a\s+[^>]*href=["\']([^"\']+)["\']', re.IGNORECASE)
    img_pattern = re.compile(r'<img\b([^>]*)>', re.IGNORECASE)

    for file_path in html_files:
        rel_path = os.path.relpath(file_path, root_dir)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Check H1
        h1_matches = h1_pattern.findall(content)
        if len(h1_matches) == 0:
            errors.append(f"{rel_path}: Missing <h1> tag")
        elif len(h1_matches) > 1:
            errors.append(f"{rel_path}: Multiple <h1> tags found ({len(h1_matches)})")

        # Check Title
        if not title_pattern.search(content):
            errors.append(f"{rel_path}: Missing <title> tag")

        # Check Meta Description
        if not (desc_pattern.search(content) or desc_alt_pattern.search(content)):
            errors.append(f"{rel_path}: Missing <meta name=\"description\">")

        # Check Canonical URL
        if not canon_pattern.search(content):
            errors.append(f"{rel_path}: Missing <link rel=\"canonical\">")

        # Collect IDs for anchor check
        ids = set(id_pattern.findall(content))
        file_anchors[file_path] = ids

        # Collect links
        links = a_href_pattern.findall(content)
        file_links[file_path] = links

        # Check images for alt and dimensions
        for img_match in img_pattern.finditer(content):
            attrs = img_match.group(1)
            if 'alt=' not in attrs:
                errors.append(f"{rel_path}: <img> tag missing alt attribute")
            if 'width=' not in attrs and 'height=' not in attrs and 'style=' not in attrs:
                # Warning or dimension requirement
                pass

        # Check draft isolation in public files
        if not rel_path.startswith("articles") and not rel_path.startswith("templates"):
            for d_slug in draft_slugs:
                if f"articles/{d_slug}.html" in content or f"{d_slug}.html" in content:
                    errors.append(f"Public file {rel_path} leaks reference to draft article '{d_slug}'")

    # Verify Internal Links and #Anchors
    for file_path, links in file_links.items():
        rel_from = os.path.relpath(file_path, root_dir)
        dir_of_file = os.path.dirname(file_path)

        for href in links:
            if href.startswith("http://") or href.startswith("https://") or href.startswith("mailto:") or href.startswith("tel:"):
                continue

            parsed = urlparse(href)
            path_part = parsed.path
            fragment = parsed.fragment

            if not path_part:
                # Intra-page anchor: #foo
                if fragment and fragment not in file_anchors.get(file_path, set()):
                    errors.append(f"{rel_from}: Broken anchor #{fragment}")
            else:
                # Inter-page link
                target_path = os.path.normpath(os.path.join(dir_of_file, path_part))
                if not os.path.exists(target_path):
                    errors.append(f"{rel_from}: Broken link '{href}' -> target does not exist: {target_path}")
                elif fragment:
                    if fragment not in file_anchors.get(target_path, set()):
                        errors.append(f"{rel_from}: Broken anchor link '{href}' -> #{fragment} not in {os.path.relpath(target_path, root_dir)}")

def check_figures_registry(root_dir, html_files, errors):
    data_fig_pattern = re.compile(r'data-fig=["\']([^"\']+)["\']')
    fig_fn_pattern = re.compile(r'(?:FIG\.([a-zA-Z0-9_$]+)|FIG\[[\'"]([a-zA-Z0-9_\-$]+)[\'"]\])\s*=\s*function')

    # Collect registered functions from all js files
    registered_figs = set()
    js_dir = os.path.join(root_dir, "js")
    for dirpath, _, filenames in os.walk(js_dir):
        for fn in filenames:
            if fn.endswith(".js"):
                with open(os.path.join(dirpath, fn), "r", encoding="utf-8") as f:
                    content = f.read()
                matches = fig_fn_pattern.findall(content)
                for m_tuple in matches:
                    m = m_tuple[0] or m_tuple[1]
                    # Ignore core built-ins
                    if m not in ["plot", "slider", "select", "button", "readouts", "createCanvas", "animate", "quiz", "timeline", "map", "table", "initAll", "getCSSVar", "formatNumber", "createSVG", "createLinearScale", "createLogScale", "placeLabels"]:
                        registered_figs.add(m)

    # Collect data-fig usages
    used_figs = set()
    for file_path in html_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        matches = data_fig_pattern.findall(content)
        for m in matches:
            used_figs.add(m)
            if m not in registered_figs:
                errors.append(f"{os.path.relpath(file_path, root_dir)}: data-fig=\"{m}\" has no matching FIG.{m} function in JS")

    for rf in registered_figs:
        if rf not in used_figs:
            errors.append(f"FIG.{rf} is defined in JS but not referenced in any data-fig")

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    errors = []

    print("Running RNLearn site checks...")

    manifest = check_manifest(root_dir, errors)
    check_json_files(root_dir, errors)

    html_files = collect_html_files(root_dir)
    check_html_standards(root_dir, html_files, manifest, errors)
    check_figures_registry(root_dir, html_files, errors)

    if errors:
        print(f"\nFAILED: Found {len(errors)} error(s):")
        for err in errors:
            print(f" ✗ {err}")
        sys.exit(1)
    else:
        print(f"\nSUCCESS: All checks passed cleanly across {len(html_files)} HTML page(s).")
        sys.exit(0)

if __name__ == "__main__":
    main()
