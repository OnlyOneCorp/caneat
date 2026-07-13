#!/usr/bin/env node
/**
 * 먹어도 될까? 정적 페이지 생성기
 * 사용법: node build.js  →  dist/dog|cat/{id}/index.html × 160 + 목록 2 + sitemap + robots + 앱 본체
 * 데이터: ./index.html의 `const FOODS = [...]` 자동 추출
 */
const fs = require("fs");
const path = require("path");

/* ── 설정 ── */
const SITE = "https://caneat.onlyonecorpceo.workers.dev"; // ⚠️ 실제 배포 URL로 수정
const GA_ID = "G-EZMGMCB9X7";                              // ⚠️ index.html과 동일 GA ID로 수정
const HUB = "https://main.onlyonecorpceo.workers.dev";
const EMAIL = "onlyonecorpceo@gmail.com";
const COUPANG_URL = "https://link.coupang.com/a/flurRzshy0";    // ⚠️ 쿠팡 파트너스 딥링크 (펫 간식)
const AMAZON_URL = "https://www.amazon.com/s?k=dog+cat+treats&tag=onlyone0c-20";
const INDEX = path.join(__dirname, "index.html");

/* ── index.html에서 FOODS 추출 ── */
const src = fs.readFileSync(INDEX, "utf8");
const m = src.match(/const FOODS = (\[[\s\S]*?\n\]);/);
if (!m) { console.error("❌ index.html에서 FOODS 블록을 찾지 못했습니다."); process.exit(1); }
const FOODS = eval("(" + m[1] + ")");

const CATS = { fruit:{ko:"과일",en:"Fruit"}, veg:{ko:"채소",en:"Vegetables"}, meat:{ko:"고기·해산물",en:"Meat & Fish"}, dairy:{ko:"유제품·곡물",en:"Dairy & Grains"}, snack:{ko:"간식·위험식품",en:"Snacks & Hazards"}, kfood:{ko:"한국 음식",en:"Korean Food"} };
const SP = { dog:{ko:"강아지",en:"dog",emoji:"🐶",josa:"가",other:"cat"}, cat:{ko:"고양이",en:"cat",emoji:"🐱",josa:"가",other:"dog"} };
const V = {
  ok:{ko:"먹어도 돼요",en:"Safe to eat",icon:"✅",cls:"v-ok"},
  warn:{ko:"주의해서 소량만",en:"Caution — small amounts",icon:"⚠️",cls:"v-warn"},
  no:{ko:"절대 주면 안 돼요",en:"Do not feed",icon:"❌",cls:"v-no"}
};
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");

