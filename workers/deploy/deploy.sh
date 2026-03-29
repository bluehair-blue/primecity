#!/bin/bash
# Deploy all 7 SVG Workers to Cloudflare
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

for NAME in "${!WORKERS[@]}"; do
  FILE="${WORKERS[$NAME]}"
  echo "=== Deploying $NAME from $FILE ==="
  npx wrangler deploy "$WORKERS_DIR/$FILE" --name "$NAME" --compatibility-date "2024-01-01"
  echo ""
done

echo "=== All workers deployed ==="
echo ""
echo "Now configure Routes in Cloudflare Dashboard:"
echo "  svg-insta       → insta.bluehair.blue/ent/*"
echo "  svg-twit        → twit.bluehair.blue/ent/*"
echo "  svg-live        → live.bluehair.blue/ent/*"
echo "  svg-talk        → talk.bluehair.blue/ent/*"
echo "  svg-news        → news.bluehair.blue/ent/*"
echo "  svg-chart       → chart.bluehair.blue/ent/*"
echo "  svg-community   → community.bluehair.blue/ent/*"
