"""
Remove the Appendix/Fact-check section from all draft HTML files.
Reads and writes as UTF-8 without BOM, preserving correct encoding.

Pattern: (optional <hr />) + <h2>Appendix...> ... (all content) ... (closing </div>)
The closing </div> (which closes .article-body, immediately before <aside>) is
captured and re-inserted so the page structure stays valid.
"""
import os
import re
import glob

drafts_dir = r"C:\Users\Caio Acer\Desktop\Development\New Website\drafts"

# Captures: optional <hr /> + <h2>Appendix...> + all content + whitespace + </div>
# Lookahead ensures we stop at the </div> that precedes <aside>
appendix_pattern = re.compile(
    r'(?:[ \t]*<hr[ \t]*/>\r?\n)?[ \t]*<h2[^>]*>Appendix\b.*?([ \t]*</div>)(?=[ \t\r\n]*<aside)',
    re.DOTALL | re.IGNORECASE
)

fixed_count = 0
no_match = []

for filepath in sorted(glob.glob(os.path.join(drafts_dir, "*.html"))):
    basename = os.path.basename(filepath)

    # utf-8-sig strips BOM if present
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    if not re.search(r'<h2[^>]*>Appendix\b', content, re.IGNORECASE):
        continue

    # Replace match with just the captured </div> (preserves indentation)
    new_content, n = appendix_pattern.subn(r'\n\1', content)

    if n == 0:
        no_match.append(basename)
        print(f"WARNING — pattern not matched: {basename}")
        continue

    # Write back as UTF-8 without BOM
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)

    fixed_count += 1
    print(f"Fixed: {basename}")

print(f"\nTotal fixed: {fixed_count}")
if no_match:
    print(f"\nCheck manually: {no_match}")
