"use client";

import { useState } from "react";
import FlipIQCalculator from "@/components/FlipIQCalculator";
import Link from "next/link";
import Script from "next/script";

const CSS_VARS = {
  "--bg": "#0A0A0A",
  "--bg-2": "#0E0E0E",
  "--bg-3": "#141414",
  "--ink": "#F5F5F2",
  "--dim": "rgba(245,245,242,0.58)",
  "--dimmer": "rgba(245,245,242,0.35)",
  "--line": "rgba(245,245,242,0.08)",
  "--line-2": "rgba(245,245,242,0.14)",
  "--accent": "#D4FF3A",
  "--accent-2": "#E8FF7A",
  "--accent-bg": "rgba(212,255,58,0.06)",
  "--accent-bd": "rgba(212,255,58,0.28)",
  "--display": "'Inter Tight',system-ui,-apple-system,sans-serif",
  "--mono": "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace",
  "--gap": "14px",
} as Record<string, string>;

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FlipIQ Free Flip Profit Calculator",
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  description:
    "Free flip profit calculator for resellers. Compares profit across eBay, Amazon, Facebook Marketplace and MercadoLibre and returns max buy price, ROI, days-to-sell and execution confidence.",
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
        text: "FlipIQ is a free flip profit calculator for resellers. You enter a product and your cost; it pulls live sales data from eBay, Amazon, Facebook Marketplace and MercadoLibre and tells you whether the flip is worth it before you buy.",
      },
    },
    {
      "@type": "Question",
      name: "Who is it for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Online and retail arbitrage flippers, thrift and garage-sale resellers, eBay and Amazon FBA sellers, and side-hustlers who want a fast buy/no-buy answer instead of doing fee math by hand.",
      },
    },
    {
      "@type": "Question",
      name: "Which marketplaces does it support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "eBay, Amazon, Facebook Marketplace and MercadoLibre.",
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
    {
      "@type": "Question",
      name: "Why does execution confidence matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Raw ROI assumes you sell at median. Confidence weights it against sell-through, comp count, volatility and competition.",
      },
    },
  ],
};

