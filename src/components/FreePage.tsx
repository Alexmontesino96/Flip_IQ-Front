"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { runAnalysisStream, AnalysisResult } from "@/lib/analysis";
import { addRecentSearch } from "@/lib/history";
import { pushEvent } from "@/lib/tracking";

const SAMPLES = [
  { q: "AirPods Pro", name: "AirPods Pro", cost: "105" },
  { q: "Nintendo Switch OLED", name: "Switch OLED", cost: "160" },
  { q: "Nike Dunk Low", name: "Nike Dunk", cost: "65" },
  { q: "PS5 Console", name: "PS5", cost: "220" },
  { q: "Stanley Cup 40oz", name: "Stanley", cost: "25" },
];

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FlipIQ Free Flip Profit Calculator",
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  description:
    "Free flip profit calculator for resellers. Compares profit across eBay and Amazon.",
  url: "https://flipiq.app/free",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1240",
  },
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is FlipIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FlipIQ is a free flip profit calculator for resellers. You enter a product and your cost; it pulls live sales data from eBay and Amazon and tells you whether the flip is worth it before you buy.",
      },
    },
    {
      "@type": "Question",
      name: "Is it really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. 5 analyses with no signup. 100/day with a free email signup.",
      },
    },
    {
      "@type": "Question",
      name: "How is the max buy price calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Median sold comp - marketplace fees - shipping - target margin = max buy.",
      },
    },
  ],
};

