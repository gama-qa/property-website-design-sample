#!/usr/bin/env bash
# Encode source footage for scroll scrubbing.
#
#   bash scripts/process-video.sh
#
# Every frame is a keyframe (-g 1) so seeking to any currentTime is instant.
# No audio, yuv420p, faststart. Both versions keep the source resolution (max
# 1920w, never upscaled). A phone shows the footage enlarged about 3x (portrait
# crop of a 16:9 frame on a 3x screen), so the earlier 960w mobile file looked blurry.
# Source files in /source-video are never modified.
#
# Frame interpolation: a clip can be doubled to 48 fps with motion-compensated
# interpolation (minterpolate, mci). The source moves fast and has only 240
# frames, so without it every scroll step is a visible jump. mci was compared
# with plain blending on the hardest moments (door frame, curtain): blending
# doubles every edge, mci stays clean. Exactly 2x means every other frame is
# an original.
#
# Only the current source-video material is used. Earlier clips (house-01,
# apartment-01) are retired and referenced nowhere.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/source-video"
OUT_D="$ROOT/public/video/desktop"
OUT_M="$ROOT/public/video/mobile"
# Desktop is shown fullscreen and upscaled from 720p, so it gets the higher
# quality. Measured with ffmpeg blurdetect: CRF 23 visibly loses sharpness
# against the source, CRF 20 keeps most of it and stays under the 15 MB budget.
# Mobile: same resolution at CRF 22, slightly smaller (blurdetect mean 5.66,
# vs 5.59 at CRF 20 and 5.43 for the lossless master; 12.2 MB vs 14.9 MB).
CRF_DESKTOP="${CRF_DESKTOP:-20}"
CRF_MOBILE="${CRF_MOBILE:-22}"
# Interpolated frames come out softer than the originals next to them, which
# shows as shimmer when scrolling slowly. Sharpening only those frames (cas)
# by this amount brings both to the same measured sharpness.
INTERP_SHARPEN="${INTERP_SHARPEN:-0.4}"
TMP="$(mktemp -d)"
mkdir -p "$OUT_D" "$OUT_M"

# name | output slug | crop filter (empty = none) | output fps | interpolate (yes/no)
CLIPS=(
  # 1280x720 24fps, single take, with audio: facade -> door -> living -> kitchen -> bedroom -> terrace
  "property-1|house-02||48|yes"
)

encode() { # in out maxwidth crf
  local in="$1" out="$2" w="$3" crf="$4"
  ffmpeg -v error -stats -y -i "$in" -an \
    -vf "scale='min(${w},iw)':-2:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -profile:v high -crf "$crf" \
    -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 \
    -pix_fmt yuv420p -movflags +faststart "$out"
}

for entry in "${CLIPS[@]}"; do
  IFS='|' read -r name slug crop fps interp <<<"$entry"
  echo "== $name -> $slug (crf $CRF_DESKTOP desktop / $CRF_MOBILE mobile, ${fps}fps, interpolate: $interp)"

  # One lossless intermediate at source size, so interpolation runs once.
  mid="$TMP/$slug.mkv"
  if [ "$interp" = "yes" ]; then
    # Exactly 2x: even output frames are originals, odd ones are interpolated
    # (and sharpened to match). The player rests on even frames.
    timing="minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none,cas=strength=${INTERP_SHARPEN}:enable='mod(n,2)'"
  else
    timing="fps=${fps}"
  fi
  ffmpeg -v error -stats -y -i "$SRC/$name.mp4" -an -vf "${crop:+$crop,}${timing}" \
    -c:v libx264 -preset fast -qp 0 -g 1 -pix_fmt yuv420p "$mid"

  encode "$mid" "$OUT_D/$slug.mp4" 1920 "$CRF_DESKTOP"
  encode "$mid" "$OUT_M/$slug.mp4" 1920 "$CRF_MOBILE"
done

echo "== done"
ls -l "$OUT_D" "$OUT_M"