const T = {
  es: {
    navProduct: "Producto",
    navPricing: "Precios",
    navBlog: "Blog",
    navCta: "Descargar app \u2192",
    heroEyebrow: "Data en vivo \u00b7 4 marketplaces",
    heroH1Pre: "Calculadora de profit gratis ",
    heroH1Em: "para eBay y Amazon",
    heroSub:
      "Escribi un producto, pone tu costo. Sacamos comps vendidos en vivo de cuatro marketplaces y te decimos el precio maximo de compra, profit esperado, y si realmente vas a vender \u2014 antes de gastar un peso.",
    bullet1Rest: " calculado con fees reales, no un 15% generico.",
    bullet1Bold: "Precio maximo de compra",
    bullet2Rest: " en eBay, Amazon, FBMP y MercadoLibre.",
    bullet2Bold: "Profit por canal",
    bullet3Rest:
      " para que un 50% ROI que no podes realizar no le gane a un 25% que si.",
    bullet3Bold: "Confianza de ejecucion",
    metaChip1: "Sin registro \u00b7 5 analisis",
    metaChip2: "Sin tarjeta",
    metaChip3: "Comps vendidos en vivo",
    trustLabel1: "analisis hoy",
    trustLabel2: "marketplaces",
    trustLabel3: "tiempo medio",
    trustLabel4: "para usar",
    outputEyebrow: "\u25b6 Lo que recibes",
    outputTitle: "Seis numeros. ",
    outputTitleEm: "Un veredicto.",
    outputSub:
      "Cada analisis devuelve el mismo set, en cada producto. Leelo una vez, confia siempre.",
    outputK1: "Veredicto",
    outputV1: "BUY \u00b7 WATCH \u00b7 PASS",
    outputK2: "Max compra",
    outputV2: "Lo maximo que podes pagar y ganar",
    outputK3: "Profit / ROI",
    outputV3: "Por canal, despues de fees reales",
    outputK4: "Dias para vender",
    outputV4: "Estimado de 90d de sell-through",
    outputK5: "Confianza",
    outputV5: "0\u2013100 \u2014 profundidad, volatilidad, competencia",
    outputK6: "Precio de lista",
    outputV6: "Rapido \u00b7 Mercado \u00b7 Stretch",
    formulaEyebrow: "\u25b6 Como se calcula el max buy",
    formulaTitle: "Sin 15% generico. El stack real de fees, ",
    formulaTitleEm: "por canal.",
    formulaSub:
      "La mayoria de calculadoras usan una fee plana. Nosotros sacamos los numeros reales \u2014 fees de valor final, procesamiento de pago, envio, FBA cuando aplica, y tu margen objetivo.",
    formulaBoxTitle:
      "Max buy = cuanto podes pagar y todavia cumplir tu margen.",
    formulaFoot1Title: "Mediana de comps",
    formulaFoot1Desc:
      "La mitad de los ultimos 30 dias de ventas reales \u2014 no precios de publicacion.",
    formulaFoot2Title: "Fees + envio",
    formulaFoot2Desc:
      "Por canal: eBay FVF + pago, Amazon referral + FBA, FBMP $0, MercadoLibre escalonado.",
    formulaFoot3Title: "Margen objetivo",
    formulaFoot3Desc:
      "Default 25% para nuevo, 35% para usado. Ajustable en settings.",
    faqEyebrow: "\u25b6 Preguntas frecuentes",
    faqTitle: "Todo lo que preguntan antes de confiar en el numero.",
    faqSub:
      "Si tu pregunta no esta aca, la respuesta esta en el analisis \u2014 cada card explica su matematica.",
    faqQ1: "Que es FlipIQ?",
    faqA1:
      "Una calculadora gratis de profit para resellers. Pones un producto y tu costo; sacamos data en vivo de eBay, Amazon, FBMP y MercadoLibre y te decimos si el flip vale la pena antes de comprar.",
    faqQ2: "Para quien es?",
    faqA2:
      "Flippers de arbitraje online y retail, resellers de thrift y garage sales, vendedores de eBay y Amazon FBA, y side-hustlers que quieren una respuesta rapida de buy/no-buy sin hacer cuentas de fees a mano.",
    faqQ3: "Que marketplaces?",
    faqA3:
      "eBay, Amazon, Facebook Marketplace y MercadoLibre. El profit se calcula por canal para que elijas el mas rentable.",
    faqQ4: "Que devuelve?",
    faqA4:
      "Veredicto buy/no-buy, precio maximo de compra, profit esperado y ROI por marketplace, precios de lista sugeridos (Rapido / Mercado / Stretch), dias para vender, y confianza de ejecucion.",
    faqQ5: "Es gratis?",
    faqA5:
      "Si. 5 analisis sin registro. Con email gratis desbloqueas 100/dia. Sin tarjeta. Los planes pagos agregan escaneo, watchlists, alertas y Flip & Save rewards.",
    faqQ6: "Como se calcula el max buy?",
    faqA6:
      "Mediana de comps vendidos \u2212 fees del marketplace (FVF, pago, FBA cuando aplica) \u2212 envio \u2212 margen objetivo = lo maximo que podes pagar y ganar en el canal elegido.",
    faqQ7: "Por que confianza de ejecucion?",
    faqA7:
      "El ROI crudo asume que vendes a la mediana. La confianza lo pondera contra sell-through, cantidad de comps, volatilidad y competencia. Un 50% ROI que no podes realizar es peor que 25% que si.",
    faqQ8: "Cuando verificar a mano?",
    faqA8:
      "Confia cuando los comps son 20+, confianza 60+, y tendencia estable. Verifica cuando los comps son menos de 10, cuando la condicion importa, o cuando el item es estacional.",
    finalEyebrow: "\u25b6 El siguiente paso",
    finalTitle: "La calculadora web es el piso. ",
    finalTitleAccent: "La app es el techo.",
    finalSub:
      "Escaneo de barcode en tienda, watchlists, alertas de precio en tiempo real, Flip & Save rewards, y analisis ilimitados. Mismo motor, decisiones mas rapidas.",
    finalBtnPrimary: "Descargar app \u2192",
    finalBtnGhost: "Ver precios",
    footerCopy: "\u00a9 2026 FlipIQ \u00b7 Calculadora de profit gratis",
  },
  en: {
    navProduct: "Product",
    navPricing: "Pricing",
    navBlog: "Blog",
    navCta: "Get the app \u2192",
    heroEyebrow: "Live data \u00b7 4 marketplaces",
    heroH1Pre: "Free flip profit calculator ",
    heroH1Em: "for eBay & Amazon",
    heroSub:
      "Type a product, drop your cost. We pull live sold comps from four marketplaces and tell you the max buy price, expected profit, and whether you\u2019ll actually sell \u2014 before you spend a dollar.",
    bullet1Rest: " backed out from real fees, not a flat 15% guess.",
    bullet1Bold: "Max buy price",
    bullet2Rest: " across eBay, Amazon, FBMP and MercadoLibre.",
    bullet2Bold: "Profit per channel",
    bullet3Rest:
      " so a 50% ROI you can\u2019t realize doesn\u2019t beat 25% ROI you can.",
    bullet3Bold: "Execution confidence",
    metaChip1: "No signup \u00b7 5 analyses",
    metaChip2: "No credit card",
    metaChip3: "Live sold comps",
    trustLabel1: "analyses today",
    trustLabel2: "marketplaces",
    trustLabel3: "median time",
    trustLabel4: "to use",
    outputEyebrow: "\u25b6 What you get back",
    outputTitle: "Six numbers. ",
    outputTitleEm: "One verdict.",
    outputSub:
      "Every analysis returns the same set, on every product. Read it once, trust it forever.",
    outputK1: "Verdict",
    outputV1: "BUY \u00b7 WATCH \u00b7 PASS",
    outputK2: "Max buy",
    outputV2: "Highest you can pay & still profit",
    outputK3: "Profit / ROI",
    outputV3: "Per channel, after real fees",
    outputK4: "Days to sell",
    outputV4: "Estimated from 90d sell-through",
    outputK5: "Confidence",
    outputV5: "0\u2013100 \u2014 depth, volatility, competition",
    outputK6: "List price",
    outputV6: "Quick \u00b7 Market \u00b7 Stretch",
    formulaEyebrow: "\u25b6 How max buy is calculated",
    formulaTitle: "No flat 15%. The actual fee stack, ",
    formulaTitleEm: "per channel.",
    formulaSub:
      "Most calculators use a flat fee assumption. We back out the real numbers \u2014 final-value fees, payment processing, shipping, FBA when applicable, and your target margin.",
    formulaBoxTitle:
      "Max buy = how much you can pay and still hit your margin.",
    formulaFoot1Title: "Median sold comp",
    formulaFoot1Desc:
      "The middle of the last 30 days of actual sold listings \u2014 not asking prices.",
    formulaFoot2Title: "Fees + shipping",
    formulaFoot2Desc:
      "Per-channel: eBay FVF + payment, Amazon referral + FBA, FBMP $0, MercadoLibre tiered.",
    formulaFoot3Title: "Target margin",
    formulaFoot3Desc:
      "Default 25% for new, 35% for used. Adjustable in settings.",
    faqEyebrow: "\u25b6 FAQ",
    faqTitle: "Everything people ask before they trust the number.",
    faqSub:
      "If your question isn\u2019t here, the answer is in the analysis \u2014 every output card explains its math.",
    faqQ1: "What is FlipIQ?",
    faqA1:
      "A free flip profit calculator for resellers. Enter a product and your cost; we pull live data from eBay, Amazon, FBMP and MercadoLibre and tell you whether the flip is worth it before you buy.",
    faqQ2: "Who is it for?",
    faqA2:
      "Online and retail arbitrage flippers, thrift and garage-sale resellers, eBay and Amazon FBA sellers, and side-hustlers who want a fast buy/no-buy answer instead of doing fee math by hand.",
    faqQ3: "Which marketplaces?",
    faqA3:
      "eBay, Amazon, Facebook Marketplace and MercadoLibre. Profit is calculated per channel so you can pick the most profitable one to list on.",
    faqQ4: "What does it return?",
    faqA4:
      "Buy/no-buy verdict, max buy price, expected profit and ROI per marketplace, suggested list prices (Quick / Market / Stretch), days to sell, and execution confidence.",
    faqQ5: "Is it free?",
    faqA5:
      "Yes. 5 analyses with no signup. Free email signup unlocks 100/day. No credit card. Paid plans add scanning, watchlists, alerts and Flip & Save rewards.",
    faqQ6: "How is max buy calculated?",
    faqA6:
      "Median sold comp \u2212 marketplace fees (FVF, payment, FBA when applicable) \u2212 shipping \u2212 target margin = the highest price you can pay and still profit on the chosen channel.",
    faqQ7: "Why execution confidence?",
    faqA7:
      "Raw ROI assumes you sell at median. Confidence weights it against sell-through, comp count, volatility and competition. A 50% ROI you can\u2019t realize is worse than 25% you can.",
    faqQ8: "When to verify by hand?",
    faqA8:
      "Trust it when comps are 20+, confidence is 60+, and trend is stable. Verify when comps are under 10, when condition splits matter, or when the item is seasonal.",
    finalEyebrow: "\u25b6 The next step",
    finalTitle: "The web calculator is the floor. ",
    finalTitleAccent: "The app is the ceiling.",
    finalSub:
      "Barcode scanning in-store, watchlists, real-time price alerts, Flip & Save rewards, and unlimited analyses. Same engine, faster decisions.",
    finalBtnPrimary: "Get the app \u2192",
    finalBtnGhost: "See pricing",
    footerCopy: "\u00a9 2026 FlipIQ \u00b7 Free flip profit calculator",
  },
};

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.85)}}

