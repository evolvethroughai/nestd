#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
git add .
git status
git commit -m "${1:-Save changes}"
git push origin studio
