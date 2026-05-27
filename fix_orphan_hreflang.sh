#!/bin/bash

# List of files that don't have PT equivalents
files=(
  "blog/teer-0-1-2-3-jobs-canada-express-entry.html"
  "blog/family-sponsorship-canada-complete-guide-2026.html"
  "blog/express-entry-draws-crs-cutoff-history-2024-2026.html"
  "blog/how-to-open-bank-account-canada-newcomers-2026.html"
  "blog/pnp-vs-express-entry-which-path.html"
  "blog/oinp-scoring-factors-explained.html"
  "blog/express-entry-software-engineers-noc-21232.html"
  "blog/study-permit-refused-canada-reasons-next-steps.html"
  "blog/express-entry-profile-expires-365-days.html"
  "blog/eca-for-express-entry-wes-iqas-icas-ces-comparison.html"
  "blog/canada-work-permit-refused-gcms-reapplication.html"
  "blog/express-entry-canada-processing-time.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Remove hreflang="pt-BR" lines
    sed -i '/hreflang="pt-BR"/d' "$file"
    echo "[OK] $file"
  else
    echo "[SKIP] $file not found"
  fi
done