.free-page *,
.free-page *::before,
.free-page *::after { box-sizing: border-box; }

.free-page {
  margin: 0;
  background: radial-gradient(ellipse 1200px 600px at 50% 0%, rgba(212,255,58,0.04), transparent 60%), #050505;
  color: var(--ink);
  font-family: var(--display);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.free-page a { color: inherit; text-decoration: none; }

/* nav */
.fp-nav { max-width:1160px; margin:0 auto; padding:22px; display:flex; align-items:center; justify-content:space-between; }
.fp-brand { display:flex; align-items:center; gap:10px; font-family:var(--display); font-weight:800; font-size:20px; letter-spacing:-.3px; }
.fp-brand-mark { width:32px; height:32px; border-radius:9px; background:var(--bg); border:1px solid var(--line-2); display:grid; place-items:center; color:var(--accent); font-weight:900; font-size:18px; text-shadow:0 0 16px rgba(212,255,58,.5); }
.fp-nav-right { display:flex; align-items:center; gap:18px; }
.fp-nav-link { font-family:var(--mono); font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:var(--dim); }
.fp-nav-link:hover { color:var(--ink); }
.fp-nav-cta { font-family:var(--mono); font-size:10px; letter-spacing:1.5px; text-transform:uppercase; font-weight:700; padding:9px 14px; border-radius:7px; background:var(--accent); color:var(--bg); border:0; cursor:pointer; }
.fp-nav-cta:hover { background:var(--accent-2); }

/* hero */
.fp-hero { max-width:1160px; margin:0 auto; padding:8px 22px 40px; display:grid; grid-template-columns:minmax(0,1fr) 520px; gap:64px; align-items:start; }
.fp-hero-copy { padding-top:24px; }
.fp-eyebrow { display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--accent); padding:5px 10px; border-radius:6px; background:var(--accent-bg); border:1px solid var(--accent-bd); margin-bottom:18px; font-weight:700; }
.fp-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); box-shadow:0 0 6px var(--accent); animation:pulse 2s infinite; }
.fp-hero-h1 { font-family:var(--display); font-size:60px; font-weight:900; line-height:1; letter-spacing:-2.5px; margin:0 0 18px; text-wrap:balance; }
.fp-hero-h1 em { font-style:normal; color:var(--accent); text-shadow:0 0 24px rgba(212,255,58,.18); }
.fp-hero-sub { font-family:var(--display); font-size:17px; color:var(--dim); line-height:1.5; max-width:480px; margin:0 0 24px; font-weight:400; }
.fp-hero-bullets { list-style:none; padding:0; margin:0 0 28px; display:grid; gap:9px; }
.fp-hero-bullets li { font-family:var(--mono); font-size:11px; letter-spacing:.4px; color:var(--ink); display:flex; gap:10px; align-items:flex-start; }
.fp-hero-bullets li::before { content:"\\2192"; color:var(--accent); font-family:var(--mono); font-weight:700; flex-shrink:0; }
.fp-hero-meta { display:flex; gap:18px; flex-wrap:wrap; font-family:var(--mono); font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:var(--dim); }
.fp-pip { display:inline-flex; align-items:center; gap:6px; }
.fp-pip::before { content:"\\2713"; color:var(--accent); font-weight:800; }

