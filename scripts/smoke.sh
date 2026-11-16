#!/usr/bin/env bash
set -euo pipefail
base="${1:?Usage: scripts/smoke.sh BASE_URL EXPECTED_REVISION}"
revision="${2:?Expected revision is required}"
base="${base%/}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for path in / /prep/supplements/ /glossary/ /search.json /version.json; do
  curl --fail --silent --show-error --retry 5 --retry-delay 3 --retry-all-errors \
    --connect-timeout 10 --max-time 30 "$base$path" -o "$tmp/response"
  if [ "$path" = / ]; then cp "$tmp/response" "$tmp/index.html"; fi
  case "$path" in
    /search.json) python3 -c 'import json,sys; x=json.load(open(sys.argv[1])); assert isinstance(x,list) and len(x)>0' "$tmp/response" ;;
    /version.json) python3 -c 'import json,sys; assert json.load(open(sys.argv[1]))["revision"] == sys.argv[2]' "$tmp/response" "$revision" ;;
    *) grep -q '<html' "$tmp/response" ;;
  esac
done
python3 - "$tmp/index.html" > "$tmp/assets" <<'PYTHON'
from html.parser import HTMLParser
import sys
class Assets(HTMLParser):
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        path = a.get('src') if tag == 'script' else a.get('href') if tag == 'link' and a.get('rel') == 'stylesheet' else None
        if path and path.startswith('/_astro/'):
            print(path)
parser = Assets()
parser.feed(open(sys.argv[1]).read())
PYTHON
test -s "$tmp/assets"
while IFS= read -r asset; do
  curl --fail --silent --show-error --connect-timeout 10 --max-time 30 "$base$asset" -o "$tmp/asset"
  test -s "$tmp/asset"
done < "$tmp/assets"
status="$(curl --silent --show-error --connect-timeout 10 --max-time 30 -o /dev/null -w '%{http_code}' "$base/__shengyu_missing_page__")"
test "$status" = 404
echo 'Shengyu pages, search index, revision and 404 are healthy.'
