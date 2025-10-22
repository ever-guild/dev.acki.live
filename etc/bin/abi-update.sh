#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")" && pwd)

if [[ -z "${TVC_PATH}" ]]; then
  echo "ERROR: var TVC_PATH not setup"
  exit 1
fi

TARGET_PATH="$ROOT_DIR/static/abi"
mkdir -p "$TARGET_PATH"

countFiles() {
  find "$1" -maxdepth 1 -type f | wc -l | tr -d ' '
}

isGitRepo() {
  git -C "$TVC_PATH" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

ensureCleanRepo() {
  if [[ -n "$(git -C "$TVC_PATH" status --porcelain)" ]]; then
    echo "ERROR: the repository has uncommitted changes"
    exit 2
  fi
}

update() {
  local before after added
  before="$(countFiles "$TARGET_PATH")"

  find "$TVC_PATH" -type f -name "*.tvc" | while read -r file; do
    stateInit=$(tvm-cli --json decode stateinit --tvc "$file")
    codePath="$(dirname "$file")"
    codeName="$(basename "$file" .tvc)"
    codeHash="$(echo "$stateInit" | jq -r .code_hash)"
    codeVersion="$(echo "$stateInit" | jq -r .version)"
    abiPath="$codePath/$codeName.abi.json"

    if [[ ! -f "$abiPath" ]]; then
      echo "WARNING: ABI not found: $abiPath" >&2
      continue
    fi

    abi=$(cat "$abiPath")
    data=$(printf '{ "name": "%s", "compiler": "%s", "abi": %s }' "$codeName" "$codeVersion" "$abi")
    target="$TARGET_PATH/$codeHash"
    if [[ ! -f "$target" ]]; then
      echo "$data" | jq 'to_entries | sort_by(.key) | reverse | from_entries' > "$target"
    fi
  done

  after="$(countFiles "$TARGET_PATH")"
  added=$(( after - before ))
  echo "$added"
}

if ! isGitRepo; then
  total="$(update)"
  echo "Database ABI updated $total"
else
  ensureCleanRepo
  origRef="main"
  mapfile -t tagList < <(git -C "$TVC_PATH" tag --sort=creatordate)

  total=0
  for tag in "${tagList[@]}"; do
    git -C "$TVC_PATH" checkout -q "$tag"
    added="$(update)"
    echo "tag $tag added +$added"
    total=$(( total + added ))
  done

  git -C "$TVC_PATH" checkout -q "$origRef"

  echo "Database ABI updated (+$total)"
fi
