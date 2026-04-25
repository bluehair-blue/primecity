#!/bin/bash
# Deploy all SVG Workers to Cloudflare with auto route registration
# Usage: cd workers/deploy && bash deploy.sh
# Requires: wrangler login (run once before deploying)

WORKERS_DIR=".."
DOMAIN="bluehair.blue"
COMPATIBILITY_DATE="${COMPATIBILITY_DATE:-2024-01-01}"
REAL_DEPLOY="${REAL_DEPLOY:-0}"

if [ "$REAL_DEPLOY" != "1" ]; then
  echo "DRY RUN MODE: set REAL_DEPLOY=1 only after validating the Workers locally or reviewing this dry run."
  DEPLOY_MODE_ARGS=(--dry-run)
else
  echo "REAL DEPLOY MODE: proceeding with Cloudflare deploys after explicit REAL_DEPLOY=1."
  DEPLOY_MODE_ARGS=()
fi

# Worker name → source file → subdomain
declare -A WORKERS
declare -A ROUTES
WORKERS[svg-insta]="svg-sns.js";        ROUTES[svg-insta]="insta"
WORKERS[svg-twit]="svg-tweet.js";       ROUTES[svg-twit]="twit"
WORKERS[svg-live]="svg-livestream.js";   ROUTES[svg-live]="live"
WORKERS[svg-talk]="svg-messenger.js";   ROUTES[svg-talk]="talk"
WORKERS[svg-news]="svg-news.js";        ROUTES[svg-news]="news"
WORKERS[svg-chart]="svg-chart.js";      ROUTES[svg-chart]="chart"
WORKERS[svg-community]="svg-community.js"; ROUTES[svg-community]="community"
WORKERS[svg-post]="svg-post.js";        ROUTES[svg-post]="post"
WORKERS[svg-tablet]="svg-tablet.js";    ROUTES[svg-tablet]="tablet"
WORKERS[svg-schedule]="svg-schedule.js"; ROUTES[svg-schedule]="schedule"

SUCCESS=0
FAIL=0

for NAME in "${!WORKERS[@]}"; do
  FILE="${WORKERS[$NAME]}"
  SUB="${ROUTES[$NAME]}"
  ROUTE="${SUB}.${DOMAIN}/*"

  echo "=== Deploying $NAME ($FILE) → $ROUTE ==="
  if npx wrangler deploy "$WORKERS_DIR/$FILE" --name "$NAME" --compatibility-date "$COMPATIBILITY_DATE" --route "$ROUTE" "${DEPLOY_MODE_ARGS[@]}"; then
    echo "  ✓ $NAME deployed + route $ROUTE registered"
    ((SUCCESS++))
  else
    echo "  ✗ $NAME FAILED"
    ((FAIL++))
  fi
  echo ""
done

echo "=== Deploy complete: $SUCCESS success, $FAIL failed ==="
echo ""
echo "Routes registered (domain/* pattern, /ent/ is URL path):"
for NAME in "${!ROUTES[@]}"; do
  echo "  $NAME → ${ROUTES[$NAME]}.${DOMAIN}/*"
done
