#!/usr/bin/env python3
import os
import re
from pathlib import Path

SITE_ROOT = Path(__file__).parent
PRIMARY_DOMAIN = "https://upimmigration.ca"

def get_url_path(file_path, site_root):
    relative = file_path.relative_to(site_root)
    url_path = str(relative).replace('\\', '/')
    if url_path.endswith('.html'):
        url_path = url_path[:-5]
    if url_path == 'index':
        url_path = ''
    return f"/{url_path}" if url_path else "/"

def has_canonical(content):
    return bool(re.search(r'<link[^>]+rel="canonical"', content, re.IGNORECASE))

def add_canonical(file_path, site_root):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if has_canonical(content):
            return False

        url_path = get_url_path(file_path, site_root)
        canonical_url = f"{PRIMARY_DOMAIN}{url_path}"
        canonical_tag = f'\t<link rel="canonical" href="{canonical_url}" />\n'

        if '</head>' not in content:
            return False

        new_content = content.replace('</head>', f'{canonical_tag}\t</head>')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"OK: {file_path.name} -> {canonical_url}")
        return True

    except Exception as e:
        print(f"ERROR: {file_path.name} - {e}")
        return False

def main():
    html_files = list(SITE_ROOT.rglob('*.html'))

    # Skip partials/includes
    html_files = [f for f in html_files if 'sections' not in str(f)]

    print(f"Found {len(html_files)} HTML files")

    count = 0
    for html_file in sorted(html_files):
        if add_canonical(html_file, SITE_ROOT):
            count += 1

    print(f"\nDone! Added canonical tags to {count} files")

if __name__ == '__main__':
    main()
