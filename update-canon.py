#!/usr/bin/env python3
import os
import re
from pathlib import Path

SITE_ROOT = Path(__file__).parent
OLD_DOMAIN = "https://upimmigration.ca"
NEW_DOMAIN = "https://www.upimmigration.ca"

def update_canonical(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file has old canonical
        if OLD_DOMAIN not in content:
            return False

        # Replace old domain with new domain
        new_content = content.replace(OLD_DOMAIN, NEW_DOMAIN)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"OK: {file_path.name}")
        return True

    except Exception as e:
        print(f"ERROR: {file_path.name} - {e}")
        return False

def main():
    html_files = list(SITE_ROOT.rglob('*.html'))

    # Skip partials/includes
    html_files = [f for f in html_files if 'sections' not in str(f)]

    print(f"Found {len(html_files)} HTML files")
    print(f"Updating: {OLD_DOMAIN} -> {NEW_DOMAIN}\n")

    count = 0
    for html_file in sorted(html_files):
        if update_canonical(html_file):
            count += 1

    print(f"\nDone! Updated {count} files")

if __name__ == '__main__':
    main()
