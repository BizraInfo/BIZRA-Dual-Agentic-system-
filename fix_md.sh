#!/bin/bash
file=$1
# Add newline before code blocks if missing
sed -i '/^[^[:space:]].*/{N;s/\n```/\n\n```/;P;D;}' "$file"
# Add newline after code blocks if missing
sed -i '/^```/{N;s/```\n[^[:space:]]/```\n\n/;P;D;}' "$file"
# Ensure one newline before headers
sed -i '/^[^#\n].*/{N;s/\n#/\n\n#/;P;D;}' "$file"