/* ── 상세 페이지 ── */
function pageHtml(f, sp) {
  const S = SP[sp], O = SP[S.other];
  const info = f[sp === "dog" ? "d" : "c"];
  const oinfo = f[S.other === "dog" ? "d" : "c"];
  const v = V[info.v], ov = V[oinfo.v];
  const cat = CATS[f.g];

  const titleKo = `${S.ko} ${f.ko} 먹어도 되나요? ${v.icon} ${v.ko}`;
  const desc = `${S.ko} ${f.ko} 급여 — ${v.ko}. ${info.r[0]}`;
  const dangerStrip = info.v === "no" ? `
    <div class="er"><span data-ko>🚨 이미 먹었다면? 양을 확인하고 <b>즉시 동물병원</b>에 전화하세요. 밤이라면 24시 동물병원으로.</span><span data-en class="hidden">🚨 Already eaten? Note the amount and <b>call your vet immediately</b> — a 24-hour clinic if it's night.</span></div>` : "";

  const related = FOODS.filter(x => x.g === f.g && x.id !== f.id).slice(0, 8);
  const relHtml = related.map(r => {
    const rv = V[r[sp === "dog" ? "d" : "c"].v];
    return `<a href="/${sp}/${r.id}/">${r.e} <span data-ko>${r.ko}</span><span data-en class="hidden">${esc(r.en)}</span> <b class="${rv.cls}-t">${rv.icon}</b></a>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titleKo)} | 먹어도 될까?</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/${sp}/${f.id}/">
<meta property="og:title" content="${esc(titleKo)} | 먹어도 될까?">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}/${sp}/${f.id}/">
<meta property="og:type" content="article">
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});</script>
<style>
:root{--bg:#FAFAF8;--ink:#3D4248;--accent:#B5342E;--line:#E8E6E1;--dim:#8A8F94;--card:#fff;
--ok:#1C8E4A;--warn:#C77E00;--no:#B5342E;--okbg:#EDF7F0;--warnbg:#FBF3E4;--nobg:#FAECEB}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:640px;margin:0 auto;padding:24px 20px 60px}
header{display:flex;justify-content:space-between;align-items:center;padding:8px 0 28px}
.logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);font-weight:700;font-size:15px}
.lang-btn{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:6px 14px;font-size:13px;cursor:pointer;color:var(--ink);font-family:inherit}
.crumb{font-size:13px;color:var(--dim);margin-bottom:10px}
.crumb a{color:var(--dim);text-decoration:none}
h1{font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.35;margin-bottom:18px}
.verdict{border-radius:20px;padding:24px;margin-bottom:12px;border:1px solid var(--line)}
.v-ok{background:var(--okbg)}.v-warn{background:var(--warnbg)}.v-no{background:var(--nobg)}
.v-ok-t{color:var(--ok)}.v-warn-t{color:var(--warn)}.v-no-t{color:var(--no)}
.verdict .vv{font-size:22px;font-weight:800;margin-bottom:8px}
.v-ok .vv{color:var(--ok)}.v-warn .vv{color:var(--warn)}.v-no .vv{color:var(--no)}
.verdict .vr{font-size:15px}
.er{background:var(--ink);color:#fff;border-radius:14px;padding:14px 18px;font-size:14px;margin-bottom:12px;line-height:1.6}
.er b{color:#FFD9D6}
.tip{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;font-size:14px;margin-bottom:24px}
.tip .tl{font-weight:700;font-size:13px;color:var(--dim);margin-bottom:4px}
h2{font-size:19px;font-weight:700;margin:30px 0 12px;letter-spacing:-.01em}
.cross{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;text-decoration:none;color:var(--ink)}
.cross .ce{font-size:30px}
.cross .cn{font-weight:700;font-size:15px}
.cross .cv{font-size:13px;font-weight:700}
.cross .go{margin-left:auto;color:var(--dim);font-size:13px}
.rels{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.rels a{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:8px 14px;font-size:14px;text-decoration:none;color:var(--ink)}
.cta{display:block;text-align:center;background:var(--ink);color:#fff;text-decoration:none;border-radius:14px;padding:16px;font-weight:700;font-size:16px;margin:30px 0 10px;transition:opacity .15s}
.cta:hover{opacity:.85}
.cta-sub{text-align:center;font-size:13px;color:var(--dim)}
.shop{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;margin-top:26px;font-size:14px}
.shop a{display:inline-block;margin-top:8px;border:1px solid var(--line);border-radius:99px;padding:7px 16px;font-size:13px;text-decoration:none;color:var(--ink);font-weight:600}
.note{font-size:12px;color:var(--dim);margin-top:26px;line-height:1.7}
footer{margin-top:44px;padding-top:24px;border-top:1px solid var(--line);font-size:12px;color:#A0A4A8;text-align:center;line-height:2}
footer a{color:#A0A4A8}
.disc{font-size:11px;color:#B6B6BB;margin-top:8px}
.hidden{display:none}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <a class="logo" href="${HUB}" aria-label="OnlyOne">
      <svg width="20" height="26" viewBox="0 0 20 26" fill="none"><circle cx="10" cy="8" r="6.5" stroke="#3D4248" stroke-width="3"/><rect x="8.5" y="14" width="3" height="10" rx="1.5" fill="#3D4248"/></svg>
      OnlyOne
    </a>
    <button class="lang-btn" onclick="toggleLang()"><span data-ko>EN</span><span data-en class="hidden">한국어</span></button>
  </header>

  <article>
    <div class="crumb">${S.emoji} <a href="/${sp}/"><span data-ko>${S.ko} 음식 사전</span><span data-en class="hidden">${sp === "dog" ? "Dog" : "Cat"} food guide</span></a> · <span data-ko>${cat.ko}</span><span data-en class="hidden">${cat.en}</span></div>
    <h1><span data-ko>${S.ko}${S.josa} ${f.ko}${f.e}를 먹어도 될까요?</span><span data-en class="hidden">Can ${sp}s eat ${esc(f.en.toLowerCase())}${f.e}?</span></h1>

    <div class="verdict ${v.cls}">
      <div class="vv"><span data-ko>${v.icon} ${v.ko}</span><span data-en class="hidden">${v.icon} ${v.en}</span></div>
      <div class="vr"><span data-ko>${esc(info.r[0])}</span><span data-en class="hidden">${esc(info.r[1])}</span></div>
    </div>
    ${dangerStrip}
    <div class="tip">
      <div class="tl"><span data-ko>${info.v === "no" ? "🏥 알아두세요" : "🍽️ 급여 팁"}</span><span data-en class="hidden">${info.v === "no" ? "🏥 Good to know" : "🍽️ Feeding tip"}</span></div>
      <span data-ko>${esc(info.t[0])}</span><span data-en class="hidden">${esc(info.t[1])}</span>
    </div>

    <h2><span data-ko>${O.ko}는요?</span><span data-en class="hidden">What about ${S.other}s?</span></h2>
    <a class="cross" href="/${S.other}/${f.id}/">
      <span class="ce">${O.emoji}</span>
      <span>
        <span class="cn"><span data-ko>${O.ko} × ${f.ko}</span><span data-en class="hidden">${S.other === "dog" ? "Dogs" : "Cats"} × ${esc(f.en)}</span></span><br>
        <span class="cv ${ov.cls}-t"><span data-ko>${ov.icon} ${ov.ko}</span><span data-en class="hidden">${ov.icon} ${ov.en}</span></span>
      </span>
      <span class="go"><span data-ko>자세히 →</span><span data-en class="hidden">More →</span></span>
    </a>

    <h2><span data-ko>${cat.ko} 다른 음식도 확인하기</span><span data-en class="hidden">More ${cat.en.toLowerCase()}</span></h2>
    <div class="rels">${relHtml}</div>

    <a class="cta" href="${SITE}/?utm_source=seo&utm_medium=static&utm_campaign=${sp}-${f.id}">
      <span data-ko>🔍 다른 음식 3초 검색</span><span data-en class="hidden">🔍 Search any food in 3 seconds</span>
    </a>
    <p class="cta-sub"><span data-ko>음식 ${FOODS.length}종 · 강아지/고양이 전환 · 신호등 판정</span><span data-en class="hidden">${FOODS.length} foods · dog/cat toggle · traffic-light verdicts</span></p>

    <div class="shop">
      <span data-ko>🦴 사람 음식 대신, 안심하고 줄 수 있는 전용 간식은 어때요?</span><span data-en class="hidden">🦴 Instead of table food, try treats made for them.</span><br>
      <a data-ko href="${COUPANG_URL}" target="_blank" rel="noopener sponsored">쿠팡에서 ${S.ko} 간식 보기</a>
      <a data-en class="hidden" href="${AMAZON_URL}" target="_blank" rel="noopener sponsored">Shop ${sp} treats on Amazon</a>
    </div>

    <p class="note"><span data-ko>※ 본 페이지는 일반 정보이며 수의사 진료를 대체하지 않아요. 아이의 나이·체중·지병에 따라 답이 달라질 수 있으니, 이상 증상이 있다면 즉시 동물병원에 문의하세요.</span><span data-en class="hidden">※ General information only — not a substitute for veterinary care. Age, weight and health conditions change the answer; contact a vet promptly if anything seems wrong.</span></p>
  </article>

  <footer>
    <a href="${HUB}">OnlyOne — For a Happy Day</a><br>
    Contact: <a href="mailto:${EMAIL}">${EMAIL}</a>
    <div class="disc"><span data-ko>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span><span data-en class="hidden">As an Amazon Associate, OnlyOne earns from qualifying purchases.</span></div>
  </footer>
</div>

<div id="consent" style="display:none;position:fixed;bottom:16px;left:16px;right:16px;max-width:480px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 20px;box-shadow:0 8px 30px rgba(0,0,0,.08);font-size:13px;z-index:99">
  <p style="margin-bottom:12px;font-size:13px"><span data-ko>방문 통계를 위해 Google Analytics 쿠키를 사용해도 될까요? 거부해도 그대로 이용할 수 있어요.</span><span data-en class="hidden">May we use Google Analytics cookies for visit stats? You can decline and still use everything.</span></p>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <button onclick="consent(false)" style="border:1px solid var(--line);background:#fff;border-radius:99px;padding:8px 16px;cursor:pointer;font-family:inherit;font-size:13px;color:var(--ink)"><span data-ko>거부</span><span data-en class="hidden">Decline</span></button>
    <button onclick="consent(true)" style="border:none;background:var(--ink);color:#fff;border-radius:99px;padding:8px 18px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600"><span data-ko>동의</span><span data-en class="hidden">Accept</span></button>
  </div>
</div>

<script>
function applyLang(l){
  document.querySelectorAll('[data-ko]').forEach(e=>e.classList.toggle('hidden',l==='en'));
  document.querySelectorAll('[data-en]').forEach(e=>e.classList.toggle('hidden',l!=='en'));
  document.documentElement.lang=l==='en'?'en':'ko';
}
function toggleLang(){
  const l=(localStorage.getItem('oo_lang')==='en')?'ko':'en';
  localStorage.setItem('oo_lang',l);applyLang(l);
}
applyLang(localStorage.getItem('oo_lang')||(navigator.language.startsWith('ko')?'ko':'en'));

const EEA=['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'];
function grant(){gtag('consent','update',{analytics_storage:'granted'})}
function consent(ok){
  localStorage.setItem('oo_consent',ok?'granted':'denied');
  if(ok)grant();
  document.getElementById('consent').style.display='none';
}
(function(){
  const saved=localStorage.getItem('oo_consent');
  if(saved==='granted'){grant();return}
  if(saved==='denied')return;
  const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
  const isEU=/Europe\\//.test(tz)||EEA.includes((navigator.language.split('-')[1]||'').toUpperCase());
  if(isEU){document.getElementById('consent').style.display='block'}
  else{localStorage.setItem('oo_consent','granted');grant()}
})();
</script>
</body>
</html>`;
}

/* ── 목록 페이지 (/dog/, /cat/) ── */
function listHtml(sp) {
  const S = SP[sp];
  const titleKo = `${S.ko}가 먹어도 되는 음식 총정리 (${FOODS.length}종)`;
  const groups = Object.keys(CATS).map(g => {
    const items = FOODS.filter(f => f.g === g).map(f => {
      const v = V[f[sp === "dog" ? "d" : "c"].v];
      return `<a href="/${sp}/${f.id}/">${f.e} <span data-ko>${f.ko}</span><span data-en class="hidden">${esc(f.en)}</span> <b class="${v.cls}-t">${v.icon}</b></a>`;
    }).join("");
    return `<h2><span data-ko>${CATS[g].ko}</span><span data-en class="hidden">${CATS[g].en}</span></h2><div class="rels">${items}</div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titleKo)} | 먹어도 될까?</title>
<meta name="description" content="${S.ko} 급여 가능 음식 ${FOODS.length}종을 ✅먹어도 됨 / ⚠️주의 / ❌금지 신호등으로 한눈에 확인하세요.">
<link rel="canonical" href="${SITE}/${sp}/">
<meta property="og:title" content="${esc(titleKo)} | 먹어도 될까?">
<meta property="og:url" content="${SITE}/${sp}/">
<meta property="og:type" content="website">
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});</script>
<style>
:root{--bg:#FAFAF8;--ink:#3D4248;--line:#E8E6E1;--dim:#8A8F94;--card:#fff;--ok:#1C8E4A;--warn:#C77E00;--no:#B5342E}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:640px;margin:0 auto;padding:24px 20px 60px}
header{display:flex;justify-content:space-between;align-items:center;padding:8px 0 28px}
.logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);font-weight:700;font-size:15px}
.lang-btn{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:6px 14px;font-size:13px;cursor:pointer;color:var(--ink);font-family:inherit}
h1{font-size:26px;font-weight:800;letter-spacing:-.02em;margin-bottom:8px}
.lede{color:var(--dim);font-size:15px;margin-bottom:8px}
h2{font-size:18px;font-weight:700;margin:28px 0 10px}
.rels{display:flex;flex-wrap:wrap;gap:8px}
.rels a{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:8px 14px;font-size:14px;text-decoration:none;color:var(--ink)}
.v-ok-t{color:var(--ok)}.v-warn-t{color:var(--warn)}.v-no-t{color:var(--no)}
.cta{display:block;text-align:center;background:var(--ink);color:#fff;text-decoration:none;border-radius:14px;padding:16px;font-weight:700;font-size:16px;margin:34px 0 10px}
footer{margin-top:44px;padding-top:24px;border-top:1px solid var(--line);font-size:12px;color:#A0A4A8;text-align:center;line-height:2}
footer a{color:#A0A4A8}
.hidden{display:none}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <a class="logo" href="${HUB}"><svg width="20" height="26" viewBox="0 0 20 26" fill="none"><circle cx="10" cy="8" r="6.5" stroke="#3D4248" stroke-width="3"/><rect x="8.5" y="14" width="3" height="10" rx="1.5" fill="#3D4248"/></svg>OnlyOne</a>
    <button class="lang-btn" onclick="toggleLang()"><span data-ko>EN</span><span data-en class="hidden">한국어</span></button>
  </header>
  <h1>${S.emoji} <span data-ko>${S.ko}가 먹어도 되는 음식 총정리</span><span data-en class="hidden">What ${sp}s can and can't eat</span></h1>
  <p class="lede"><span data-ko>✅ 먹어도 돼요 · ⚠️ 주의 · ❌ 절대 금지 — 음식을 눌러 이유와 급여 팁을 확인하세요.</span><span data-en class="hidden">✅ Safe · ⚠️ Caution · ❌ Never — tap a food for reasons and tips.</span></p>
  ${groups}
  <a class="cta" href="${SITE}/?utm_source=seo&utm_medium=static&utm_campaign=${sp}-list"><span data-ko>🔍 검색으로 3초 만에 찾기</span><span data-en class="hidden">🔍 Find any food in 3 seconds</span></a>
  <footer>
    <a href="${HUB}">OnlyOne — For a Happy Day</a><br>
    Contact: <a href="mailto:${EMAIL}">${EMAIL}</a>
  </footer>
</div>
<script>
function applyLang(l){
  document.querySelectorAll('[data-ko]').forEach(e=>e.classList.toggle('hidden',l==='en'));
  document.querySelectorAll('[data-en]').forEach(e=>e.classList.toggle('hidden',l!=='en'));
  document.documentElement.lang=l==='en'?'en':'ko';
}
function toggleLang(){
  const l=(localStorage.getItem('oo_lang')==='en')?'ko':'en';
  localStorage.setItem('oo_lang',l);applyLang(l);
}
applyLang(localStorage.getItem('oo_lang')||(navigator.language.startsWith('ko')?'ko':'en'));
</script>
</body>
</html>`;
}

/* ── 빌드 ── */
const DIST = path.join(__dirname, "dist");
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const urls = [];
for (const sp of ["dog", "cat"]) {
  fs.mkdirSync(path.join(DIST, sp), { recursive: true });
  fs.writeFileSync(path.join(DIST, sp, "index.html"), listHtml(sp));
  urls.push(`${SITE}/${sp}/`);
  for (const f of FOODS) {
    const dir = path.join(DIST, sp, f.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml(f, sp));
    urls.push(`${SITE}/${sp}/${f.id}/`);
  }
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[SITE + "/", ...urls].map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.copyFileSync(INDEX, path.join(DIST, "index.html"));

console.log(`✅ ${urls.length - 2}개 상세 + 목록 2 + sitemap.xml + robots.txt + 앱 본체 → dist/ (총 URL ${urls.length + 1})`);
