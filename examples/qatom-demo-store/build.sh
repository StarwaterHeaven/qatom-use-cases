#!/usr/bin/env bash
# Builds the Qatom Demo store's static assets into ./public:
#   - HLS ladder (1080p/720p/480p) + poster from NASA's "Space Station Fisheye Fly-Through 4K" (public domain, ~108 MB)
#   - the qatom-seller-guide skill as a zip, from the canonical GitHub repo
#   - public/meta.json (video title and duration; skill version, size, SHA-256, file list)
# Needs: curl, ffmpeg/ffprobe, git, zip, shasum. Usage: bash build.sh [path-to-your-own-video]
set -euo pipefail
cd "$(dirname "$0")"
SRC="${1:-Space-Station-Fisheye-Fly-Through-4K_Ultra-HD.mp4}"
if [ ! -f "$SRC" ]; then
  echo "==> downloading the NASA source (about 108 MB, resumable)"
  curl -L -C - --retry 5 -o "$SRC" "https://archive.org/download/NASA-Ultra-High-Definition/Space-Station-Fisheye-Fly-Through-4K_Ultra-HD.mp4"
fi
command -v ffmpeg >/dev/null || { echo "ffmpeg is required (macOS: brew install ffmpeg)"; exit 1; }
HLS=public/hls; rm -rf "$HLS"; mkdir -p "$HLS/1080p" "$HLS/720p" "$HLS/480p"
encode () {
  echo "==> encoding $1"
  ffmpeg -hide_banner -loglevel error -stats -y -i "$SRC" -map 0:v:0 -map 0:a? \
    -c:v libx264 -preset veryfast -profile:v high -level 4.1 -pix_fmt yuv420p \
    -vf "scale=-2:$2:flags=lanczos" -b:v "$3" -maxrate "$4" -bufsize "$5" \
    -g 48 -keyint_min 48 -sc_threshold 0 -c:a aac -b:a 128k -ac 2 \
    -f hls -hls_time 4 -hls_playlist_type vod -hls_flags independent_segments \
    -hls_segment_filename "$HLS/$1/seg_%03d.ts" "$HLS/$1/index.m3u8"
}
encode 1080p 1080 5000k 5350k 7500k
encode 720p   720 2800k 2996k 4200k
encode 480p   480 1400k 1498k 2100k
cat > "$HLS/master.m3u8" <<'M3U'
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:BANDWIDTH=5500000,AVERAGE-BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,AVERAGE-BANDWIDTH=2800000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,AVERAGE-BANDWIDTH=1400000,RESOLUTION=854x480
480p/index.m3u8
M3U
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$SRC" | cut -d. -f1)
ffmpeg -hide_banner -loglevel error -y -ss 10 -i "$SRC" -frames:v 1 -vf "scale=1280:-2" -q:v 3 public/poster.jpg
BIG=$(find "$HLS" -type f -size +24M | wc -l | tr -d ' ')
[ "$BIG" = "0" ] || { echo "!! $BIG file(s) exceed Cloudflare's 25 MiB static-asset limit; lower the bitrate"; exit 1; }

echo "==> packaging the seller guide skill"
rm -rf .sg public/dl; mkdir -p public/dl
git clone -q --depth 1 https://github.com/StarwaterHeaven/qatom-seller-guide .sg
VER=$(grep -m1 -oE 'Version [0-9]+\.[0-9]+' .sg/skills/qatom-seller-guide/SKILL.md | awk '{print $2}')
ZIP="qatom-seller-guide-$VER.zip"
(cd .sg/skills && zip -qr "../../public/dl/$ZIP" qatom-seller-guide)
cp .sg/LICENSE public/dl/LICENSE.txt 2>/dev/null || true
BYTES=$(wc -c < "public/dl/$ZIP" | tr -d ' ')
SHA=$(shasum -a 256 "public/dl/$ZIP" | awk '{print $1}')
FILES=$(cd .sg/skills && find qatom-seller-guide -type f | sort | sed 's/.*/"&"/' | paste -sd, -)
rm -rf .sg
cat > public/meta.json <<JSON
{ "video": { "title": "Space Station fisheye fly-through (NASA, 4K)", "duration_seconds": $DUR },
  "seller_guide": { "version": "$VER", "file": "$ZIP", "bytes": $BYTES, "sha256": "$SHA", "files": [$FILES] } }
JSON
echo "==> done: $(find "$HLS" -type f | wc -l | tr -d ' ') stream files, $ZIP ($BYTES bytes), video ${DUR}s"
