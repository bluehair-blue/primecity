#!/bin/bash
# Deploy all 8 SVG Workers to Cloudflare
# Usage: cd workers/deploy && bash deploy.sh
# Requires: wrangler login (run once before deploying)

WORKERS_DIR=".."

declare -A WORKERS
WORKERS[svg-insta]="svg-sns.js"
WORKERS[svg-twit]="svg-tweet.js"
WORKERS[svg-live]="svg-livestream.js"
WORKERS[svg-talk]="svg-messenger.js"
WORKERS[svg-news]="svg-news.js"
WORKERS[svg-chart]="svg-chart.js"
WORKERS[svg-community]="svg-community.js"
WORKERS[svg-post]="svg-post.js"
WORKERS[svg-tablet]="svg-tablet.js"
WORKERS[svg-schedule]="svg-schedule.js"

for NAME in "${!WORKERS[@]}"; do
  FILE="${WORKERS[$NAME]}"
  echo "=== Deploying $NAME from $FILE ==="
  npx wrangler deploy "$WORKERS_DIR/$FILE" --name "$NAME" --compatibility-date "2024-01-01"
  echo ""
done

echo "=== All workers deployed ==="
echo ""
echo "Now configure Routes in Cloudflare Dashboard (domain/* pattern):"
echo "  svg-insta       → insta.bluehair.blue/*"
echo "  svg-twit        → twit.bluehair.blue/*"
echo "  svg-live        → live.bluehair.blue/*"
echo "  svg-talk        → talk.bluehair.blue/*"
echo "  svg-news        → news.bluehair.blue/*"
echo "  svg-chart       → chart.bluehair.blue/*"
echo "  svg-community   → community.bluehair.blue/*"
echo "  svg-post        → post.bluehair.blue/*"
echo "  svg-tablet      → tablet.bluehair.blue/*"
echo "  svg-schedule    → schedule.bluehair.blue/*"
echo ""
echo "Note: /ent/ path prefix is in the URL, not the route pattern."
echo "      AI outputs: https://{subdomain}.bluehair.blue/ent/?params..."
