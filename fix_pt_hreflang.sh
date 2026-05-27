#!/bin/bash

# Mapping of Portuguese pages to their English equivalents
declare -A pt_to_en=(
    ["estudar-trabalhar-canada-brasileiros-estrategia-completa"]="work-and-study-in-canada"
    ["celular-no-canada-operadoras-planos-newcomers"]="canadian-cell-phone-plans-newcomers"
    ["ielts-para-imigracao-canada-brasileiros-clb9"]="ielts-for-immigration-clb-9-canadians"
    ["reunificacao-familiar-canada-brasil-sponsorship"]="family-sponsorship-canada-complete-guide-2026"
    ["super-visa-pais-canada-2026"]="super-visa-parents-grandparents-canada"
    ["visto-de-estudo-negado-canada-motivos-recorrer"]="study-permit-refused-canada-reasons-next-steps"
    ["abrir-conta-bancaria-canada-brasileiro"]="how-to-open-bank-account-canada-newcomers-2026"
    ["visto-visitante-canada-pais-brasileiros-filhos"]="visitor-visa-canada-parents-visiting"
)

for pt_slug in "${!pt_to_en[@]}"; do
    en_slug="${pt_to_en[$pt_slug]}"
    pt_file="pt/blog/${pt_slug}.html"
    
    if [ -f "$pt_file" ]; then
        # Fix the hreflang tags
        sed -i "s|hreflang=\"en\" href=\"[^\"]*\"|hreflang=\"en\" href=\"https://www.upimmigration.ca/blog/${en_slug}\"|g" "$pt_file"
        sed -i "s|hreflang=\"x-default\" href=\"[^\"]*\"|hreflang=\"x-default\" href=\"https://www.upimmigration.ca\"|g" "$pt_file"
        echo "[OK] $pt_file"
    else
        echo "[SKIP] $pt_file not found"
    fi
done