/* calc wrapper */
.fp-calc-wrapper { position:sticky; top:20px; max-height:calc(100vh - 40px); overflow-y:auto; scrollbar-width:none; }
.fp-calc-wrapper::-webkit-scrollbar { display:none; }

/* trust bar */
.fp-trustbar { max-width:1160px; margin:0 auto; padding:10px 22px 0; }
.fp-trustbar-inner { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:18px 24px; background:var(--bg-2); border:1px solid var(--line); border-radius:14px; flex-wrap:wrap; }
.fp-trust-stat { display:flex; align-items:baseline; gap:10px; }
.fp-trust-num { font-family:var(--mono); font-size:22px; font-weight:700; letter-spacing:-.5px; color:var(--ink); }
.fp-trust-num.lime { color:var(--accent); }
.fp-trust-label { font-family:var(--mono); font-size:9px; color:var(--dim); font-weight:600; letter-spacing:1.5px; text-transform:uppercase; }
.fp-trust-divider { width:1px; height:30px; background:var(--line); }

/* sections */
.fp-strip { max-width:1160px; margin:0 auto; padding:64px 22px 0; }
.fp-strip-head { display:flex; align-items:end; justify-content:space-between; margin-bottom:28px; gap:18px; flex-wrap:wrap; }
.fp-strip-eyebrow { font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:var(--accent); padding:5px 10px; border-radius:6px; background:var(--accent-bg); border:1px solid var(--accent-bd); display:inline-block; margin-bottom:12px; }
.fp-strip-title { font-family:var(--display); font-size:36px; font-weight:900; letter-spacing:-1.2px; line-height:1.05; max-width:680px; text-wrap:balance; }
.fp-strip-title em { font-style:normal; color:var(--accent); }
.fp-strip-sub { font-size:14px; color:var(--dim); max-width:380px; line-height:1.6; }

