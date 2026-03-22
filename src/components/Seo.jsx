import { Helmet } from "react-helmet-async";

const SITE_NAME = "프라임시티 — PRIME CITY";
const DEFAULT_DESC =
  "전 세계가 주목하는 단 하나의 무대. 프라임시티 — 근미래 엔터테인먼트 시뮬레이션 챗봇.";
const BASE_URL = "https://intro.bluehair.blue";

export default function Seo({ title, description, path = "" }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESC;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
