# Development and Deployment

## 로컬 검증

```powershell
npm ci
npm run validate:persona
npm run build
npm audit --audit-level=moderate
```

Node 기준 버전은 CI와 같은 22.11.0이다. `npm audit fix --force`는 기능 변경과 분리하여 승인 후 실행한다.

## 배포

- `wrangler.jsonc`가 유일한 사이트 설정이다.
- `git push origin main`은 연결된 Cloudflare 자동 배포를 유발할 수 있다.
- 수동 검증은 `npx wrangler deploy --dry-run --config wrangler.jsonc`로 먼저 수행한다.
- 실제 배포는 빌드·audit 결과와 diff를 확인한 후 `npm run deploy`로 수행한다.

CI 진입점은 `.github/workflows/build.yml` 하나이며 설치, audit, Persona 검증, build 순서로 실행한다.