/* output list */
.fp-output-list { list-style:none; padding:10px; margin:0; display:grid; grid-template-columns:repeat(2,1fr); gap:10px; background:var(--bg-2); border:1px solid var(--line); border-radius:14px; }
.fp-output-list li { display:grid; grid-template-columns:140px 1fr; gap:14px; align-items:baseline; padding:14px 16px; border-radius:10px; background:var(--bg-3); border:1px solid var(--line); }
.fp-output-list .k { font-family:var(--mono); font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--accent); }
.fp-output-list .v { font-family:var(--display); font-size:14px; color:var(--ink); line-height:1.4; }
.fp-output-list .v b { color:var(--accent); font-weight:800; letter-spacing:.5px; }

/* formula */
.fp-formula { background:var(--bg-2); border:1px solid var(--line); border-radius:14px; padding:30px; }
.fp-formula-h { font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--accent); margin-bottom:10px; }
.fp-formula-title { font-family:var(--display); font-size:24px; font-weight:800; letter-spacing:-.6px; line-height:1.2; margin-bottom:20px; text-wrap:balance; }
.fp-formula-line { font-family:var(--mono); font-size:13px; color:var(--ink); padding:16px 18px; border-radius:10px; background:var(--bg-3); border:1px solid var(--line); overflow-x:auto; letter-spacing:.3px; white-space:nowrap; }
.fp-formula-line .op { color:var(--dimmer); margin:0 8px; }
.fp-formula-line .term { color:var(--ink); }
.fp-formula-line .out { color:var(--accent); font-weight:700; }
.fp-formula-foot { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:20px; }
.fp-formula-foot div b { display:block; font-family:var(--mono); font-size:9px; color:var(--accent); font-weight:700; letter-spacing:1.4px; text-transform:uppercase; margin-bottom:5px; }
.fp-formula-foot div span { font-size:13px; color:var(--dim); line-height:1.55; }

