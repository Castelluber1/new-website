#!/usr/bin/env python3
"""
Add canonical tags to all HTML files in the website.
Canonical URLs point to upimmigration.ca (the primary domain).
"""

import os
import re
from pathlib import Path

# Configuration
SITE_ROOT = Path(__file__).parent
PRIMARY_DOMAIN = "https://upimmigration.ca"

def get_url_path(file_path: Path, site_root: Path) -> str:
    """Convert file path to URL path."""
    relative = file_path.relative_to(site_root)

    # Remove .html extension (Vercel cleanUrls handles this)
    url_path = str(relative).replace('\\', '/')
    if url_path.endswith('.html'):
        url_path = url_path[:-5]

    # Special case: index.html -> /
    if url_path == 'index':
        url_path = ''

    return f"/{url_path}" if url_path else "/"

def has_canonical(content: str) -> bool:
    """Check if HTML already has a canonical tag."""
    return bool(re.search(r'<link[^>]+rel="canonical"', content, re.IGNORECASE))

def add_canonical(file_path: Path, site_root: Path, dry_run: bool = False) -> bool:
    """Add canonical tag to HTML file if missing."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has canonical
        if has_canonical(content):
            print(f"  SKIP: {file_path.name} - already has canonical")
            return False

        # Generate canonical URL
        url_path = get_url_path(file_path, site_root)
        canonical_url = f"{PRIMARY_DOMAIN}{url_path}"
        canonical_tag = f'\t<link rel="canonical" href="{canonical_url}" />\n'

        # Find </head> and insert before it
        if '</head>' not in content:
            print(f"  WARN: {file_path.name} - no </head> tag found")
            return False

        # Insert canonical before </head>
        new_content = content.replace('</head>', f'{canonical_tag}\t</head>')

        if dry_run:
            print(f"  ✓  {file_path.name} -> {canonical_url}")
            return True

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  OK {file_path.name} -> {canonical_url}")
        return True

    except Exception as e:
        print(f"  X {file_path.name} - Error: {e}")
        return False

def main():
    """Main function to add canonicals to all HTML files."""
    print("> Scanning for HTML files...")

    html_files = list(SITE_ROOT.rglob('*.html'))
    print(f"- Found {len(html_files)} HTML files\n")

    # Dry run first
    print("* DRY RUN - Checking which files need canonicals:\n")
    files_to_update = []

    for html_file in sorted(html_files):
        if add_canonical(html_file, SITE_ROOT, dry_run=True):
            files_to_update.append(html_file)

    if not files_to_update:
        print("\n* All files already have canonical tags!")
        return

    print(f"\nSUMMARY: Summary: {len(files_to_update)} files need canonical tags")
    print(f"   Already OK: {len(html_files) - len(files_to_update)} files")

    # Confirm
    response = input("\n? Add canonical tags to these files? (y/n): ")
    if response.lower() != 'y':
        print("X Cancelled")
        return

    # Actually add canonicals
    print("\nWRITING: Adding canonical tags...\n")
    success_count = 0

    for html_file in files_to_update:
        if add_canonical(html_file, SITE_ROOT, dry_run=False):
            success_count += 1

    print(f"\nOK Done! Added canonical tags to {success_count}/{len(files_to_update)} files")

if __name__ == '__main__':
    main()
