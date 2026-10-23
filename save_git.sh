#!/usr/bin/env bash
set -euo pipefail

# Always save the active checkout, including when an older copy is invoked.
repo_dir='C:/Users/evolvethroughai/OneDrive/Desktop/evolvethroughai/Apps/Nestd/Codebase/Stitch_studio_Nestd/nestd'
cd "$repo_dir"

remote_url=$(git remote get-url origin)
case "$remote_url" in
  https://github.com/evolvethroughai/nestd|https://github.com/evolvethroughai/nestd.git|git@github.com:evolvethroughai/nestd.git) ;;
  *) printf 'Unexpected origin: %s\n' "$remote_url" >&2; exit 1 ;;
esac

if [[ $(git branch --show-current) != studio ]]; then
  printf 'Switch the active Nestd checkout to studio before saving.\n' >&2
  exit 1
fi

printf 'Saving repository: %s\n' "$(git rev-parse --show-toplevel)"
git add -A
git status --short
if git diff --cached --quiet; then
  printf 'No new changes to commit; pushing existing commits.\n'
else
  git commit -m "${1:-Save changes}"
fi
git push origin HEAD:studio
