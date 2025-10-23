#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")" && pwd)
: "${TVC_PATH:?ERROR: var TVC_PATH not setup}"

TARGET_PATH="$ROOT_DIR/static/abi"
mkdir -p "$TARGET_PATH"

main() {
  local pairs_json='[]'
  declare -A seen_hash=()

  # нет сабшелла: читаем из process substitution; нулевые разделители — безопасно для любых имен
  while IFS= read -r -d '' file; do
    stateInit=$(tvm-cli --json decode stateinit --tvc "$file")
    codeName="$(basename "$file" .tvc)"
    codeHash="$(echo "$stateInit" | jq -r .code_hash)"

    # пропускаем пустые/некорректные хэши на всякий случай
    [[ -z "$codeHash" || "$codeHash" == "null" ]] && continue

    if [[ -z "${seen_hash[$codeHash]:-}" ]]; then
      seen_hash["$codeHash"]=1
      pairs_json=$(jq --arg name "$codeName" --arg hash "$codeHash" '. + [[ $name, $hash ]]' <<<"$pairs_json")
    fi
  done < <(find "$TVC_PATH" -type f -name "*.tvc" -print0)

  echo "$pairs_json"
}

main | jq 'sort_by(.[0])' > "$TARGET_PATH/last"
echo "Index written: $TARGET_PATH/last"
