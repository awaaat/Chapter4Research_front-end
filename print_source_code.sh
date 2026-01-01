#!/bin/bash

# ============================
# Freelance Frontend - Full Source Export
# ============================

OUTPUT="FREELANCE_FRONTEND_ALL_CODE.md"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Overwrite the output file
> "$OUTPUT"

echo "# Full Frontend Source Code - Freelance Platform (React + TypeScript + Vite)" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "*Generated on $(date)*" >> "$OUTPUT"
echo "*Project root: $PROJECT_ROOT*" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# File extensions we actually care about (CSS REMOVED)
EXTENSIONS="tsx ts jsx js json tsconfig.json vite.config.ts env .env.example"

echo "Collecting source files..."
echo "This may take a few seconds..."

file_count=0

for ext in $EXTENSIONS; do
    if [[ "$ext" == *.json ]] || [[ "$ext" == tsconfig* ]] || [[ "$ext" == vite.config* ]] || [[ "$ext" == .env* ]]; then
        # Special handling for config files
        case "$ext" in
            *.json)
                find "$PROJECT_ROOT" -maxdepth 2 -name "*.json" \
                    -not -name "package-lock.json" \
                    -not -path "*/node_modules/*" \
                    -not -path "*/dist/*"
                ;;
            tsconfig*)
                find "$PROJECT_ROOT" -name "tsconfig*.json"
                ;;
            vite.config*)
                find "$PROJECT_ROOT" -name "vite.config.*"
                ;;
            .env*)
                find "$PROJECT_ROOT" -maxdepth 1 -name ".env*"
                ;;
        esac
    else
        # Regular source files (CSS explicitly excluded)
        find "$PROJECT_ROOT" -type f -name "*.${ext}" \
            -not -path "*/node_modules/*" \
            -not -path "*/dist/*" \
            -not -path "*/build/*" \
            -not -path "*/.git/*" \
            -not -path "*/public/*" \
            -not -path "*/coverage/*" \
            -not -path "*/.vite/*"
    fi
done | sort | while read -r file; do
    [[ ! -f "$file" ]] && continue

    rel_path="${file#$PROJECT_ROOT/}"
    ext="${file##*.}"

    echo "## File: \`$rel_path\`" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    # Choose language for syntax highlighting
    case "$ext" in
        ts)  lang="typescript" ;;
        tsx) lang="tsx" ;;
        js|jsx) lang="javascript" ;;
        json) lang="json" ;;
        env*) lang="bash" ;;
        *) lang="text" ;;
    esac

    echo "\`\`\`$lang" >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "\`\`\`" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "---" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    ((file_count++))
done

# Final summary
echo "" >> "$OUTPUT"
echo "# Summary" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Total files exported: **$file_count**" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Done! Open the file below and copy-paste everything to send:" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "→ **$OUTPUT**" >> "$OUTPUT"

echo "======================================================"
echo "Exported $file_count source files successfully!"
echo "OPEN THIS FILE → $(pwd)/$OUTPUT"
echo "Just copy the entire content and send it to the AI!"
echo "======================================================"
