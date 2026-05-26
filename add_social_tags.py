#!/usr/bin/env python3
import os
import re
from pathlib import Path

def extract_title_and_description(content):
    """Extract title and description from HTML content."""
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)

    title = title_match.group(1) if title_match else "Up Immigration"
    description = desc_match.group(1) if desc_match else "Immigration consulting for Canada"

    return title, description

def get_og_image(filepath, title, content):
    """Determine the best OG image for a page."""
    path_str = filepath.lower()

    # Blog posts: extract from blog-header-img if available
    if '/blog/' in path_str:
        img_match = re.search(r'<img[^>]+src="([^"]*blog-header-img[^"]*)"', content, re.IGNORECASE)
        if img_match:
            img_src = img_match.group(1)
            if img_src.startswith('/'):
                return f"https://www.upimmigration.ca{img_src}"
            return img_src
        # Fallback for blog posts
        return "https://www.upimmigration.ca/img-blog/banking-mobile-canada.jpg"

    # Default: site logo
    return "https://www.upimmigration.ca/img/logo.webp"

def has_og_tags(content):
    """Check if file already has Open Graph tags."""
    return 'property="og:title"' in content

def add_social_tags(filepath):
    """Add social media tags to an HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has OG tags
    if has_og_tags(content):
        return False

    # Skip section/fragment files
    if '/sections/' in filepath:
        return False

    # Skip draft files for now
    if '/drafts/' in filepath:
        return False

    title, description = extract_title_and_description(content)
    og_image = get_og_image(filepath, title, content)

    # Remove trailing " - Up Immigration" for cleaner og:title
    title_clean = re.sub(r'\s*–\s*Up Immigration$', '', title)
    title_clean = re.sub(r'\s*-\s*Up Immigration$', '', title_clean)

    # Build the canonical URL for og:url
    # Convert filepath to URL path
    relative_path = filepath.replace('\\', '/').split('New Website/')[-1]
    if relative_path == 'index.html':
        canonical_url = "https://www.upimmigration.ca/"
    elif relative_path == 'pt/index.html':
        canonical_url = "https://www.upimmigration.ca/pt/"
    else:
        canonical_url = f"https://www.upimmigration.ca/{relative_path.replace('index.html', '').rstrip('/')}"
        if not canonical_url.endswith('/'):
            canonical_url = canonical_url.replace('.html', '')

    og_tags = f'''		<meta property="og:title" content="{title_clean}" />
		<meta property="og:description" content="{description}" />
		<meta property="og:image" content="{og_image}" />
		<meta property="og:url" content="{canonical_url}" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="{title_clean}" />
		<meta name="twitter:description" content="{description}" />
		<meta name="twitter:image" content="{og_image}" />
'''

    # Find insertion point - before </head> tag
    insert_pos = content.rfind('</head>')
    if insert_pos == -1:
        print(f"  SKIP: No </head> tag found in {filepath}")
        return False

    # Find the last <link> or <script> tag before </head> to insert after
    content_before_head = content[:insert_pos]

    # Insert before the last </head>, after the last meta/link/script tag
    last_tag_pos = max(
        content_before_head.rfind('<meta'),
        content_before_head.rfind('<link'),
        content_before_head.rfind('<script')
    )

    if last_tag_pos != -1:
        # Find the end of that tag
        end_pos = content_before_head.find('>', last_tag_pos) + 1
        # Find next newline or insert position
        insert_pos = end_pos

    # Insert the OG tags
    new_content = content[:insert_pos] + '\n' + og_tags + content[insert_pos:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    website_dir = Path(r'C:\Users\Caio Acer\Desktop\Development\New Website')

    # Find all HTML files excluding sections and drafts
    html_files = []
    for html_file in website_dir.rglob('*.html'):
        filepath_str = str(html_file)

        # Skip sections
        if '/sections/' in filepath_str:
            continue

        # Skip draft files for now
        if '/drafts/' in filepath_str:
            continue

        html_files.append(html_file)

    html_files.sort()

    added_count = 0
    skipped_count = 0

    print(f"Found {len(html_files)} HTML files to process\n")

    for html_file in html_files:
        filepath_str = str(html_file)
        relative_path = filepath_str.replace(str(website_dir) + '\\', '')

        try:
            if add_social_tags(filepath_str):
                print(f"[OK] {relative_path}")
                added_count += 1
            else:
                skipped_count += 1
        except Exception as e:
            print(f"[ERROR] {relative_path}: {e}")
            skipped_count += 1

    print(f"\n---")
    print(f"Added social tags to {added_count} files")
    print(f"Skipped {skipped_count} files (already have tags or sections)")

if __name__ == '__main__':
    main()
