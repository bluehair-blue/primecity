<!-- Generated: 2026-04-11 -->

# Prime City — Codemaps Index

AI 컨텍스트 로딩에 최적화된 아키텍처 문서 모음.

| 파일 | 내용 | 읽어야 할 때 |
|------|------|-------------|
| [architecture.md](architecture.md) | 시스템 전체 다이어그램, 배포 구조, 핵심 제약 | 새 세션 시작 시 |
| [frontend.md](frontend.md) | 라우트 트리, 컴포넌트 계층, CharDetail 상태기계 | React 코드 수정 시 |
| [backend.md](backend.md) | SVG Workers, Python 파이프라인, 로어북 구조 | 백엔드/tools 수정 시 |
| [data.md](data.md) | characters.js 스키마, 상황코드, config 구조 | 데이터 참조 시 |
| [dependencies.md](dependencies.md) | 외부 서비스, npm/pip 의존성, CDN 구조 | 의존성 추가/변경 시 |

## 갱신 주기

- `npm run build` 성공 후 구조 변경이 있으면 해당 파일만 업데이트
- 신규 인트로 컴포넌트 추가 → `frontend.md` 미완 표 업데이트
- ASSET_VERSION 변경 → `dependencies.md` CDN 섹션 업데이트
- characters.js 스키마 변경 → `data.md` 업데이트