/* faq */
.fp-faq-wrap { display:grid; grid-template-columns:1fr 1fr; gap:10px 14px; }
.fp-faq { background:var(--bg-2); border:1px solid var(--line); border-radius:11px; padding:18px 20px; }
.fp-faq[open] { border-color:var(--accent-bd); background:var(--accent-bg); }
.fp-faq summary { list-style:none; cursor:pointer; font-family:var(--display); font-size:14.5px; font-weight:700; letter-spacing:-.2px; color:var(--ink); display:flex; justify-content:space-between; align-items:center; gap:12px; }
.fp-faq summary::-webkit-details-marker { display:none; }
.fp-faq summary::after { content:"+"; font-family:var(--mono); font-size:18px; color:var(--dim); font-weight:400; line-height:1; }
.fp-faq[open] summary::after { content:"\\2212"; color:var(--accent); }
.fp-faq p { font-size:13px; color:var(--dim); line-height:1.65; margin:10px 0 0; }

/* final upsell */
.fp-final { margin-top:28px; padding:36px 32px; background:linear-gradient(135deg,rgba(212,255,58,.10),rgba(212,255,58,.02)); border:1px solid var(--accent-bd); border-radius:16px; display:flex; align-items:center; justify-content:space-between; gap:28px; position:relative; overflow:hidden; }
.fp-final::before { content:""; position:absolute; inset:0; background:radial-gradient(ellipse 100% 60% at 0% 0%, rgba(212,255,58,0.10), transparent 60%); pointer-events:none; }
.fp-final-eyebrow { font-family:var(--mono); font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--accent); font-weight:700; margin-bottom:8px; }
.fp-final h3 { font-family:var(--display); font-size:26px; font-weight:900; margin:0 0 8px; letter-spacing:-.7px; line-height:1.15; text-wrap:balance; }
.fp-final p { font-size:13.5px; color:var(--dim); margin:0; max-width:520px; line-height:1.55; }
.fp-final-actions { display:flex; gap:10px; flex-shrink:0; position:relative; }
.fp-btn-primary { padding:14px 22px; border-radius:11px; border:0; background:var(--accent); color:var(--bg); font-family:var(--display); font-size:13px; font-weight:800; cursor:pointer; letter-spacing:.2px; }
.fp-btn-primary:hover { background:var(--accent-2); }
.fp-btn-ghost { padding:14px 22px; border-radius:11px; border:1px solid var(--line-2); background:transparent; color:var(--ink); font-family:var(--display); font-size:13px; font-weight:700; cursor:pointer; }
.fp-btn-ghost:hover { border-color:var(--accent-bd); color:var(--accent); }

/* footer */
.fp-footer { max-width:1160px; margin:64px auto 0; padding:24px 22px 40px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; font-family:var(--mono); font-size:10px; letter-spacing:1px; color:var(--dim); text-transform:uppercase; }
.fp-footer a:hover { color:var(--ink); }
.fp-footer-links { display:flex; gap:18px; }