/* ═══ CSS copied verbatim from design HTML ═══ */
const CSS = `
:root{
  --bg:#0A0A0A;--bg-2:#0E0E0E;--bg-3:#141414;
  --ink:#F5F5F2;--dim:rgba(245,245,242,0.58);--dimmer:rgba(245,245,242,0.35);
  --line:rgba(245,245,242,0.08);--line-2:rgba(245,245,242,0.14);
  --accent:#D4FF3A;--accent-2:#E8FF7A;--accent-bg:rgba(212,255,58,0.06);--accent-bd:rgba(212,255,58,0.28);
  --pass:#FF6B5A;--watch:#FFB547;--speed:#7DD3FC;
  --display:'Inter Tight',system-ui,-apple-system,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
}
.fp *,.fp *::before,.fp *::after{box-sizing:border-box}
.fp{margin:0;background:radial-gradient(ellipse 1200px 600px at 50% 0%,rgba(212,255,58,0.04),transparent 60%),#050505;color:var(--ink);font-family:var(--display);-webkit-font-smoothing:antialiased;min-height:100vh}
.fp a{color:inherit;text-decoration:none}
.fp button{font-family:inherit}

@keyframes fp-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}
@keyframes fp-spin{to{transform:rotate(360deg)}}

.fp .nav{max-width:1160px;margin:0 auto;padding:22px;display:flex;align-items:center;justify-content:space-between}
.fp .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;letter-spacing:-.3px}
.fp .brand-mark{width:32px;height:32px;border-radius:9px;background:var(--bg);border:1px solid var(--line-2);display:grid;place-items:center;color:var(--accent);font-weight:900;font-size:18px;text-shadow:0 0 16px rgba(212,255,58,.5)}
.fp .nav-right{display:flex;align-items:center;gap:18px}
.fp .nav-link{font-family:var(--mono);font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--dim)}
.fp .nav-link:hover{color:var(--ink)}
.fp .nav-cta{font-family:var(--mono);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;padding:9px 14px;border-radius:7px;background:var(--accent);color:var(--bg);border:0;cursor:pointer}
.fp .nav-cta:hover{background:var(--accent-2)}

.fp .hero{max-width:1160px;margin:0 auto;padding:8px 22px 40px;display:grid;grid-template-columns:minmax(0,1fr) 520px;gap:64px;align-items:start}
.fp .hero-copy{padding-top:24px;position:sticky;top:20px;align-self:start}
.fp .eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);padding:5px 10px;border-radius:6px;background:var(--accent-bg);border:1px solid var(--accent-bd);margin-bottom:18px;font-weight:700}
.fp .eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 6px var(--accent);animation:fp-pulse 2s infinite}
.fp .hero-h1{font-size:60px;font-weight:900;line-height:1;letter-spacing:-2.5px;margin:0 0 18px;text-wrap:balance}
.fp .hero-h1 em{font-style:normal;color:var(--accent);text-shadow:0 0 24px rgba(212,255,58,.18)}
.fp .hero-sub{font-size:17px;color:var(--dim);line-height:1.5;max-width:480px;margin:0 0 24px;font-weight:400}
.fp .hero-bullets{list-style:none;padding:0;margin:0 0 28px;display:grid;gap:9px}
.fp .hero-bullets li{font-family:var(--mono);font-size:11px;letter-spacing:.4px;color:var(--ink);display:flex;gap:10px;align-items:flex-start}
.fp .hero-bullets li::before{content:"\\2192";color:var(--accent);font-weight:700;flex-shrink:0}
.fp .hero-meta{display:flex;gap:18px;flex-wrap:wrap;font-family:var(--mono);font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--dim)}
.fp .pip{display:inline-flex;align-items:center;gap:6px}
.fp .pip::before{content:"\\2713";color:var(--accent);font-weight:800}

.fp .calc{background:var(--bg-2);border:1px solid var(--line-2);border-radius:18px;padding:22px;position:sticky;top:20px;box-shadow:0 24px 80px rgba(0,0,0,.5)}
.fp .calc::before{content:'';position:absolute;inset:-1px;border-radius:19px;background:linear-gradient(135deg,rgba(212,255,58,.18),transparent 40%,transparent 60%,rgba(212,255,58,.1));z-index:-1;opacity:.7;pointer-events:none}
.fp .calc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.fp .calc-title{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent)}
.fp .calc-livechip{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 8px;border-radius:6px;background:var(--accent-bg);border:1px solid var(--accent-bd);color:var(--accent)}
.fp .calc-livechip .dot{width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 6px var(--accent);animation:fp-pulse 1.6s infinite}
.fp .field{margin-bottom:14px}
.fp .field-label{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--dim);margin-bottom:7px;display:block}
.fp .input-wrap{position:relative}
.fp .input-field{width:100%;padding:13px 14px;border-radius:10px;background:var(--bg-3);border:1px solid var(--line-2);color:var(--ink);font-family:var(--display);outline:none;font-size:14px;transition:border-color .15s}
.fp .input-field:focus{border-color:var(--accent-bd)}
.fp .input-field.mono{font-family:var(--mono);font-variant-numeric:tabular-nums}
.fp .scan-btn{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:8px;border:1px solid var(--accent-bd);background:var(--accent-bg);cursor:pointer;display:grid;place-items:center}
.fp .chips{display:flex;flex-wrap:wrap;gap:6px}
.fp .chip{padding:7px 11px;border-radius:7px;background:var(--bg-3);border:1px solid var(--line-2);color:var(--dim);font-family:var(--mono);font-size:10px;letter-spacing:.5px;font-weight:600;cursor:pointer;text-transform:uppercase}
.fp .chip:hover{background:var(--accent-bg);border-color:var(--accent-bd);color:var(--accent)}
.fp .chip-label{font-family:var(--mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--dimmer);margin-bottom:7px}
.fp .row{display:flex;gap:10px}
.fp .row>*{flex:1;min-width:0}
.fp .cond-grp{display:flex;gap:6px}
.fp .cond{flex:1;padding:11px 6px;border-radius:9px;border:1px solid var(--line-2);background:transparent;color:var(--dim);font-family:var(--mono);font-size:11px;letter-spacing:1px;font-weight:600;text-transform:uppercase;cursor:pointer}
.fp .cond.active{background:var(--accent-bg);border-color:var(--accent-bd);color:var(--accent)}
.fp .cta{width:100%;padding:15px;border-radius:12px;border:0;background:var(--accent);color:var(--bg);font-size:14px;font-weight:800;letter-spacing:.2px;cursor:pointer;margin-top:8px;box-shadow:0 8px 24px rgba(212,255,58,.18);transition:transform .2s,box-shadow .2s}
.fp .cta:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 32px rgba(212,255,58,.25)}
.fp .cta:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.fp .cta .arr{display:inline-block;margin-left:6px;transition:transform .2s}
.fp .cta:hover:not(:disabled) .arr{transform:translateX(3px)}
.fp .quota{text-align:center;margin-top:10px;font-family:var(--mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--dimmer)}
.fp .quota b{color:var(--ink);font-weight:700}

.fp .trustbar{max-width:1160px;margin:0 auto;padding:10px 22px 0}
.fp .trustbar-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 24px;background:var(--bg-2);border:1px solid var(--line);border-radius:14px;flex-wrap:wrap}
.fp .trust-stat{display:flex;align-items:baseline;gap:10px}
.fp .trust-num{font-family:var(--mono);font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--ink)}
.fp .trust-num.lime{color:var(--accent)}
.fp .trust-label{font-family:var(--mono);font-size:9px;color:var(--dim);font-weight:600;letter-spacing:1.5px;text-transform:uppercase}
.fp .trust-divider{width:1px;height:30px;background:var(--line)}

.fp .strip{max-width:1160px;margin:0 auto;padding:64px 22px 0}
.fp .strip-head{display:flex;align-items:end;justify-content:space-between;margin-bottom:28px;gap:18px;flex-wrap:wrap}
.fp .strip-eyebrow{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--accent);padding:5px 10px;border-radius:6px;background:var(--accent-bg);border:1px solid var(--accent-bd);display:inline-block;margin-bottom:12px}
.fp .strip-title{font-size:36px;font-weight:900;letter-spacing:-1.2px;line-height:1.05;max-width:680px;text-wrap:balance}
.fp .strip-title em{font-style:normal;color:var(--accent)}
.fp .strip-sub{font-size:14px;color:var(--dim);max-width:380px;line-height:1.6}

.fp .output-list{list-style:none;padding:10px;margin:0;display:grid;grid-template-columns:repeat(2,1fr);gap:10px;background:var(--bg-2);border:1px solid var(--line);border-radius:14px}
.fp .output-list li{display:grid;grid-template-columns:140px 1fr;gap:14px;align-items:baseline;padding:14px 16px;border-radius:10px;background:var(--bg-3);border:1px solid var(--line)}
.fp .output-list .k{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent)}
.fp .output-list .v{font-size:14px;color:var(--ink);line-height:1.4}
.fp .output-list .v b{color:var(--accent);font-weight:800;letter-spacing:.5px}

.fp .formula{background:var(--bg-2);border:1px solid var(--line);border-radius:14px;padding:30px}
.fp .formula-h{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.fp .formula-title{font-size:24px;font-weight:800;letter-spacing:-.6px;line-height:1.2;margin-bottom:20px;text-wrap:balance}
.fp .formula-line{font-family:var(--mono);font-size:13px;color:var(--ink);padding:16px 18px;border-radius:10px;background:var(--bg-3);border:1px solid var(--line);overflow-x:auto;letter-spacing:.3px;white-space:nowrap}
.fp .formula-line .op{color:var(--dimmer);margin:0 8px}
.fp .formula-line .out{color:var(--accent);font-weight:700}
.fp .formula-foot{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:20px}
.fp .formula-foot div b{display:block;font-family:var(--mono);font-size:9px;color:var(--accent);font-weight:700;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:5px}
.fp .formula-foot div span{font-size:13px;color:var(--dim);line-height:1.55}

.fp .faq-wrap{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.fp .faq{background:var(--bg-2);border:1px solid var(--line);border-radius:11px;padding:18px 20px}
.fp .faq[open]{border-color:var(--accent-bd);background:var(--accent-bg)}
.fp .faq summary{list-style:none;cursor:pointer;font-size:14.5px;font-weight:700;letter-spacing:-.2px;color:var(--ink);display:flex;justify-content:space-between;align-items:center;gap:12px}
.fp .faq summary::-webkit-details-marker{display:none}
.fp .faq summary::after{content:"+";font-family:var(--mono);font-size:18px;color:var(--dim);font-weight:400;line-height:1}
.fp .faq[open] summary::after{content:"\\2212";color:var(--accent)}
.fp .faq p{font-size:13px;color:var(--dim);line-height:1.65;margin:10px 0 0}

.fp .final{margin-top:28px;padding:36px 32px;background:linear-gradient(135deg,rgba(212,255,58,.10),rgba(212,255,58,.02));border:1px solid var(--accent-bd);border-radius:16px;display:flex;align-items:center;justify-content:space-between;gap:28px;position:relative;overflow:hidden}
.fp .final::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 100% 60% at 0% 0%,rgba(212,255,58,0.10),transparent 60%);pointer-events:none}
.fp .final-eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:8px}
.fp .final h3{font-size:26px;font-weight:900;margin:0 0 8px;letter-spacing:-.7px;line-height:1.15;text-wrap:balance}
.fp .final p{font-size:13.5px;color:var(--dim);margin:0;max-width:520px;line-height:1.55}
.fp .final-actions{display:flex;gap:10px;flex-shrink:0;position:relative}
.fp .btn-primary{padding:14px 22px;border-radius:11px;border:0;background:var(--accent);color:var(--bg);font-size:13px;font-weight:800;cursor:pointer;letter-spacing:.2px}
.fp .btn-primary:hover{background:var(--accent-2)}
.fp .btn-ghost{padding:14px 22px;border-radius:11px;border:1px solid var(--line-2);background:transparent;color:var(--ink);font-size:13px;font-weight:700;cursor:pointer}
.fp .btn-ghost:hover{border-color:var(--accent-bd);color:var(--accent)}

.fp footer{max-width:1160px;margin:64px auto 0;padding:24px 22px 40px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--dim);text-transform:uppercase}
.fp footer a:hover{color:var(--ink)}
.fp footer .links{display:flex;gap:18px}

/* result panel */
.fp .result{background:var(--bg-2);border:1px solid var(--line-2);border-radius:18px;padding:0;position:relative;box-shadow:0 24px 80px rgba(0,0,0,.5);overflow:hidden}
.fp .result::before{content:'';position:absolute;inset:-1px;border-radius:19px;background:linear-gradient(135deg,rgba(212,255,58,.18),transparent 40%,transparent 60%,rgba(212,255,58,.1));z-index:0;opacity:.7;pointer-events:none}
.fp .result>*{position:relative;z-index:1}
.fp .res-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line)}
.fp .res-back{appearance:none;background:transparent;border:1px solid var(--line-2);border-radius:8px;padding:7px 11px;color:var(--dim);font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.fp .res-back:hover{color:var(--accent);border-color:var(--accent-bd)}
.fp .res-title{font-size:14px;font-weight:700;color:var(--ink);letter-spacing:-.2px;text-align:right;line-height:1.25;flex:1;margin-left:12px}
.fp .res-title .meta{display:block;font-family:var(--mono);font-size:9px;color:var(--accent);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px}
.fp .res-body{padding:18px 22px;display:flex;flex-direction:column;gap:14px}
.fp .res-section-h{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--dimmer);margin:0 0 8px}
.fp .verdict{padding:22px;border-radius:16px;background:var(--accent);color:var(--bg);display:flex;align-items:center;justify-content:space-between;gap:14px;box-shadow:0 8px 28px rgba(212,255,58,.18)}
.fp .verdict-label{font-size:34px;font-weight:900;letter-spacing:-1.3px;line-height:.95}
.fp .verdict-sub{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1.5px;color:rgba(10,10,10,.55);margin-top:8px;text-transform:uppercase}
.fp .verdict-score{width:64px;height:64px;border-radius:50%;border:2px solid var(--bg);display:grid;place-items:center;font-size:22px;font-weight:800;letter-spacing:-.5px;flex-shrink:0}
.fp .maxbuy{padding:18px 20px;border-radius:14px;background:var(--bg-3);border:1px solid var(--line)}
.fp .maxbuy-cap{font-family:var(--mono);font-size:9px;color:var(--dim);letter-spacing:1.2px;text-transform:uppercase;font-weight:600}
.fp .maxbuy-num{font-size:42px;font-weight:800;color:var(--accent);letter-spacing:-1.8px;line-height:1;margin-top:4px;font-variant-numeric:tabular-nums}
.fp .maxbuy-foot{display:flex;gap:18px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
.fp .maxbuy-foot div{flex:1}
.fp .maxbuy-foot .k{font-family:var(--mono);font-size:9px;color:var(--dimmer);letter-spacing:1.2px;text-transform:uppercase;font-weight:700}
.fp .maxbuy-foot .v{font-size:18px;font-weight:700;color:var(--ink);margin-top:3px;font-variant-numeric:tabular-nums}
.fp .maxbuy-foot .v.lime{color:var(--accent)}
.fp .saleplan{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.fp .sp{padding:14px 12px;border-radius:12px;background:var(--bg-3);border:1px solid var(--line)}
.fp .sp.strong{background:var(--accent-bg);border-color:var(--accent-bd)}
.fp .sp .k{font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--dim)}
.fp .sp.strong .k{color:var(--accent)}
.fp .sp .v{font-size:22px;font-weight:800;letter-spacing:-.7px;line-height:1;margin-top:6px;color:var(--ink);font-variant-numeric:tabular-nums}
.fp .sp .sub{font-family:var(--mono);font-size:9px;color:var(--dimmer);margin-top:5px;letter-spacing:.4px}
.fp .returns{display:flex;background:var(--line);border-radius:12px;overflow:hidden;gap:1px}
.fp .returns>div{flex:1;padding:14px;background:var(--bg-3)}
.fp .returns .k{font-family:var(--mono);font-size:9px;color:var(--dim);letter-spacing:1.2px;text-transform:uppercase;font-weight:700}
.fp .returns .v{font-size:20px;font-weight:800;letter-spacing:-.5px;margin-top:4px;font-variant-numeric:tabular-nums}
.fp .returns .v.pos{color:var(--accent)}
.fp .scores{padding:16px 18px;border-radius:14px;background:var(--bg-3);border:1px solid var(--line);display:flex;flex-direction:column;gap:12px}
.fp .score-row{display:grid;grid-template-columns:90px 1fr auto;gap:14px;align-items:center}
.fp .score-row .lbl{font-family:var(--mono);font-size:9px;color:var(--dim);letter-spacing:1.2px;text-transform:uppercase;font-weight:700}
.fp .score-row .bar{height:5px;border-radius:3px;background:rgba(245,245,242,.06);overflow:hidden}
.fp .score-row .fill{height:100%;background:var(--accent);border-radius:3px;transition:width .8s cubic-bezier(.2,.8,.2,1)}
.fp .score-row .fill.warn{background:var(--watch)}
.fp .score-row .val{font-size:13px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;min-width:88px;text-align:right}
.fp .score-row .val .cat{font-family:var(--mono);font-size:9px;color:var(--dim);font-weight:600;letter-spacing:.4px;margin-left:5px}
.fp .channels{display:flex;flex-direction:column;gap:6px}
.fp .ch{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:11px;background:var(--bg-3);border:1px solid var(--line)}
.fp .ch.best{background:var(--accent-bg);border-color:var(--accent-bd)}
.fp .ch-name{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.fp .ch-name .nm{font-size:14px;font-weight:700;color:var(--ink);letter-spacing:-.2px}
.fp .ch-name .badge{font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;padding:3px 7px;border-radius:5px;background:rgba(245,245,242,.08);color:var(--dim)}
.fp .ch.best .ch-name .badge{background:var(--accent);color:var(--bg)}
.fp .ch-num{text-align:right;flex-shrink:0}
.fp .ch-num .net{font-size:15px;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums}
.fp .ch-num .net.neg{color:var(--pass)}
.fp .ch-num .roi{font-family:var(--mono);font-size:9px;color:var(--dim);font-weight:600;margin-top:2px}
.fp .ai{padding:14px 16px;border-radius:13px;background:var(--bg-3);border:1px solid var(--line)}
.fp .ai-h{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:9px;color:var(--accent);letter-spacing:1.5px;text-transform:uppercase;font-weight:700;margin-bottom:8px}
.fp .ai-h .dot{width:6px;height:6px;border-radius:3px;background:var(--accent);box-shadow:0 0 6px var(--accent)}
.fp .ai-text{font-size:13.5px;color:rgba(245,245,242,.86);line-height:1.55;margin:0}
.fp .res-cta{display:flex;gap:8px;padding:14px 22px 22px}
.fp .res-cta .b1,.fp .res-cta .b2{flex:1;padding:13px;border-radius:11px;font-weight:700;font-size:13px;cursor:pointer;letter-spacing:-.1px;text-align:center}
.fp .res-cta .b1{background:transparent;border:1px solid var(--line-2);color:var(--ink)}
.fp .res-cta .b1:hover{border-color:var(--accent-bd);color:var(--accent)}
.fp .res-cta .b2{background:var(--accent);border:0;color:var(--bg)}
.fp .gated{margin:0 22px 18px;padding:14px 16px;border-radius:13px;background:linear-gradient(135deg,rgba(212,255,58,.10),rgba(212,255,58,.02));border:1px dashed var(--accent-bd);display:flex;align-items:center;justify-content:space-between;gap:12px}
.fp .gated-txt{font-size:12.5px;color:var(--ink);line-height:1.4}
.fp .gated-txt b{color:var(--accent);font-weight:700}
.fp .gated-btn{padding:9px 14px;border-radius:9px;background:var(--accent);color:var(--bg);border:0;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0}

@media(max-width:980px){
  .fp .hero{grid-template-columns:1fr;gap:24px}
  .fp .hero-copy{padding-top:0;position:static}
  .fp .hero-h1{font-size:42px;letter-spacing:-1.5px}
  .fp .calc{position:static}
  .fp .faq-wrap{grid-template-columns:1fr}
  .fp .final{flex-direction:column;align-items:flex-start}
  .fp .formula-foot{grid-template-columns:1fr}
  .fp .nav-link.hide-sm{display:none}
}
@media(max-width:720px){
  .fp .output-list{grid-template-columns:1fr}
  .fp .output-list li{grid-template-columns:110px 1fr}
}
@media(max-width:560px){
  /* hero */
  .fp .hero{grid-template-columns:1fr;gap:14px;padding:8px 0 20px}
  .fp .hero-copy{padding:8px 18px 18px;position:static}
  .fp .hero-h1{font-size:34px;letter-spacing:-1.5px;margin-bottom:12px}
  .fp .hero-sub{font-size:15px;line-height:1.45;margin-bottom:14px}
  .fp .hero-bullets{display:none}
  .fp .hero-meta{gap:12px;font-size:9.5px;letter-spacing:1.2px}
  .fp .eyebrow{font-size:9px;letter-spacing:1.7px;padding:4px 9px;margin-bottom:14px}

  /* nav */
  .fp .nav{padding:12px 18px 8px}
  .fp .brand{font-size:17px;gap:8px}
  .fp .brand-mark{width:26px;height:26px;border-radius:7px;font-size:14px}
  .fp .nav-right{gap:10px}
  .fp .nav-link{display:none}
  .fp .nav-cta{font-size:9.5px;letter-spacing:1.4px;padding:7px 11px;background:transparent;color:var(--ink);border:1px solid var(--line-2)}

  /* calculator */
  .fp .calc{margin:14px 14px 0;padding:18px 16px 16px;border-radius:18px}
  .fp .calc-head{margin-bottom:14px}
  .fp .calc-title{font-size:9.5px;letter-spacing:1.8px}
  .fp .calc-livechip{font-size:8.5px;letter-spacing:1.3px;padding:3px 7px;border-radius:5px}
  .fp .field{margin-bottom:12px}
  .fp .field-label{font-size:9px;letter-spacing:1.4px;margin-bottom:6px}
  .fp .input-field{padding:14px;min-height:48px;border-radius:11px;font-size:15px}
  .fp .scan-btn{width:38px;height:38px;border-radius:9px}
  .fp .chip{padding:8px 11px;border-radius:8px;font-size:10px}
  .fp .cond{padding:11px 4px;border-radius:9px;font-size:10.5px;letter-spacing:.9px;min-height:44px}
  .fp .cta{padding:15px;min-height:52px;border-radius:12px;font-size:15px}
  .fp .quota{font-size:8.5px;letter-spacing:1.4px;margin-top:9px}

  /* result */
  .fp .result{margin:14px 14px 0;border-radius:18px}
  .fp .res-head{padding:14px 16px}
  .fp .res-back{padding:7px 10px;min-height:36px;font-size:9px;letter-spacing:1.3px}
  .fp .res-title{font-size:12.5px}
  .fp .res-title .meta{font-size:8.5px;letter-spacing:1.4px}
  .fp .res-body{padding:14px 16px;gap:12px}
  .fp .res-section-h{font-size:9px;letter-spacing:1.6px;margin-bottom:7px}
  .fp .verdict{padding:18px;border-radius:14px}
  .fp .verdict-label{font-size:30px;letter-spacing:-1.1px}
  .fp .verdict-sub{font-size:9px;letter-spacing:1.4px;margin-top:6px}
  .fp .verdict-score{width:54px;height:54px;font-size:18px}
  .fp .maxbuy{padding:16px;border-radius:13px}
  .fp .maxbuy-num{font-size:38px;letter-spacing:-1.5px}
  .fp .maxbuy-foot{gap:14px;margin-top:13px;padding-top:13px}
  .fp .maxbuy-foot .k{font-size:8.5px;letter-spacing:1.1px}
  .fp .maxbuy-foot .v{font-size:16px}
  .fp .saleplan{gap:6px}
  .fp .sp{padding:11px 9px;border-radius:11px}
  .fp .sp .k{font-size:8px;letter-spacing:1.3px}
  .fp .sp .v{font-size:18px;letter-spacing:-.5px;margin-top:5px}
  .fp .sp .sub{font-size:8.5px;margin-top:4px}
  .fp .returns{border-radius:11px}
  .fp .returns>div{padding:12px 10px}
  .fp .returns .k{font-size:8.5px;letter-spacing:1.1px}
  .fp .returns .v{font-size:17px;letter-spacing:-.4px;margin-top:3px}
  .fp .scores{padding:14px;border-radius:13px;gap:11px}
  .fp .score-row{grid-template-columns:74px 1fr auto;gap:11px}
  .fp .score-row .lbl{font-size:8.5px;letter-spacing:1.1px}
  .fp .score-row .val{font-size:12px;min-width:78px}
  .fp .score-row .val .cat{font-size:8.5px;margin-left:4px}
  .fp .channels{gap:6px}
  .fp .ch{gap:10px;padding:11px 12px;border-radius:11px}
  .fp .ch-name .nm{font-size:13px}
  .fp .ch-name .badge{font-size:7.5px;letter-spacing:1.2px;padding:3px 6px}
  .fp .ch-num .net{font-size:13.5px}
  .fp .ch-num .roi{font-size:8.5px}
  .fp .comps{padding:14px;border-radius:13px}
  .fp .comps-stats .v{font-size:18px;letter-spacing:-.4px}
  .fp .comps-stats .k{font-size:8.5px;letter-spacing:1.1px}
  .fp .histo{height:36px;margin-bottom:7px}
  .fp .histo-axis{font-size:8.5px}
  .fp .ai{padding:13px;border-radius:12px}
  .fp .ai-h{font-size:8.5px;letter-spacing:1.4px;gap:7px;margin-bottom:7px}
  .fp .ai-text{font-size:12.5px;line-height:1.5}
  .fp .gated{margin:0 16px 14px;padding:13px;border-radius:12px;gap:10px}
  .fp .gated-txt{font-size:12px}
  .fp .gated-btn{padding:9px 13px;border-radius:8px;font-size:11.5px}
  .fp .res-cta{padding:10px 16px 16px;gap:8px}
  .fp .res-cta .b1,.fp .res-cta .b2{padding:13px;border-radius:11px;font-size:13px;min-height:48px}

  /* trust bar */
  .fp .trustbar{padding:18px 14px 0}
  .fp .trustbar-inner{flex-direction:row;flex-wrap:wrap;gap:14px;padding:14px;border-radius:12px}
  .fp .trust-stat{flex-direction:column;gap:2px;flex:1;min-width:96px}
  .fp .trust-num{font-size:16px}
  .fp .trust-label{font-size:8.5px;letter-spacing:1.3px}
  .fp .trust-divider{display:none}

  /* sections */
  .fp .strip{padding:24px 18px 0}
  .fp .strip-title{font-size:22px;letter-spacing:-.7px}
  .fp .strip-sub{font-size:13px}
  .fp .strip-eyebrow{font-size:9px;letter-spacing:2px;padding:4px 8px}
  .fp .output-list{grid-template-columns:1fr;gap:8px;padding:8px}
  .fp .output-list li{grid-template-columns:1fr;gap:4px;padding:12px 13px}
  .fp .output-list .k{font-size:9px}
  .fp .output-list .v{font-size:13px}
  .fp .formula{padding:20px;border-radius:13px}
  .fp .formula-title{font-size:20px}
  .fp .formula-line{font-size:11px;padding:12px 14px}
  .fp .formula-foot{grid-template-columns:1fr;gap:14px;margin-top:16px}
  .fp .faq-wrap{grid-template-columns:1fr;gap:8px}
  .fp .faq{padding:14px 16px;border-radius:10px}
  .fp .faq summary{font-size:13.5px}
  .fp .faq p{font-size:12.5px}
  .fp .final{padding:24px 20px;border-radius:14px;flex-direction:column;align-items:flex-start;gap:18px}
  .fp .final h3{font-size:20px}
  .fp .final p{font-size:12.5px}
  .fp .final-actions{width:100%;flex-direction:column;gap:8px}
  .fp .btn-primary,.fp .btn-ghost{width:100%;text-align:center;padding:13px;border-radius:10px;font-size:12.5px}
  .fp footer{margin-top:24px;padding:18px 18px 28px;flex-direction:column;gap:8px;font-size:9.5px}
}
`;

