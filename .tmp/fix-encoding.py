"""
Fix UTF-8 encoding corruption in draft HTML files.
The PowerShell script read files as Windows-1252 and wrote as UTF-8,
causing double-encoding. This reverses it: encode back to latin-1 bytes,
then decode as UTF-8 to recover original characters.
"""
import os
import glob

drafts_dir = r"C:\Users\Caio Acer\Desktop\Development\New Website\drafts"

fixed_count = 0
skipped = []

for filepath in sorted(glob.glob(os.path.join(drafts_dir, "*.html"))):
    basename = os.path.basename(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Quick check: corrupted files have "Ã" or "â€" patterns
    if 'Ã' not in content and 'â€' not in content and 'Â' not in content:
        continue

    try:
        fixed = content.encode('latin-1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError) as e:
        skipped.append(f"{basename}: {e}")
        continue

    if fixed == content:
        continue

    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(fixed)

    fixed_count += 1
    print(f"Fixed: {basename}")

print(f"\nTotal fixed: {fixed_count}")
if skipped:
    print(f"\nSkipped (could not auto-fix):")
    for s in skipped:
        print(f"  {s}")