/* responsive */
@media (max-width:980px) {
  .fp-hero { grid-template-columns:1fr; gap:24px; }
  .fp-hero-copy { padding-top:0; }
  .fp-hero-h1 { font-size:42px; letter-spacing:-1.5px; }
  .fp-calc-wrapper { position:static; }
  .fp-faq-wrap { grid-template-columns:1fr; }
  .fp-final { flex-direction:column; align-items:flex-start; }
  .fp-formula-foot { grid-template-columns:1fr; }
  .fp-nav-link.hide-sm { display:none; }
}
@media (max-width:720px) {
  .fp-output-list { grid-template-columns:1fr; }
  .fp-output-list li { grid-template-columns:110px 1fr; }
}
@media (max-width:560px) {
  .fp-hero-h1 { font-size:32px; }
  .fp-strip-title { font-size:24px; }
  .fp-trustbar-inner { flex-direction:column; align-items:flex-start; gap:10px; }
  .fp-trust-divider { display:none; }
}
`;

export default function FreePage() {
  const [lang, setLang] = useState<"es" | "en">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fliqLang");
      if (stored === "en" || stored === "es") return stored;
    }
    return "es";
  });

  const switchLang = (l: "es" | "en") => {
    setLang(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("fliqLang", l);
    }
  };

  const t = T[lang];

  return (
    <div className="free-page" style={CSS_VARS as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <Script
        id="json-ld-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Nav */}
      <nav className="fp-nav">
        <Link className="fp-brand" href="/" aria-label="FlipIQ home">
          <span className="fp-brand-mark">F</span>
          <span>
            Flip<span style={{ color: "var(--accent)" }}>IQ</span>
          </span>
        </Link>
        <div className="fp-nav-right">
          <Link className="fp-nav-link hide-sm" href="/">
            {t.navProduct}
          </Link>
          <Link className="fp-nav-link hide-sm" href="/pricing">
            {t.navPricing}
          </Link>
          <Link className="fp-nav-link" href="/blog">
            {t.navBlog}
          </Link>
          <div
            style={{
              display: "flex",
              gap: 1,
              padding: 2,
              border: "1px solid var(--line)",
              borderRadius: 8,
              background: "rgba(245,245,242,0.02)",
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: 1,
            }}
          >
            <button
              onClick={() => switchLang("es")}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: lang === "es" ? "var(--ink)" : "transparent",
                color: lang === "es" ? "var(--bg)" : "var(--dimmer)",
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: 1,
              }}
            >
              ES
            </button>
            <button
              onClick={() => switchLang("en")}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: lang === "en" ? "var(--ink)" : "transparent",
                color: lang === "en" ? "var(--bg)" : "var(--dimmer)",
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: 1,
              }}
            >
              EN
            </button>
          </div>
          <button className="fp-nav-cta" type="button">
            {t.navCta}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="fp-hero">
        <div className="fp-hero-copy">
          <div className="fp-eyebrow">
            <span className="fp-dot" />
            {t.heroEyebrow}
          </div>
          <h1 className="fp-hero-h1">
            {t.heroH1Pre}
            <em>{t.heroH1Em}</em>
          </h1>
          <p className="fp-hero-sub">{t.heroSub}</p>
          <ul className="fp-hero-bullets">
            <li>
              <span>
                <b>{t.bullet1Bold}</b>
                {t.bullet1Rest}
              </span>
            </li>
            <li>
              <span>
                <b>{t.bullet2Bold}</b>
                {t.bullet2Rest}
              </span>
            </li>
            <li>
              <span>
                <b>{t.bullet3Bold}</b>
                {t.bullet3Rest}
              </span>
            </li>
          </ul>
          <div className="fp-hero-meta">
            <span className="fp-pip">{t.metaChip1}</span>
            <span className="fp-pip">{t.metaChip2}</span>
            <span className="fp-pip">{t.metaChip3}</span>
          </div>
        </div>

        {/* Calculator */}
        <div className="fp-calc-wrapper">
          <FlipIQCalculator />
        </div>
      </header>

      {/* Trust bar */}
      <section className="fp-trustbar">
        <div className="fp-trustbar-inner">
          <div className="fp-trust-stat">
            <span className="fp-trust-num lime">12,847</span>
            <span className="fp-trust-label">{t.trustLabel1}</span>
          </div>
          <span className="fp-trust-divider" />
          <div className="fp-trust-stat">
            <span className="fp-trust-num">4</span>
            <span className="fp-trust-label">{t.trustLabel2}</span>
          </div>
          <span className="fp-trust-divider" />
          <div className="fp-trust-stat">
            <span className="fp-trust-num">&lt; 6s</span>
            <span className="fp-trust-label">{t.trustLabel3}</span>
          </div>
          <span className="fp-trust-divider" />
          <div className="fp-trust-stat">
            <span className="fp-trust-num">$0</span>
            <span className="fp-trust-label">{t.trustLabel4}</span>
          </div>
        </div>
      </section>

      {/* What you get back */}
      <section className="fp-strip">
        <div className="fp-strip-head">
          <div>
            <div className="fp-strip-eyebrow">{t.outputEyebrow}</div>
            <div className="fp-strip-title">
              {t.outputTitle}
              <em>{t.outputTitleEm}</em>
            </div>
          </div>
          <p className="fp-strip-sub">{t.outputSub}</p>
        </div>
        <ul className="fp-output-list">
          <li>
            <span className="k">{t.outputK1}</span>
            <span className="v">
              <b>BUY</b> &middot; WATCH &middot; PASS
            </span>
          </li>
          <li>
            <span className="k">{t.outputK2}</span>
            <span className="v">{t.outputV2}</span>
          </li>
          <li>
            <span className="k">{t.outputK3}</span>
            <span className="v">{t.outputV3}</span>
          </li>
          <li>
            <span className="k">{t.outputK4}</span>
            <span className="v">{t.outputV4}</span>
          </li>
          <li>
            <span className="k">{t.outputK5}</span>
            <span className="v">{t.outputV5}</span>
          </li>
          <li>
            <span className="k">{t.outputK6}</span>
            <span className="v">{t.outputV6}</span>
          </li>
        </ul>
      </section>

      {/* How max buy is calculated */}
      <section className="fp-strip">
        <div className="fp-strip-head">
          <div>
            <div className="fp-strip-eyebrow">{t.formulaEyebrow}</div>
            <div className="fp-strip-title">
              {t.formulaTitle}
              <em>{t.formulaTitleEm}</em>
            </div>
          </div>
          <p className="fp-strip-sub">{t.formulaSub}</p>
        </div>
        <div className="fp-formula">
          <div className="fp-formula-h">Formula</div>
          <div className="fp-formula-title">{t.formulaBoxTitle}</div>
          <div className="fp-formula-line">
            <span className="term">Median sold comp</span>
            <span className="op">&minus;</span>
            <span className="term">Marketplace fees</span>
            <span className="op">&minus;</span>
            <span className="term">Shipping</span>
            <span className="op">&minus;</span>
            <span className="term">Target margin</span>
            <span className="op">=</span>
            <span className="out">Max buy price</span>
          </div>
          <div className="fp-formula-foot">
            <div>
              <b>{t.formulaFoot1Title}</b>
              <span>{t.formulaFoot1Desc}</span>
            </div>
            <div>
              <b>{t.formulaFoot2Title}</b>
              <span>{t.formulaFoot2Desc}</span>
            </div>
            <div>
              <b>{t.formulaFoot3Title}</b>
              <span>{t.formulaFoot3Desc}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="fp-strip">
        <div className="fp-strip-head">
          <div>
            <div className="fp-strip-eyebrow">{t.faqEyebrow}</div>
            <div className="fp-strip-title">{t.faqTitle}</div>
          </div>
          <p className="fp-strip-sub">{t.faqSub}</p>
        </div>

        <div className="fp-faq-wrap">
          <details className="fp-faq" open>
            <summary>{t.faqQ1}</summary>
            <p>{t.faqA1}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ2}</summary>
            <p>{t.faqA2}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ3}</summary>
            <p>{t.faqA3}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ4}</summary>
            <p>{t.faqA4}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ5}</summary>
            <p>{t.faqA5}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ6}</summary>
            <p>{t.faqA6}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ7}</summary>
            <p>{t.faqA7}</p>
          </details>
          <details className="fp-faq">
            <summary>{t.faqQ8}</summary>
            <p>{t.faqA8}</p>
          </details>
        </div>

        {/* Final upsell */}
        <div className="fp-final">
          <div>
            <div className="fp-final-eyebrow">{t.finalEyebrow}</div>
            <h3>
              {t.finalTitle}{" "}
              <span style={{ color: "var(--accent)" }}>
                {t.finalTitleAccent}
              </span>
            </h3>
            <p>{t.finalSub}</p>
          </div>
          <div className="fp-final-actions">
            <button className="fp-btn-primary" type="button">
              {t.finalBtnPrimary}
            </button>
            <button className="fp-btn-ghost" type="button">
              {t.finalBtnGhost}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="fp-footer">
        <div>{t.footerCopy}</div>
        <div className="fp-footer-links">
          <Link href="/">{t.navProduct}</Link>
          <Link href="/plans">{t.navPricing}</Link>
          <span>{t.navBlog}</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </footer>
    </div>
  );
}