export default function FreePage() {
  const resultRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [cost, setCost] = useState("");
  const [cond, setCond] = useState("new");
  const [busy, setBusy] = useState(false);
  const [busyMsg, setBusyMsg] = useState("Pulling sold comps\u2026");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    pushEvent("free_page_view");
  }, []);

  const valid = q.trim() && parseFloat(cost) > 0;

  const onSubmit = useCallback(() => {
    if (!valid || busy) return;
    setBusy(true);
    setResult(null);
    setBusyMsg("Pulling sold comps\u2026");
    addRecentSearch(q.trim());

    pushEvent("analysis_started", { query: q.trim(), cost: parseFloat(cost) });

    runAnalysisStream(
      q.trim(),
      parseFloat(cost),
      cond,
      (r: AnalysisResult) => {
        setResult(r);
        setBusy(false);
        pushEvent("analysis_completed", {
          query: q.trim(),
          recommendation: r.recommendation || "",
        });
        setTimeout(
          () =>
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100
        );
      },
      () => {
        /* ai complete */
      },
      (err) => {
        setBusy(false);
        alert(err.message);
      },
      (progress) => {
        setBusyMsg(progress.message);
      }
    ).catch(() => setBusy(false));
  }, [valid, busy, q, cost, cond]);

  return (
    <div className="fp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Script
        id="ld-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* ═══ NAV ═══ */}
      <nav className="nav">
        <Link className="brand" href="/" aria-label="FlipIQ home">
          <span className="brand-mark">F</span>
          <span>
            Flip<span style={{ color: "var(--accent)" }}>IQ</span>
          </span>
        </Link>
        <div className="nav-right">
          <Link className="nav-link hide-sm" href="/">
            Product
          </Link>
          <Link className="nav-link hide-sm" href="/plans">
            Pricing
          </Link>
          <Link className="nav-link" href="/">
            Blog
          </Link>
          <Link className="nav-cta" href="/register">
            Get the app →
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <header className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" />
            Live data · 2 marketplaces
          </div>
          <h1 className="hero-h1">
            Free flip profit calculator <em>for eBay &amp; Amazon</em>
          </h1>
          <p className="hero-sub">
            Type a product, drop your cost. We pull live sold comps from eBay
            and Amazon and tell you the max buy price, expected profit, and
            whether you&apos;ll actually sell before you spend a dollar.
          </p>
          <ul className="hero-bullets">
            <li>
              <span>
                <b>Max buy price</b> backed out from real fees, not a flat 15%
                guess.
              </span>
            </li>
            <li>
              <span>
                <b>Profit per channel</b> across eBay and Amazon.
              </span>
            </li>
            <li>
              <span>
                <b>Execution confidence</b> so a 50% ROI you can&apos;t realize
                doesn&apos;t beat 25% ROI you can.
              </span>
            </li>
          </ul>
          <div className="hero-meta">
            <span className="pip">No signup · 5 analyses</span>
            <span className="pip">No credit card</span>
            <span className="pip">Live sold comps</span>
          </div>
        </div>

        {/* ═══ CALCULATOR / RESULT (same column) ═══ */}
        {!result ? (
          <aside className="calc" aria-label="Flip profit calculator">
            <div className="calc-head">
              <div className="calc-title">▸ Flip Calculator</div>
              <div className="calc-livechip">
                <span className="dot" />
                Live
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="q">
                Product / UPC / Barcode
              </label>
              <div className="input-wrap">
                <input
                  className="input-field"
                  id="q"
                  placeholder="Type product name or scan barcode…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                  }}
                />
                <button
                  className="scan-btn"
                  type="button"
                  aria-label="Scan barcode"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="field">
              <div className="chip-label">Quick start — tap to try</div>
              <div className="chips">
                {SAMPLES.map((s) => (
                  <button
                    key={s.q}
                    className="chip"
                    type="button"
                    onClick={() => {
                      setQ(s.q);
                      setCost(s.cost);
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label className="field-label">Your cost ($)</label>
                <input
                  className="input-field mono"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                  }}
                />
              </div>
              <div className="field">
                <label className="field-label">Condition</label>
                <div className="cond-grp">
                  {(["new", "used"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`cond ${cond === c ? "active" : ""}`}
                      onClick={() => setCond(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="cta"
              disabled={!valid || busy}
              onClick={onSubmit}
            >
              {busy ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: 13,
                      height: 13,
                      border: "2px solid rgba(10,10,10,.3)",
                      borderTopColor: "var(--bg)",
                      borderRadius: "50%",
                      animation: "fp-spin .6s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  {busyMsg}
                </span>
              ) : (
                <>
                  Analyze product <span className="arr">→</span>
                </>
              )}
            </button>
            <div className="quota">
              <b>5 / 5</b> free · Sign up for 100/day
            </div>
          </aside>
        ) : (
          <aside className="result" ref={resultRef}>
            <header className="res-head">
              <button
                className="res-back"
                type="button"
                onClick={() => setResult(null)}
              >
                ← Another
              </button>
              <div className="res-title">
                <span className="meta">● Analysis complete</span>
                {result.product.title}
              </div>
            </header>

            <div className="res-body">
              {/* Verdict */}
              <div className="verdict">
                <div>
                  <div className="verdict-label">{result.recommendation}</div>
                  <div className="verdict-sub">
                    Opportunity {result.flipScore}/100
                  </div>
                </div>
                <div className="verdict-score">{result.flipScore}</div>
              </div>

              {/* Max buy */}
              <div>
                <div className="res-section-h">Max buy price</div>
                <div className="maxbuy">
                  <div className="maxbuy-cap">Don&apos;t pay more than</div>
                  <div className="maxbuy-num">${result.maxBuy}</div>
                  <div className="maxbuy-foot">
                    <div>
                      <div className="k">Your cost</div>
                      <div className="v">
                        $
                        {(
                          parseFloat(result.maxBuy) -
                          parseFloat(result.headroom)
                        ).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="k">Headroom</div>
                      <div className="v lime">+${result.headroom}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sale plan */}
              <div>
                <div className="res-section-h">Sale plan</div>
                <div className="saleplan">
                  <div className="sp">
                    <div className="k">Quick</div>
                    <div className="v">${result.quickPrice}</div>
                    <div className="sub">3–5 days</div>
                  </div>
                  <div className="sp strong">
                    <div className="k">Market</div>
                    <div className="v">${result.marketPrice}</div>
                    <div className="sub">recommended</div>
                  </div>
                  <div className="sp">
                    <div className="k">Stretch</div>
                    <div className="v">${result.stretchPrice}</div>
                    <div className="sub">with reputation</div>
                  </div>
                </div>
              </div>

              {/* Returns */}
              <div>
                <div className="res-section-h">Returns</div>
                <div className="returns">
                  <div>
                    <div className="k">Profit</div>
                    <div
                      className={`v ${parseFloat(result.mainProfit) >= 0 ? "pos" : ""}`}
                    >
                      {parseFloat(result.mainProfit) >= 0 ? "+" : ""}$
                      {result.mainProfit}
                    </div>
                  </div>
                  <div>
                    <div className="k">ROI</div>
                    <div className="v">{result.mainROI}%</div>
                  </div>
                  <div>
                    <div className="k">Margin</div>
                    <div className="v">
                      {(parseFloat(result.mainROI) > 0
                        ? (parseFloat(result.mainProfit) /
                            (parseFloat(result.mainProfit) +
                              parseFloat(result.maxBuy) -
                              parseFloat(result.headroom))) *
                          100
                        : 0
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* Channels */}
              {result.channels.length > 0 && (
                <div>
                  <div className="res-section-h">Channels</div>
                  <div className="channels">
                    {result.channels.map((ch) => (
                      <div
                        key={ch.id}
                        className={`ch ${ch.channelRole === "recommended" ? "best" : ""}`}
                      >
                        <div className="ch-name">
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span className="nm">{ch.label}</span>
                              {ch.channelRole === "recommended" && (
                                <span className="badge">Best</span>
                              )}
                              {ch.channelRole === "best_profit" && (
                                <span className="badge">+profit</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ch-num">
                          <div
                            className={`net ${parseFloat(ch.profit) < 0 ? "neg" : ""}`}
                          >
                            {parseFloat(ch.profit) >= 0 ? "+" : ""}${ch.profit}
                          </div>
                          <div className="roi">{ch.roi}% ROI</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scores */}
              <div>
                <div className="res-section-h">Scores</div>
                <div className="scores">
                  {[
                    {
                      lbl: "Safety",
                      v: 100 - result.risk,
                      cat:
                        100 - result.risk >= 70
                          ? "HIGH"
                          : 100 - result.risk >= 40
                            ? "MED"
                            : "LOW",
                      warn: 100 - result.risk < 40,
                    },
                    {
                      lbl: "Confidence",
                      v: result.confidence,
                      cat:
                        result.confidence >= 70
                          ? "HIGH"
                          : result.confidence >= 40
                            ? "MED"
                            : "LOW",
                      warn: result.confidence < 50,
                    },
                    {
                      lbl: "Velocity",
                      v: result.velocity,
                      cat:
                        result.velocity >= 70
                          ? "FAST"
                          : result.velocity >= 40
                            ? "MOD"
                            : "SLOW",
                      warn: result.velocity < 40,
                    },
                  ].map((s) => (
                    <div key={s.lbl} className="score-row">
                      <span className="lbl">{s.lbl}</span>
                      <div className="bar">
                        <div
                          className={`fill ${s.warn ? "warn" : ""}`}
                          style={{ width: `${s.v}%` }}
                        />
                      </div>
                      <span className="val">
                        {s.v}
                        <span className="cat"> {s.cat}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speed to sell */}
              {result.salesPerDay != null && (
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 11,
                    background: "var(--bg-3)",
                    border: "1px solid var(--line)",
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--dim)",
                    letterSpacing: 0.4,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {result.estDaysToSell}
                  </span>{" "}
                  to sell
                  <span style={{ color: "var(--line-2)" }}>·</span>
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {result.salesPerDay.toFixed(1)}
                  </span>
                  /day
                  {result.velocityCategory && (
                    <>
                      <span style={{ color: "var(--line-2)" }}>·</span>
                      <span
                        style={{
                          color: "var(--accent)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: 9,
                          letterSpacing: 1.2,
                        }}
                      >
                        {result.velocityCategory.replace("_", " ")}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div className="res-section-h">Warnings</div>
                  {result.warnings.slice(0, 2).map((w, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 9,
                        background: "rgba(255,184,77,0.06)",
                        border: "1px solid rgba(255,184,77,0.15)",
                        fontSize: 11,
                        color: "rgba(245,245,242,0.7)",
                        lineHeight: 1.45,
                      }}
                    >
                      ⚠ {w}
                    </div>
                  ))}
                  {result.warnings.length > 2 && (
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        color: "var(--dimmer)",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        textAlign: "center",
                        marginTop: 2,
                      }}
                    >
                      +{result.warnings.length - 2} more — sign up for full
                      details
                    </div>
                  )}
                </div>
              )}

              {/* Recent sales (sample comps) */}
              {result.sampleComps && result.sampleComps.length > 0 && (
                <div>
                  <div className="res-section-h">
                    Recent sales — tap to verify
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {result.sampleComps.map((comp, i) => (
                      <a
                        key={i}
                        href={comp.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 11,
                          background: "var(--bg-3)",
                          border: "1px solid var(--line)",
                          textDecoration: "none",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: "rgba(245,245,242,0.06)",
                            flexShrink: 0,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {comp.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={comp.imageUrl}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="rgba(245,245,242,0.2)"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "var(--display)",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--ink)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: 2,
                            }}
                          >
                            {comp.title}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: 9,
                              color: "var(--dim)",
                              letterSpacing: 0.3,
                            }}
                          >
                            {comp.soldDate &&
                              new Date(comp.soldDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            {comp.condition && ` · ${comp.condition}`}
                            {comp.url && " · eBay →"}
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--display)",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                            flexShrink: 0,
                          }}
                        >
                          ${comp.soldPrice.toFixed(2)}
                        </span>
                      </a>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 8,
                      color: "var(--dimmer)",
                      letterSpacing: 0.5,
                      marginTop: 6,
                      textAlign: "center",
                    }}
                  >
                    Prices vary by size and condition
                  </div>
                </div>
              )}

              {/* AI or gated */}
              {result.aiExplanation ? (
                <div className="ai">
                  <div className="ai-h">
                    <span className="dot" />
                    FlipIQ summary
                  </div>
                  <p className="ai-text">{result.aiExplanation}</p>
                </div>
              ) : (
                <div className="ai">
                  <div className="ai-h">
                    <span className="dot" />
                    FlipIQ summary
                  </div>
                  <p className="ai-text" style={{ color: "var(--dimmer)" }}>
                    AI analysis available with Starter plan.
                  </p>
                </div>
              )}
            </div>

            <div className="gated">
              <div className="gated-txt">
                <b>Save this analysis</b> &amp; track price drops — in the app.
              </div>
              <Link className="gated-btn" href="/register">
                Get the app
              </Link>
            </div>
            <div className="res-cta">
              <button
                className="b1"
                type="button"
                onClick={() => setResult(null)}
              >
                ← Analyze another
              </button>
              <Link className="b2" href="/register">
                ★ Sign up free
              </Link>
            </div>
          </aside>
        )}
      </header>

      {/* ═══ TRUST BAR ═══ */}
      <section className="trustbar">
        <div className="trustbar-inner">
          <div className="trust-stat">
            <span className="trust-num lime">12,847</span>
            <span className="trust-label">analyses today</span>
          </div>
          <span className="trust-divider" />
          <div className="trust-stat">
            <span className="trust-num">2</span>
            <span className="trust-label">marketplaces</span>
          </div>
          <span className="trust-divider" />
          <div className="trust-stat">
            <span className="trust-num">&lt; 6s</span>
            <span className="trust-label">median time</span>
          </div>
          <span className="trust-divider" />
          <div className="trust-stat">
            <span className="trust-num">$0</span>
            <span className="trust-label">to use</span>
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU GET BACK ═══ */}
      <section className="strip">
        <div className="strip-head">
          <div>
            <div className="strip-eyebrow">▸ What you get back</div>
            <div className="strip-title">
              Six numbers. <em>One verdict.</em>
            </div>
          </div>
          <p className="strip-sub">
            Every analysis returns the same set, on every product. Read it once,
            trust it forever.
          </p>
        </div>
        <ul className="output-list">
          <li>
            <span className="k">Verdict</span>
            <span className="v">
              <b>BUY</b> · WATCH · PASS
            </span>
          </li>
          <li>
            <span className="k">Max buy</span>
            <span className="v">Highest you can pay &amp; still profit</span>
          </li>
          <li>
            <span className="k">Profit / ROI</span>
            <span className="v">Per channel, after real fees</span>
          </li>
          <li>
            <span className="k">Days to sell</span>
            <span className="v">Estimated from 90d sell-through</span>
          </li>
          <li>
            <span className="k">Confidence</span>
            <span className="v">0–100 — depth, volatility, competition</span>
          </li>
          <li>
            <span className="k">List price</span>
            <span className="v">Quick · Market · Stretch</span>
          </li>
        </ul>
      </section>

      {/* ═══ FORMULA ═══ */}
      <section className="strip">
        <div className="strip-head">
          <div>
            <div className="strip-eyebrow">▸ How max buy is calculated</div>
            <div className="strip-title">
              No flat 15%. The actual fee stack, <em>per channel.</em>
            </div>
          </div>
          <p className="strip-sub">
            Most calculators use a flat fee assumption. We back out the real
            numbers — final-value fees, payment processing, shipping, FBA when
            applicable, and your target margin.
          </p>
        </div>
        <div className="formula">
          <div className="formula-h">Formula</div>
          <div className="formula-title">
            Max buy = how much you can pay and still hit your margin.
          </div>
          <div className="formula-line">
            <span className="term">Median sold comp</span>
            <span className="op">−</span>
            <span className="term">Marketplace fees</span>
            <span className="op">−</span>
            <span className="term">Shipping</span>
            <span className="op">−</span>
            <span className="term">Target margin</span>
            <span className="op">=</span>
            <span className="out">Max buy price</span>
          </div>
          <div className="formula-foot">
            <div>
              <b>Median sold comp</b>
              <span>
                The middle of the last 30 days of actual sold listings — not
                asking prices.
              </span>
            </div>
            <div>
              <b>Fees + shipping</b>
              <span>
                Per-channel: eBay final value fees and shipping, plus Amazon
                referral and FBA estimates.
              </span>
            </div>
            <div>
              <b>Target margin</b>
              <span>
                Default 25% for new, 35% for used. Adjustable in settings.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="strip">
        <div className="strip-head">
          <div>
            <div className="strip-eyebrow">▸ FAQ</div>
            <div className="strip-title">
              Everything people ask before they trust the number.
            </div>
          </div>
          <p className="strip-sub">
            If your question isn&apos;t here, the answer is in the analysis —
            every output card explains its math.
          </p>
        </div>
        <div className="faq-wrap">
          <details className="faq" open>
            <summary>What is FlipIQ?</summary>
            <p>
              A free flip profit calculator for resellers. Enter a product and
              your cost; we pull live data from eBay and Amazon and tell you
              whether the flip is worth it before you buy.
            </p>
          </details>
          <details className="faq">
            <summary>Who is it for?</summary>
            <p>
              Online and retail arbitrage flippers, thrift and garage-sale
              resellers, eBay and Amazon FBA sellers, and side-hustlers who want
              a fast buy/no-buy answer instead of doing fee math by hand.
            </p>
          </details>
          <details className="faq">
            <summary>Which marketplaces?</summary>
            <p>
              eBay and Amazon. Profit is calculated per channel so you can pick
              the strongest place to list based on margin and execution.
            </p>
          </details>
          <details className="faq">
            <summary>What does it return?</summary>
            <p>
              Buy/no-buy verdict, max buy price, expected profit and ROI per
              marketplace, suggested list prices (Quick / Market / Stretch),
              days to sell, and execution confidence.
            </p>
          </details>
          <details className="faq">
            <summary>Is it free?</summary>
            <p>
              Yes. 5 analyses with no signup. Free email signup unlocks 100/day.
              No credit card. Paid plans add scanning, watchlists, alerts and
              Flip &amp; Save rewards.
            </p>
          </details>
          <details className="faq">
            <summary>How is max buy calculated?</summary>
            <p>
              Median sold comp − marketplace fees (FVF, payment, FBA when
              applicable) − shipping − target margin = the highest price you can
              pay and still profit on the chosen channel.
            </p>
          </details>
          <details className="faq">
            <summary>Why execution confidence?</summary>
            <p>
              Raw ROI assumes you sell at median. Confidence weights it against
              sell-through, comp count, volatility and competition. A 50% ROI
              you can&apos;t realize is worse than 25% you can.
            </p>
          </details>
          <details className="faq">
            <summary>When to verify by hand?</summary>
            <p>
              Trust it when comps are 20+, confidence is 60+, and trend is
              stable. Verify when comps are under 10, when condition splits
              matter, or when the item is seasonal.
            </p>
          </details>
        </div>

        {/* Final upsell */}
        <div className="final">
          <div>
            <div className="final-eyebrow">▸ The next step</div>
            <h3>
              The web calculator is the floor.{" "}
              <span style={{ color: "var(--accent)" }}>
                The app is the ceiling.
              </span>
            </h3>
            <p>
              Barcode scanning in-store, watchlists, real-time price alerts,
              Flip &amp; Save rewards, and unlimited analyses. Same engine,
              faster decisions.
            </p>
          </div>
          <div className="final-actions">
            <Link className="btn-primary" href="/register">
              Get the app →
            </Link>
            <Link className="btn-ghost" href="/plans">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div>© 2026 FlipIQ · Free flip profit calculator</div>
        <div className="links">
          <Link href="/">Product</Link>
          <Link href="/plans">Pricing</Link>
          <span>Blog</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </footer>
    </div>
  );
}
