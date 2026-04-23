"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ─── Design tokens (match iOS + existing theme) ─── */
const LIME = "#D4FF3A";
const LIME2 = "#E8FF7A";
const BG = "#0A0A0A";
const BG2 = "#0E0E0E";
const INK = "#F5F5F2";
const DIM = "rgba(245,245,242,0.55)";
const DIMMER = "rgba(245,245,242,0.35)";
const LINE = "rgba(245,245,242,0.08)";
const LINE2 = "rgba(245,245,242,0.14)";
const PASS = "#FF6B5A";
const WATCH = "#FFB547";
const DISPLAY = "'Inter Tight', system-ui, -apple-system, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/* ─── i18n strings ─── */
const T = {
  es: {
    how: "Como funciona",
    results: "Resultados",
    pricing: "Precios",
    signin: "Ingresar",
    startFree: "Empezar gratis",
    eyebrow: "Analisis en tiempo real · 187K productos",
    h1a: "Deja de",
    h1strike: "comprar a ciegas",
    h1b: "Empieza a flipear con data.",
    sub1: "Escaneas un producto,",
    sub2: "13 motores analizan",
    sub3: "eBay, Amazon y mas en segundos, y FlipIQ te dice",
    sub4: "cuanto pagar maximo, donde venderlo y cuanto vas a ganar",
    scanFree: "Escanear gratis",
    seeDemo: "Ver demo",
    stat1: "flippers activos",
    stat2: "en profits trackeados",
    stat3: "accuracy en precio",
    sectionHow: "COMO FUNCIONA",
    sectionHowH2a: "De barcode a",
    sectionHowH2b: "veredicto",
    sectionHowAside:
      "Tres pasos. Menos de 8 segundos. Data real de eBay y Amazon, no estimaciones.",
    step1h: "Escanea el UPC",
    step1p:
      "Apunta tu camara al codigo de barras. Tambien podes pegar un ASIN, SKU o pegarlo manual.",
    step2h: "13 motores corren en paralelo",
    step2p:
      "Pricing, profit, riesgo, velocidad de venta, competencia, tendencia, confianza. Todo en vivo.",
    step3h: "BUY / WATCH / PASS",
    step3p:
      "Veredicto binario con el mejor canal, precio maximo de compra y profit esperado por unidad.",
    sectionCases: "FLIPS REALES",
    casesH2a: "Lo que",
    casesH2b: "encontraron",
    casesAside:
      "Tres flips recientes de usuarios Pro. Numeros reales, no demos.",
    paid: "Pago",
    sold: "Vendio",
    profit: "Ganancia",
    days: "Dias",
    sectionPricing: "PRECIOS",
    pricingH2a: "Paga por volumen, no por",
    pricingH2b: "fe",
    pricingAside:
      "Cancelas cuando quieras. Si no te rinde, te devolvemos los primeros 30 dias.",
    freeTier: "Free",
    freeTag: "Para probar el agua antes de clavarte.",
    freeF1: "10 analisis por mes",
    freeF2: "Veredicto BUY / WATCH / PASS",
    freeF3: "eBay + Amazon sold comps",
    freeF4: "Historial de 7 dias",
    freeCta: "Empezar gratis",
    proTier: "Pro",
    proRibbon: "MAS ELEGIDO",
    proTag: "Para flippers que viven de esto.",
    proF1: "Analisis ilimitados",
    proF2: "Los 13 motores + AI rationale",
    proF3: "FB Marketplace + MercadoLibre",
    proF4: "Alertas de precio + watchlist",
    proF5: "Export CSV + historial ilimitado",
    proCta: "Probar 14 dias",
    teamTier: "Team",
    teamTag: "Para stores con scouts en la calle.",
    teamF1: "Todo lo de Pro, x 5 seats",
    teamF2: "Dashboard compartido en vivo",
    teamF3: "API + webhooks",
    teamF4: "Reglas de compra por scout",
    teamF5: "Priority support + onboarding 1:1",
    teamCta: "Contactar ventas",
    finalH2a: "El proximo producto barato",
    finalH2b: "que te cambia la semana.",
    finalP: "Arranca gratis. Escanea los primeros 10 sin tarjeta.",
    watchLive: "Ver un flip en vivo",
    trust: "SIN TARJETA · SIN CONTRATO · CANCELAS EN UN CLICK",
    perMonth: "/ mes",
    analyzing: "analizando",
    complete: "listo",
    enginesRunning: "motores corriendo",
    currentStage: "stage actual",
    product: "PRODUCTO",
    company: "EMPRESA",
    legal: "LEGAL",
    howLink: "Como funciona",
    realCases: "Casos reales",
    changelog: "Cambios recientes",
    about: "Sobre nosotros",
    blog: "Blog",
    contact: "Contacto",
    terms: "Terminos",
    privacy: "Privacidad",
    cookies: "Cookies",
    productsAnalyzed: "productos analizados",
  },
  en: {
    how: "How it works",
    results: "Results",
    pricing: "Pricing",
    signin: "Sign in",
    startFree: "Start free",
    eyebrow: "Real-time analysis · 187K products",
    h1a: "Stop",
    h1strike: "buying blind",
    h1b: "Start flipping with data.",
    sub1: "Scan a product,",
    sub2: "13 engines analyze",
    sub3: "eBay, Amazon, and more in seconds, and FlipIQ tells you",
    sub4: "max buy price, where to sell, and how much you'll make",
    scanFree: "Scan free",
    seeDemo: "See demo",
    stat1: "active flippers",
    stat2: "in tracked profits",
    stat3: "price accuracy",
    sectionHow: "HOW IT WORKS",
    sectionHowH2a: "Barcode to",
    sectionHowH2b: "verdict",
    sectionHowAside:
      "Three steps. Under 8 seconds. Real eBay and Amazon data, no estimates.",
    step1h: "Scan the UPC",
    step1p:
      "Point your camera at the barcode. You can also paste an ASIN, SKU, or enter manually.",
    step2h: "13 engines run in parallel",
    step2p:
      "Pricing, profit, risk, sell velocity, competition, trend, confidence. All live.",
    step3h: "BUY / WATCH / PASS",
    step3p:
      "Binary verdict with best channel, max buy price, and expected profit per unit.",
    sectionCases: "REAL FLIPS",
    casesH2a: "What they",
    casesH2b: "found",
    casesAside: "Three recent flips from Pro users. Real numbers, not demos.",
    paid: "Paid",
    sold: "Sold",
    profit: "Profit",
    days: "Days",
    sectionPricing: "PRICING",
    pricingH2a: "Pay for volume, not",
    pricingH2b: "faith",
    pricingAside: "Cancel anytime. 30-day money-back guarantee.",
    freeTier: "Free",
    freeTag: "Test the waters before you dive in.",
    freeF1: "10 analyses per month",
    freeF2: "BUY / WATCH / PASS verdict",
    freeF3: "eBay + Amazon sold comps",
    freeF4: "7-day history",
    freeCta: "Start free",
    proTier: "Pro",
    proRibbon: "MOST PICKED",
    proTag: "For flippers who live on this.",
    proF1: "Unlimited analyses",
    proF2: "All 13 engines + AI rationale",
    proF3: "FB Marketplace + MercadoLibre",
    proF4: "Price alerts + watchlist",
    proF5: "CSV export + unlimited history",
    proCta: "Try 14 days",
    teamTier: "Team",
    teamTag: "For stores with scouts on the ground.",
    teamF1: "Everything in Pro, x 5 seats",
    teamF2: "Live shared dashboard",
    teamF3: "API + webhooks",
    teamF4: "Per-scout buy rules",
    teamF5: "Priority support + 1:1 onboarding",
    teamCta: "Contact sales",
    finalH2a: "The next cheap find",
    finalH2b: "that changes your week.",
    finalP: "Start free. Scan your first 10 with no card.",
    watchLive: "Watch a live flip",
    trust: "NO CARD · NO CONTRACT · CANCEL IN ONE CLICK",
    perMonth: "/ mo",
    analyzing: "analyzing",
    complete: "complete",
    enginesRunning: "engines running",
    currentStage: "current stage",
    product: "PRODUCT",
    company: "COMPANY",
    legal: "LEGAL",
    howLink: "How it works",
    realCases: "Real cases",
    changelog: "Changelog",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    terms: "Terms",
    privacy: "Privacy",
    cookies: "Cookies",
    productsAnalyzed: "products analyzed",
  },
} as const;

type Lang = keyof typeof T;

/* ─── Ticker items ─── */
const TICKER_ITEMS = [
  { p: "Apple AirPods Pro 2", v: "BUY", n: "+$68.60" },
  { p: "Nintendo Switch OLED CIB", v: "BUY", n: "+$128.10" },
  { p: "Dyson V8 Absolute (used)", v: "PASS", n: "-$4.20" },
  { p: "Sony WH-1000XM4", v: "BUY", n: "+$172.40" },
  { p: "Instant Pot Duo 6qt", v: "WATCH", n: "+$12.50" },
  { p: "LEGO UCS Falcon 75192", v: "BUY", n: "+$612.30" },
  { p: "Keurig K-Mini", v: "PASS", n: "-$2.80" },
  { p: "Oculus Quest 2 128GB", v: "BUY", n: "+$48.40" },
  { p: "Vitamix 5200 blender", v: "BUY", n: "+$94.80" },
  { p: "Xbox Elite Series 2", v: "BUY", n: "+$62.10" },
];

/* ─── Case studies ─── */
const CASES = [
  {
    badge: "FBA",
    catEs: "AUDIO · THRIFT STORE",
    catEn: "AUDIO · THRIFT STORE",
    name: "Sony WH-1000XM4 Wireless Headphones",
    costIn: "$35",
    costOut: "$248",
    roi: "+490%",
    profit: "$172.40",
    days: "6",
  },
  {
    badge: "eBay",
    catEs: "GAMING · GARAGE SALE",
    catEn: "GAMING · GARAGE SALE",
    name: "Nintendo Switch OLED (CIB)",
    costIn: "$120",
    costOut: "$289",
    roi: "+108%",
    profit: "$128.10",
    days: "4",
  },
  {
    badge: "MELI",
    catEs: "COLECCIONABLE · ESTATE",
    catEn: "COLLECTIBLE · ESTATE",
    name: "LEGO Star Wars UCS Millennium Falcon 75192",
    costIn: "$420",
    costOut: "$1,180",
    roi: "+181%",
    profit: "$612.30",
    days: "11",
  },
];

/* ─── Pipeline engines ─── */
const ENGINES = [
  { id: "ident", label: "identify.barcode", val: "AirPods Pro 2" },
  { id: "cat", label: "category.classify", val: "audio_accessory" },
  { id: "fetch", label: "marketplace.pull", val: "187 comps" },
  { id: "match", label: "title.enrich(ai)", val: "164/164" },
  { id: "clean", label: "comp.cleaner", val: "128 kept" },
  { id: "price", label: "pricing.median", val: "$168.50" },
  { id: "profit", label: "profit.net", val: "+$68.60" },
  { id: "maxb", label: "max_buy", val: "$148.20" },
  { id: "vel", label: "velocity", val: "1.4/d" },
  { id: "risk", label: "risk", val: "72/100" },
  { id: "conf", label: "confidence", val: "72/100" },
];

/* ─── Hero metaball animation stages ─── */
const HERO_STAGES = [
  {
    at: 0,
    stage: "starting",
    prog: 0,
    ebay: 0,
    amz: 0,
    median: 0,
    eng: 0,
    turb: 0.5,
  },
  {
    at: 1.2,
    stage: "identify",
    prog: 12,
    ebay: 0,
    amz: 0,
    median: 0,
    eng: 0,
    turb: 0.6,
  },
  {
    at: 2.4,
    stage: "fetch",
    prog: 38,
    ebay: 87,
    amz: 8,
    median: 0,
    eng: 0,
    turb: 0.9,
  },
  {
    at: 3.8,
    stage: "fetch",
    prog: 52,
    ebay: 164,
    amz: 23,
    median: 168.5,
    eng: 0,
    turb: 0.9,
  },
  {
    at: 5.2,
    stage: "matching",
    prog: 68,
    ebay: 164,
    amz: 23,
    median: 168.5,
    eng: 3,
    turb: 1.1,
  },
  {
    at: 6.6,
    stage: "scoring",
    prog: 86,
    ebay: 164,
    amz: 23,
    median: 168.5,
    eng: 11,
    turb: 1.5,
  },
  {
    at: 7.8,
    stage: "ai",
    prog: 95,
    ebay: 164,
    amz: 23,
    median: 168.5,
    eng: 13,
    turb: 0.8,
  },
  {
    at: 9.0,
    stage: "done",
    prog: 100,
    ebay: 164,
    amz: 23,
    median: 168.5,
    eng: 13,
    turb: 0.5,
  },
];
const CYCLE = 10.5;

/* ─── Blob seeds for SVG metaballs ─── */
const BLOBS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return {
    cx: 270 + Math.cos(a) * 100,
    cy: 270 + Math.sin(a) * 100,
    orbitR: 28 + ((i * 37 + 11) % 50),
    speed: 0.00025 + ((i * 23 + 7) % 40) * 0.0000125,
    phase: (((i * 61 + 3) % 100) * (Math.PI * 2)) / 100,
    baseSize: 36 + ((i * 19 + 5) % 22),
  };
});

/* ─── Barcode bar heights ─── */
const BARCODE_HEIGHTS = [
  32, 48, 18, 38, 56, 22, 40, 28, 50, 30, 42, 36, 24, 46, 32, 52, 20, 38, 44,
  28,
];

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function Landing() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "es";
    const saved = localStorage.getItem("fliqLang");
    return saved === "en" || saved === "es" ? saved : "es";
  });
  const [scrolled, setScrolled] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const t = T[lang];

  // Pipeline animation state
  const [activeEngines, setActiveEngines] = useState<Set<string>>(new Set());
  const pipelineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hero orb refs
  const orbSvgRef = useRef<SVGGElement>(null);
  const heroStateRef = useRef({
    displayProg: 0,
    turb: 0.5,
    ebayDisp: 0,
    amzDisp: 0,
  });
  const [heroDisplay, setHeroDisplay] = useState({
    prog: 0,
    stage: "starting",
    ebay: 0,
    amz: 0,
    median: "0.00",
    eng: "0/13",
  });
  const startTimeRef = useRef(0);

  // Nav scroll
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
      setShowSticky(window.scrollY > 600);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Pipeline animation loop
  useEffect(() => {
    function run() {
      setActiveEngines(new Set());
      ENGINES.forEach((e, i) => {
        setTimeout(
          () => {
            setActiveEngines((prev) => new Set(prev).add(e.id));
          },
          200 + i * 420
        );
      });
      pipelineTimerRef.current = setTimeout(
        run,
        200 + (ENGINES.length + 3) * 420
      );
    }
    run();
    return () => {
      if (pipelineTimerRef.current) clearTimeout(pipelineTimerRef.current);
    };
  }, []);

  // Hero metaball animation
  const sampleHero = useCallback((elapsed: number) => {
    for (let i = HERO_STAGES.length - 1; i >= 0; i--) {
      if (elapsed >= HERO_STAGES[i].at) {
        const cur = HERO_STAGES[i];
        const next = HERO_STAGES[i + 1];
        if (!next) return cur;
        const frac = (elapsed - cur.at) / (next.at - cur.at);
        const interp = (a: number, b: number) => a + (b - a) * frac;
        return {
          stage: frac < 0.5 ? cur.stage : next.stage,
          prog: interp(cur.prog, next.prog),
          ebay: interp(cur.ebay, next.ebay),
          amz: interp(cur.amz, next.amz),
          median:
            cur.median === next.median
              ? cur.median
              : interp(cur.median, next.median),
          eng: Math.round(interp(cur.eng, next.eng)),
          turb: interp(cur.turb, next.turb),
        };
      }
    }
    return HERO_STAGES[0];
  }, []);

  useEffect(() => {
    startTimeRef.current = performance.now();
    let raf: number;

    function loop(now: number) {
      const elapsed = ((now - startTimeRef.current) / 1000) % CYCLE;
      const s = sampleHero(elapsed);

      const hs = heroStateRef.current;
      hs.displayProg += (s.prog - hs.displayProg) * 0.1;
      hs.turb += (s.turb - hs.turb) * 0.05;
      hs.ebayDisp += (s.ebay - hs.ebayDisp) * 0.15;
      hs.amzDisp += (s.amz - hs.amzDisp) * 0.15;

      const p = hs.displayProg / 100;
      const turb = hs.turb;

      // Update SVG blobs
      const g = orbSvgRef.current;
      if (g) {
        const circles = g.querySelectorAll("circle");
        // Central blob
        if (circles[0]) {
          const centralR = 28 + p * 155;
          const wobble = Math.sin(now * 0.002) * 5 * turb;
          circles[0].setAttribute(
            "cx",
            String(270 + Math.sin(now * 0.001) * 4)
          );
          circles[0].setAttribute(
            "cy",
            String(270 - p * 20 + Math.cos(now * 0.0015) * 4)
          );
          circles[0].setAttribute("r", String(centralR + wobble));
        }
        BLOBS.forEach((b, i) => {
          const c = circles[i + 1];
          if (!c) return;
          const tt = now * b.speed;
          const pull = 1 - p * 0.6;
          const cx =
            270 +
            (b.cx - 270) * pull +
            Math.cos(tt + b.phase) * b.orbitR * turb * 0.7;
          const cy =
            270 +
            (b.cy - 270) * pull +
            Math.sin(tt * 1.3 + b.phase) * b.orbitR * turb * 0.7;
          const r =
            b.baseSize *
            (0.7 + Math.sin(tt * 2 + b.phase) * 0.3) *
            (0.6 + p * 0.55);
          c.setAttribute("cx", String(cx));
          c.setAttribute("cy", String(cy));
          c.setAttribute("r", String(Math.max(8, r)));
        });
      }

      setHeroDisplay({
        prog: Math.round(hs.displayProg),
        stage: s.stage,
        ebay: Math.round(hs.ebayDisp),
        amz: Math.round(hs.amzDisp),
        median: s.median.toFixed(2),
        eng: s.eng + "/13",
      });

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sampleHero]);

  const switchLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("fliqLang", l);
  };

  const verdictColor = (v: string) =>
    v === "BUY" ? LIME : v === "PASS" ? PASS : WATCH;

  return (
    <div
      style={{
        background: BG,
        color: INK,
        fontFamily: DISPLAY,
        WebkitFontSmoothing: "antialiased",
        lineHeight: 1.5,
      }}
    >
      {/* ═══ NAV ═══ */}
      <nav
        className="ln-nav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 40px",
          borderBottom: scrolled
            ? `1px solid ${LINE}`
            : "1px solid transparent",
          background: "rgba(10,10,10,0.6)",
          backdropFilter: "blur(14px)",
          transition: "border-color 0.2s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: -0.5,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: LIME,
              boxShadow: `0 0 12px ${LIME}`,
              display: "inline-block",
            }}
          />
          Flip
          <em
            style={{
              color: LIME,
              fontStyle: "normal",
              fontWeight: 500,
              marginLeft: 2,
            }}
          >
            IQ
          </em>
        </div>

        <div
          className="ln-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: DIM,
          }}
        >
          <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>
            {t.how}
          </a>
          <a href="#cases" style={{ color: "inherit", textDecoration: "none" }}>
            {t.results}
          </a>
          <a
            href="#pricing"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {t.pricing}
          </a>
        </div>

        <div
          className="ln-nav-actions"
          style={{ display: "flex", alignItems: "center", gap: 14 }}
        >
          {/* Lang toggle */}
          <div
            style={{
              display: "flex",
              gap: 1,
              padding: 2,
              border: `1px solid ${LINE}`,
              borderRadius: 8,
              background: "rgba(245,245,242,0.02)",
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 1,
            }}
          >
            {(["es", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                style={{
                  padding: "5px 9px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  color: lang === l ? BG : DIMMER,
                  background: lang === l ? INK : "transparent",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              border: `1px solid ${LINE2}`,
              color: INK,
              textDecoration: "none",
            }}
          >
            {t.signin}
          </Link>

          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              background: LIME,
              color: BG,
              textDecoration: "none",
              boxShadow: `0 0 0 1px ${LIME}, 0 8px 28px rgba(212,255,58,0.28)`,
            }}
          >
            <span>{t.startFree}</span>
            <span style={{ fontWeight: 700 }}>→</span>
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section
        className="ln-hero"
        style={{
          position: "relative",
          padding: "160px 40px 100px",
          minHeight: 760,
          overflow: "hidden",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.4,
            backgroundImage:
              "linear-gradient(rgba(245,245,242,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,245,242,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(circle at 30% 50%, #000 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(circle at 30% 50%, #000 0%, transparent 75%)",
          }}
        />

        <div
          className="ln-hero-grid"
          style={{
            position: "relative",
            maxWidth: 1360,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div className="ln-hero-left">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 14px",
                border: `1px solid ${LINE}`,
                borderRadius: 999,
                marginBottom: 32,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: LIME,
                background: "rgba(212,255,58,0.03)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: LIME,
                  animation: "landing-pulse 2s infinite",
                }}
              />
              {t.eyebrow}
            </div>

            <h1
              className="ln-h1"
              style={{
                margin: "0 0 24px",
                fontWeight: 900,
                fontSize: "clamp(48px, 7vw, 92px)",
                lineHeight: 0.94,
                letterSpacing: -3.5,
              }}
            >
              {t.h1a}{" "}
              <span
                style={{ position: "relative", color: DIM, fontWeight: 500 }}
              >
                {t.h1strike}
                <span
                  style={{
                    position: "absolute",
                    left: -4,
                    right: -4,
                    top: "52%",
                    height: 3,
                    background: PASS,
                    transform: "skew(-8deg)",
                  }}
                />
              </span>
              .<br />
              <em
                style={{
                  fontStyle: "normal",
                  color: LIME,
                  fontWeight: 500,
                  letterSpacing: -2,
                }}
              >
                {t.h1b}
              </em>
            </h1>

            <p
              className="ln-sub"
              style={{
                maxWidth: 520,
                fontSize: 19,
                lineHeight: 1.55,
                color: DIM,
                margin: "0 0 40px",
              }}
            >
              {t.sub1} <b style={{ color: INK, fontWeight: 600 }}>{t.sub2}</b>{" "}
              {t.sub3} <b style={{ color: INK, fontWeight: 600 }}>{t.sub4}</b>.
            </p>

            <div
              className="ln-hero-actions"
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                marginBottom: 48,
              }}
            >
              <Link
                href="/free"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  background: LIME,
                  color: BG,
                  textDecoration: "none",
                  boxShadow: `0 0 0 1px ${LIME}, 0 8px 28px rgba(212,255,58,0.28)`,
                }}
              >
                <span>{t.scanFree}</span>
                <span style={{ fontWeight: 700 }}>→</span>
              </Link>
              <a
                href="#how"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  border: `1px solid ${LINE2}`,
                  color: INK,
                  textDecoration: "none",
                }}
              >
                {t.seeDemo}
              </a>
            </div>

            <div
              className="ln-hero-stats"
              style={{
                display: "flex",
                gap: 48,
                paddingTop: 32,
                borderTop: `1px solid ${LINE}`,
              }}
            >
              {[
                { n: "12,847", l: t.stat1 },
                { n: "$3.2M", l: t.stat2 },
                { n: "94%", l: t.stat3 },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    className="n"
                    style={{
                      fontWeight: 800,
                      fontSize: 32,
                      letterSpacing: -1.2,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.n}
                  </div>
                  <span
                    className="l"
                    style={{
                      display: "block",
                      marginTop: 4,
                      fontFamily: MONO,
                      fontSize: 10,
                      color: DIM,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Orb */}
          <div
            className="ln-hero-right"
            style={{ position: "relative", height: 560 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Halo */}
              <div
                style={{
                  position: "absolute",
                  inset: -60,
                  borderRadius: "50%",
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(212,255,58,0.07) 0%, transparent 55%)",
                  zIndex: -1,
                }}
              />

              {/* Badges */}
              <div
                className="ln-orb-badge ln-badge-tl"
                style={{
                  position: "absolute",
                  top: 10,
                  left: -10,
                  padding: "10px 14px",
                  border: `1px solid ${LINE2}`,
                  borderRadius: 12,
                  background: "rgba(14,14,14,0.7)",
                  backdropFilter: "blur(8px)",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: DIM,
                  zIndex: 4,
                }}
              >
                <b
                  style={{
                    display: "block",
                    color: LIME,
                    fontSize: 14,
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    marginBottom: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {heroDisplay.ebay} / {heroDisplay.amz}
                </b>
                ebay · amazon comps
              </div>
              <div
                className="ln-orb-badge ln-badge-tr"
                style={{
                  position: "absolute",
                  top: 50,
                  right: -10,
                  padding: "10px 14px",
                  border: `1px solid ${LINE2}`,
                  borderRadius: 12,
                  background: "rgba(14,14,14,0.7)",
                  backdropFilter: "blur(8px)",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: DIM,
                  zIndex: 4,
                }}
              >
                <b
                  style={{
                    display: "block",
                    color: LIME,
                    fontSize: 14,
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    marginBottom: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${heroDisplay.median}
                </b>
                median sell price
              </div>
              <div
                className="ln-orb-badge ln-badge-br"
                style={{
                  position: "absolute",
                  bottom: 30,
                  right: 20,
                  padding: "10px 14px",
                  border: `1px solid ${LINE2}`,
                  borderRadius: 12,
                  background: "rgba(14,14,14,0.7)",
                  backdropFilter: "blur(8px)",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: DIM,
                  zIndex: 4,
                }}
              >
                <b
                  style={{
                    display: "block",
                    color: LIME,
                    fontSize: 14,
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    marginBottom: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {heroDisplay.eng}
                </b>
                {t.enginesRunning}
              </div>
              <div
                className="ln-orb-badge ln-badge-bl"
                style={{
                  position: "absolute",
                  bottom: 60,
                  left: -20,
                  padding: "10px 14px",
                  border: `1px solid ${LINE2}`,
                  borderRadius: 12,
                  background: "rgba(14,14,14,0.7)",
                  backdropFilter: "blur(8px)",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: DIM,
                  zIndex: 4,
                }}
              >
                <b
                  style={{
                    display: "block",
                    color: LIME,
                    fontSize: 14,
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    marginBottom: 2,
                  }}
                >
                  {heroDisplay.stage}
                </b>
                {t.currentStage}
              </div>

              {/* Orb sphere */}
              <div
                className="ln-orb-wrap"
                style={{
                  position: "relative",
                  width: 540,
                  height: 540,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid rgba(212,255,58,0.15)",
                  background:
                    "radial-gradient(circle at 50% 40%, #0D1206 0%, #060606 80%)",
                  boxShadow:
                    "inset 0 0 80px rgba(212,255,58,0.08), 0 0 120px rgba(212,255,58,0.06), 0 0 0 1px rgba(212,255,58,0.04)",
                }}
              >
                <svg
                  viewBox="0 0 540 540"
                  preserveAspectRatio="none"
                  style={{ display: "block", width: "100%", height: "100%" }}
                >
                  <defs>
                    <filter id="hero-goo">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                      <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11" />
                    </filter>
                    <clipPath id="hero-clip">
                      <circle cx="270" cy="270" r="268" />
                    </clipPath>
                    <radialGradient
                      id="hero-blobgrad"
                      cx="50%"
                      cy="40%"
                      r="70%"
                    >
                      <stop offset="0%" stopColor={LIME2} />
                      <stop offset="55%" stopColor={LIME} />
                      <stop offset="100%" stopColor="#7AA018" />
                    </radialGradient>
                  </defs>
                  <g clipPath="url(#hero-clip)" filter="url(#hero-goo)">
                    <g ref={orbSvgRef} fill="url(#hero-blobgrad)">
                      <circle cx="270" cy="270" r="28" />
                      {BLOBS.map((_, i) => (
                        <circle key={i} cx="270" cy="270" r="8" />
                      ))}
                    </g>
                  </g>
                </svg>

                {/* Center readout */}
                <div
                  className="ln-orb-center"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mixBlendMode: "difference",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                >
                  <div
                    className="n"
                    style={{
                      fontWeight: 900,
                      fontSize: 128,
                      letterSpacing: -6,
                      color: INK,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {heroDisplay.prog}
                    <span
                      className="u"
                      style={{
                        fontSize: 48,
                        letterSpacing: -2,
                        verticalAlign: "super",
                        marginLeft: 4,
                      }}
                    >
                      %
                    </span>
                  </div>
                  <div
                    className="lbl"
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      color: INK,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      marginTop: 18,
                      opacity: 0.9,
                    }}
                  >
                    {heroDisplay.stage === "done" ? t.complete : t.analyzing}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "18px 0",
          borderTop: `1px solid ${LINE}`,
          borderBottom: `1px solid ${LINE}`,
          background: BG2,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: 1,
          color: DIM,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 48,
            whiteSpace: "nowrap",
            animation: "landing-ticker 40s linear infinite",
            willChange: "transform",
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i}>
              <b>[SCAN]</b>&nbsp;&nbsp;
              <em style={{ color: INK, fontStyle: "normal" }}>{item.p}</em>
              &nbsp;&nbsp;
              <b style={{ color: verdictColor(item.v), fontWeight: 500 }}>
                {item.v}
              </b>
              &nbsp;&nbsp;{item.n}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        id="how"
        style={{
          padding: "140px 40px 120px",
          maxWidth: 1360,
          margin: "0 auto",
        }}
      >
        <div
          className="ln-sec-head"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 72,
            gap: 40,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: LIME,
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1,
                  background: LIME,
                  display: "inline-block",
                }}
              />
              {t.sectionHow}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(40px, 5vw, 64px)",
                fontWeight: 800,
                letterSpacing: -2.5,
                lineHeight: 1,
                maxWidth: 720,
              }}
            >
              {t.sectionHowH2a}{" "}
              <em style={{ fontStyle: "normal", color: LIME, fontWeight: 500 }}>
                {t.sectionHowH2b}
              </em>
              .
            </h2>
          </div>
          <div
            className="ln-sec-aside"
            style={{ maxWidth: 320, color: DIM, fontSize: 15 }}
          >
            {t.sectionHowAside}
          </div>
        </div>

        <div
          className="ln-steps"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: LINE,
            border: `1px solid ${LINE}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Step 1 — Scan */}
          <div
            className="ln-step"
            style={{
              background: BG,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              minHeight: 560,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: 2,
                color: LIME,
                marginBottom: 20,
              }}
            >
              01 / SCAN
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: -0.8,
              }}
            >
              {t.step1h}
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                color: DIM,
                fontSize: 14,
                lineHeight: 1.55,
                maxWidth: 280,
              }}
            >
              {t.step1p}
            </p>
            <div
              className="ln-step-vis"
              style={{
                flex: 1,
                border: `1px solid ${LINE}`,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                background: BG2,
              }}
            >
              {/* Scan frame */}
              <div
                style={{
                  position: "absolute",
                  inset: 20,
                  border: "1px solid rgba(212,255,58,0.25)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Corners */}
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: -1,
                    width: 20,
                    height: 20,
                    borderTop: `2px solid ${LIME}`,
                    borderLeft: `2px solid ${LIME}`,
                    borderRadius: 3,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    right: -1,
                    width: 20,
                    height: 20,
                    borderTop: `2px solid ${LIME}`,
                    borderRight: `2px solid ${LIME}`,
                    borderRadius: 3,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: -1,
                    width: 20,
                    height: 20,
                    borderBottom: `2px solid ${LIME}`,
                    borderLeft: `2px solid ${LIME}`,
                    borderRadius: 3,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 20,
                    height: 20,
                    borderBottom: `2px solid ${LIME}`,
                    borderRight: `2px solid ${LIME}`,
                    borderRadius: 3,
                  }}
                />
                {/* Barcode bars */}
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-end",
                    height: 80,
                  }}
                >
                  {BARCODE_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        height: h,
                        background: INK,
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>
                {/* Scan line */}
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    top: "50%",
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${LIME}, transparent)`,
                    boxShadow: `0 0 12px ${LIME}`,
                    animation: "landing-scanMove 2.4s ease-in-out infinite",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: LIME,
                }}
              >
                4547777 061413
              </div>
            </div>
          </div>

          {/* Step 2 — Analyze */}
          <div
            className="ln-step"
            style={{
              background: BG,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              minHeight: 560,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: 2,
                color: LIME,
                marginBottom: 20,
              }}
            >
              02 / ANALYZE
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: -0.8,
              }}
            >
              {t.step2h}
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                color: DIM,
                fontSize: 14,
                lineHeight: 1.55,
                maxWidth: 280,
              }}
            >
              {t.step2p}
            </p>
            <div
              className="ln-step-vis"
              style={{
                flex: 1,
                border: `1px solid ${LINE}`,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                background: BG2,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 20,
                  fontFamily: MONO,
                  fontSize: 11,
                  lineHeight: 1.9,
                  color: DIM,
                  overflow: "hidden",
                }}
              >
                {ENGINES.map((e, i) => {
                  const isOn = activeEngines.has(e.id);
                  return (
                    <div
                      key={e.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        opacity: isOn ? 1 : 0,
                        transform: isOn ? "translateY(0)" : "translateY(4px)",
                        transition: "all 0.2s",
                      }}
                    >
                      <span style={{ color: DIMMER, fontSize: 9, width: 52 }}>
                        00:0{i + 1}
                      </span>
                      <span style={{ color: LIME }}>▸</span>
                      <span
                        style={{
                          flex: 1,
                          letterSpacing: 0.5,
                          color: isOn ? INK : undefined,
                        }}
                      >
                        {e.label}
                      </span>
                      <span style={{ color: LIME, fontWeight: 600 }}>
                        {e.val}
                      </span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: DIMMER, fontSize: 9, width: 52 }}>
                    00:08
                  </span>
                  <span style={{ color: LIME }}>▸</span>
                  <span style={{ flex: 1, letterSpacing: 0.5 }}>
                    pipeline.done
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 12,
                        background: LIME,
                        animation: "landing-blink 1s steps(2) infinite",
                        verticalAlign: -2,
                        marginLeft: 3,
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 — Verdict */}
          <div
            className="ln-step"
            style={{
              background: BG,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              minHeight: 560,
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: 2,
                color: LIME,
                marginBottom: 20,
              }}
            >
              03 / VERDICT
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: -0.8,
              }}
            >
              {t.step3h}
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                color: DIM,
                fontSize: 14,
                lineHeight: 1.55,
                maxWidth: 280,
              }}
            >
              {t.step3p}
            </p>
            <div
              className="ln-step-vis"
              style={{
                flex: 1,
                border: `1px solid ${LINE}`,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                background: BG2,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {/* Verdict card header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    paddingBottom: 10,
                    borderBottom: `1px solid ${LINE}`,
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: -0.3,
                      maxWidth: 190,
                      lineHeight: 1.35,
                    }}
                  >
                    Apple AirPods Pro 2 (Lightning)
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: -0.5,
                    }}
                  >
                    $99.80
                  </div>
                </div>
                {/* Verdict */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(212,255,58,0.1)",
                    border: "1px solid rgba(212,255,58,0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 2,
                        color: DIM,
                        textTransform: "uppercase",
                      }}
                    >
                      {lang === "es" ? "VEREDICTO" : "VERDICT"}
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 22,
                        letterSpacing: -0.8,
                        color: LIME,
                      }}
                    >
                      BUY{" "}
                      <span
                        style={{
                          fontSize: 12,
                          color: DIM,
                          fontWeight: 500,
                          letterSpacing: 0,
                          marginLeft: 4,
                        }}
                      >
                        · 85.8% ROI
                      </span>
                    </div>
                  </div>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle
                      cx="22"
                      cy="22"
                      r="20"
                      stroke="rgba(212,255,58,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 22 L20 28 L30 16"
                      stroke={LIME}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                {/* Metrics */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  {[
                    { k: "Max buy", v: "$148" },
                    { k: "Net profit", v: "+$68.60", c: LIME },
                    { k: "Velocity", v: "1.4/d" },
                  ].map((m) => (
                    <div
                      key={m.k}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "rgba(245,245,242,0.02)",
                        border: `1px solid ${LINE}`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 8,
                          letterSpacing: 1.5,
                          color: DIM,
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {m.k}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          letterSpacing: -0.3,
                          fontVariantNumeric: "tabular-nums",
                          color: m.c || INK,
                        }}
                      >
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Channels */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontFamily: MONO,
                    fontSize: 10,
                  }}
                >
                  {[
                    { name: "Amazon FBA", net: "+$86.90 net", best: true },
                    { name: "eBay", net: "+$58.40 net", best: false },
                    { name: "FB Marketplace", net: "+$42.10 net", best: false },
                  ].map((ch) => (
                    <div
                      key={ch.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: ch.best
                          ? "rgba(212,255,58,0.08)"
                          : "rgba(245,245,242,0.02)",
                        borderLeft: ch.best ? `2px solid ${LIME}` : "none",
                        paddingLeft: ch.best ? 8 : 10,
                      }}
                    >
                      <span
                        style={{
                          color: ch.best ? INK : DIM,
                          letterSpacing: 0.5,
                        }}
                      >
                        {ch.name}
                      </span>
                      <span
                        style={{
                          color: LIME,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {ch.net}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CASES ═══ */}
      <section
        id="cases"
        style={{
          padding: "120px 40px",
          background: `linear-gradient(180deg, ${BG} 0%, #090909 100%)`,
          borderTop: `1px solid ${LINE}`,
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div
            className="ln-sec-head"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 72,
              gap: 40,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: LIME,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 1,
                    background: LIME,
                    display: "inline-block",
                  }}
                />
                {t.sectionCases}
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(40px, 5vw, 64px)",
                  fontWeight: 800,
                  letterSpacing: -2.5,
                  lineHeight: 1,
                }}
              >
                {t.casesH2a}{" "}
                <em
                  style={{ fontStyle: "normal", color: LIME, fontWeight: 500 }}
                >
                  {t.casesH2b}
                </em>
                .
              </h2>
            </div>
            <div
              className="ln-sec-aside"
              style={{ maxWidth: 320, color: DIM, fontSize: 15 }}
            >
              {t.casesAside}
            </div>
          </div>

          <div
            className="ln-cases"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {CASES.map((c) => (
              <div
                key={c.name}
                style={{
                  background: BG2,
                  border: `1px solid ${LINE}`,
                  borderRadius: 18,
                  padding: 28,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    fontFamily: MONO,
                    fontSize: 9,
                    padding: "4px 8px",
                    borderRadius: 4,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    background: "rgba(212,255,58,0.15)",
                    color: LIME,
                    border: "1px solid rgba(212,255,58,0.3)",
                  }}
                >
                  {c.badge}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 2,
                    color: LIME,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  {lang === "es" ? c.catEs : c.catEn}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: -0.5,
                    marginBottom: 24,
                    lineHeight: 1.25,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: 12,
                    padding: "20px 0",
                    borderTop: `1px dashed ${LINE}`,
                    borderBottom: `1px dashed ${LINE}`,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1.5,
                        color: DIM,
                        textTransform: "uppercase",
                      }}
                    >
                      {t.paid}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: -0.8,
                        fontVariantNumeric: "tabular-nums",
                        color: DIM,
                        textDecoration: "line-through",
                        textDecorationColor: "rgba(255,107,90,0.4)",
                      }}
                    >
                      {c.costIn}
                    </div>
                  </div>
                  <div style={{ fontFamily: MONO, color: LIME, fontSize: 18 }}>
                    →
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1.5,
                        color: DIM,
                        textTransform: "uppercase",
                      }}
                    >
                      {t.sold}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: -0.8,
                        fontVariantNumeric: "tabular-nums",
                        color: LIME,
                      }}
                    >
                      {c.costOut}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                  }}
                >
                  {[
                    { k: "ROI", v: c.roi, c: LIME },
                    { k: t.profit, v: c.profit },
                    { k: t.days, v: c.days },
                  ].map((s) => (
                    <div
                      key={s.k}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          color: DIM,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {s.k}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          letterSpacing: -0.4,
                          fontVariantNumeric: "tabular-nums",
                          color: s.c || INK,
                        }}
                      >
                        {s.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section
        style={{ padding: "90px 40px", borderBottom: `1px solid ${LINE}` }}
      >
        <div
          className="ln-stats-grid"
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 40,
          }}
        >
          {[
            { n: ["12,", "847"], l: t.stat1 },
            { n: ["$3.2", "M"], l: t.stat2 },
            { n: ["187", "K"], l: t.productsAnalyzed },
            { n: ["94", "%"], l: t.stat3 },
          ].map((s) => (
            <div key={s.l}>
              <div
                className="n"
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(44px, 4.5vw, 64px)",
                  letterSpacing: -2.5,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 2,
                }}
              >
                {s.n[0]}
                <em style={{ color: LIME, fontStyle: "normal" }}>{s.n[1]}</em>
              </div>
              <div
                className="k"
                style={{
                  marginTop: 12,
                  fontFamily: MONO,
                  fontSize: 11,
                  color: DIM,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section
        id="pricing"
        style={{
          padding: "140px 40px 120px",
          maxWidth: 1360,
          margin: "0 auto",
        }}
      >
        <div
          className="ln-sec-head"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 72,
            gap: 40,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: LIME,
                letterSpacing: 3,
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 1,
                  background: LIME,
                  display: "inline-block",
                }}
              />
              {t.sectionPricing}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(40px, 5vw, 64px)",
                fontWeight: 800,
                letterSpacing: -2.5,
                lineHeight: 1,
              }}
            >
              {t.pricingH2a}{" "}
              <em style={{ fontStyle: "normal", color: LIME, fontWeight: 500 }}>
                {t.pricingH2b}
              </em>
              .
            </h2>
          </div>
          <div
            className="ln-sec-aside"
            style={{ maxWidth: 320, color: DIM, fontSize: 15 }}
          >
            {t.pricingAside}
          </div>
        </div>

        <div
          className="ln-plans"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {/* Free */}
          <PlanCard
            tier={t.freeTier}
            price="0"
            perMonth={t.perMonth}
            tagline={t.freeTag}
            features={[t.freeF1, t.freeF2, t.freeF3, t.freeF4]}
            cta={t.freeCta}
            href="/free"
            featured={false}
          />
          {/* Pro */}
          <PlanCard
            tier={t.proTier}
            price="29"
            perMonth={t.perMonth}
            tagline={t.proTag}
            features={[t.proF1, t.proF2, t.proF3, t.proF4, t.proF5]}
            cta={t.proCta}
            href="/register"
            featured
            ribbon={t.proRibbon}
          />
          {/* Team */}
          <PlanCard
            tier={t.teamTier}
            price="99"
            perMonth={t.perMonth}
            tagline={t.teamTag}
            features={[t.teamF1, t.teamF2, t.teamF3, t.teamF4, t.teamF5]}
            cta={t.teamCta}
            href="/register"
            featured={false}
          />
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section
        className="ln-final"
        style={{
          padding: "140px 40px",
          position: "relative",
          overflow: "hidden",
          borderTop: `1px solid ${LINE}`,
          background: `radial-gradient(ellipse 60% 80% at 50% 40%, rgba(212,255,58,0.08) 0%, transparent 65%), ${BG}`,
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: 980,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            className="ln-final-h2"
            style={{
              margin: "0 0 24px",
              fontSize: "clamp(48px, 6vw, 88px)",
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 0.96,
            }}
          >
            {t.finalH2a}
            <br />
            <em style={{ fontStyle: "normal", color: LIME, fontWeight: 500 }}>
              {t.finalH2b}
            </em>
          </h2>
          <p
            style={{
              color: DIM,
              fontSize: 18,
              maxWidth: 540,
              margin: "0 auto 40px",
            }}
          >
            {t.finalP}
          </p>
          <div
            className="actions"
            style={{ display: "flex", justifyContent: "center", gap: 14 }}
          >
            <Link
              href="/free"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                background: LIME,
                color: BG,
                textDecoration: "none",
                boxShadow: `0 0 0 1px ${LIME}, 0 8px 28px rgba(212,255,58,0.28)`,
              }}
            >
              <span>{t.startFree}</span>
              <span style={{ fontWeight: 700 }}>→</span>
            </Link>
            <a
              href="#how"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                border: `1px solid ${LINE2}`,
                color: INK,
                textDecoration: "none",
              }}
            >
              {t.watchLive}
            </a>
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: DIMMER,
            }}
          >
            {t.trust}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          padding: "60px 40px 40px",
          borderTop: `1px solid ${LINE}`,
          background: BG2,
        }}
      >
        <div
          className="ln-foot-inner"
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: -0.5,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: LIME,
                boxShadow: `0 0 12px ${LIME}`,
                display: "inline-block",
              }}
            />
            Flip
            <em
              style={{
                color: LIME,
                fontStyle: "normal",
                fontWeight: 500,
                marginLeft: 2,
              }}
            >
              IQ
            </em>
          </div>
          <div
            className="ln-foot-cols"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: 72,
            }}
          >
            <FootCol
              title={t.product}
              links={[
                { label: t.howLink, href: "#how" },
                { label: t.realCases, href: "#cases" },
                { label: t.pricing, href: "#pricing" },
                { label: t.changelog, href: "#" },
              ]}
            />
            <FootCol
              title={t.company}
              links={[
                { label: t.about, href: "#" },
                { label: t.blog, href: "#" },
                { label: t.contact, href: "#" },
              ]}
            />
            <FootCol
              title={t.legal}
              links={[
                { label: t.terms, href: "#" },
                { label: t.privacy, href: "#" },
                { label: t.cookies, href: "#" },
              ]}
            />
          </div>
        </div>
        <div
          className="ln-foot-bot"
          style={{
            maxWidth: 1360,
            margin: "48px auto 0",
            paddingTop: 24,
            borderTop: `1px solid ${LINE}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: MONO,
            fontSize: 10,
            color: DIM,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          <div>&copy; 2026 FlipIQ · Made for flippers</div>
          <div>v1.4.2 · All systems operational</div>
        </div>
      </footer>

      {/* ═══ Sticky Mobile CTA ═══ */}
      <div className={`ln-sticky ${showSticky ? "ln-sticky-show" : ""}`}>
        <div
          style={{
            background: BG2,
            border: `1px solid ${LINE2}`,
            borderRadius: 16,
            padding: "8px 8px 8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 600,
                color: INK,
                letterSpacing: 0,
                marginBottom: 1,
              }}
            >
              FlipIQ
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: DIM,
                letterSpacing: 0.5,
              }}
            >
              {t.scanFree}
            </div>
          </div>
          <Link
            href="/free"
            style={{
              padding: "11px 16px",
              borderRadius: 11,
              background: LIME,
              color: BG,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              border: "none",
              textDecoration: "none",
            }}
          >
            {t.scanFree} →
          </Link>
        </div>
      </div>

      <style>{`
  @keyframes landing-pulse {
    0% { box-shadow: 0 0 0 0 rgba(212,255,58,0.6); }
    100% { box-shadow: 0 0 0 10px rgba(212,255,58,0); }
  }
  @keyframes landing-ticker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @keyframes landing-scanMove {
    0%, 100% { transform: translateY(-60px); opacity: 0; }
    20% { opacity: 1; }
    50% { transform: translateY(60px); opacity: 1; }
    80% { opacity: 0; }
  }
  @keyframes landing-blink { 50% { opacity: 0; } }

  /* Sticky CTA - hidden by default, shown on mobile */
  .ln-sticky {
    display: none;
  }

  /* ═══ Tablet ═══ */
  @media (max-width: 1100px) {
    .ln-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .ln-hero-right { height: 420px !important; }
    .ln-orb-wrap { width: 420px !important; height: 420px !important; }
    .ln-steps { grid-template-columns: 1fr !important; }
    .ln-step { min-height: auto !important; }
    .ln-cases { grid-template-columns: 1fr !important; }
    .ln-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .ln-plans { grid-template-columns: 1fr !important; }
    .ln-sec-head { flex-direction: column !important; align-items: flex-start !important; }
    .ln-foot-cols { grid-template-columns: repeat(2, auto) !important; gap: 32px !important; }
  }

  /* ═══ Mobile ═══ */
  @media (max-width: 768px) {
    /* Nav */
    .ln-nav { padding: 14px 20px !important; }
    .ln-nav-links { display: none !important; }
    .ln-nav-actions { gap: 8px !important; }
    .ln-nav-actions a { padding: 8px 12px !important; font-size: 10px !important; letter-spacing: 1px !important; }

    /* Hero */
    .ln-hero { padding: 100px 20px 32px !important; min-height: auto !important; }
    .ln-hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
    .ln-hero-right { height: 320px !important; width: 320px !important; max-width: 100% !important; margin: 0 auto !important; }
    .ln-orb-wrap { width: 100% !important; height: 100% !important; }
    .ln-orb-center .n { font-size: 84px !important; letter-spacing: -3.5px !important; }
    .ln-orb-center .n .u { font-size: 32px !important; }
    .ln-orb-center .lbl { font-size: 9px !important; letter-spacing: 2.5px !important; margin-top: 10px !important; }
    .ln-h1 { font-size: 42px !important; letter-spacing: -1.8px !important; }
    .ln-sub { font-size: 15px !important; max-width: 320px !important; }
    .ln-hero-actions { flex-direction: column !important; }
    .ln-hero-actions a { width: 100%; text-align: center; justify-content: center; padding: 15px 22px !important; border-radius: 14px !important; }
    .ln-hero-stats { gap: 20px !important; }
    .ln-hero-stats > div .n { font-size: 20px !important; }
    .ln-hero-stats > div .l { font-size: 9px !important; }

    /* Orb badges - only show 2 on mobile */
    .ln-badge-tr, .ln-badge-bl { display: none !important; }
    .ln-badge-tl { top: 4px !important; left: -8px !important; padding: 7px 10px !important; border-radius: 10px !important; }
    .ln-badge-tl, .ln-badge-tl b { font-size: 8px !important; }
    .ln-badge-tl b { font-size: 12px !important; }
    .ln-badge-br { bottom: 20px !important; right: -8px !important; padding: 7px 10px !important; border-radius: 10px !important; }
    .ln-badge-br, .ln-badge-br b { font-size: 8px !important; }
    .ln-badge-br b { font-size: 12px !important; }

    /* Section heads */
    .ln-sec-head { flex-direction: column !important; align-items: flex-start !important; margin-bottom: 28px !important; }
    .ln-sec-head h2 { font-size: 34px !important; letter-spacing: -1.4px !important; }
    .ln-sec-aside { font-size: 14px !important; }

    /* How it works - steps */
    .ln-steps { grid-template-columns: 1fr !important; gap: 14px !important; border: none !important; border-radius: 0 !important; background: transparent !important; }
    .ln-step { min-height: auto !important; border-radius: 18px !important; border: 1px solid rgba(245,245,242,0.08) !important; background: #0E0E0E !important; padding: 20px !important; }
    .ln-step-vis { height: 160px !important; border-radius: 12px !important; }

    /* Cases - horizontal scroll */
    .ln-cases {
      grid-template-columns: none !important;
      display: flex !important;
      gap: 12px !important;
      overflow-x: auto !important;
      scroll-snap-type: x mandatory !important;
      margin: 0 -20px !important;
      padding: 0 20px 4px !important;
      scrollbar-width: none !important;
    }
    .ln-cases::-webkit-scrollbar { display: none; }
    .ln-cases > div {
      flex: 0 0 280px !important;
      scroll-snap-align: start !important;
    }

    /* Stats */
    .ln-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
    .ln-stats-grid > div .n { font-size: 38px !important; letter-spacing: -1.5px !important; }
    .ln-stats-grid > div .k { font-size: 10px !important; }

    /* Pricing */
    .ln-plans { grid-template-columns: 1fr !important; gap: 12px !important; }

    /* Sections padding */
    section { padding-left: 20px !important; padding-right: 20px !important; }

    /* Final CTA */
    .ln-final { padding: 56px 20px 48px !important; }
    .ln-final-h2 { font-size: 36px !important; letter-spacing: -1.5px !important; }
    .ln-final .actions { flex-direction: column !important; }
    .ln-final .actions a { width: 100%; text-align: center; justify-content: center; }

    /* Footer */
    .ln-foot-inner { flex-direction: column !important; }
    .ln-foot-cols { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
    .ln-foot-bot { flex-direction: column !important; gap: 6px !important; }

    /* Sticky CTA */
    .ln-sticky {
      display: block;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 30;
      padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
      background: linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.95) 40%, #0A0A0A 100%);
      transform: translateY(110%);
      transition: transform 0.3s cubic-bezier(.2,.9,.3,1);
      pointer-events: none;
    }
    .ln-sticky-show {
      transform: translateY(0) !important;
      pointer-events: auto !important;
    }
  }
`}</style>
    </div>
  );
}

/* ═══ PlanCard sub-component ═══ */
function PlanCard({
  tier,
  price,
  perMonth,
  tagline,
  features,
  cta,
  href,
  featured,
  ribbon,
}: {
  tier: string;
  price: string;
  perMonth: string;
  tagline: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
  ribbon?: string;
}) {
  return (
    <div
      style={{
        background: featured
          ? "linear-gradient(180deg, rgba(212,255,58,0.06) 0%, rgba(212,255,58,0.02) 100%)"
          : BG2,
        border: featured ? `1px solid ${LIME}` : `1px solid ${LINE}`,
        borderRadius: 20,
        padding: "36px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        position: "relative",
        boxShadow: featured
          ? `0 0 0 1px ${LIME}, 0 20px 60px rgba(212,255,58,0.1)`
          : "none",
      }}
    >
      {ribbon && (
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 24,
            padding: "5px 12px",
            borderRadius: 20,
            background: LIME,
            color: BG,
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {ribbon}
        </div>
      )}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: featured ? LIME : DIM,
        }}
      >
        {tier}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        <span style={{ fontSize: 24, color: DIM, fontWeight: 500 }}>$</span>
        <span
          style={{
            fontSize: 64,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {price}
        </span>
        <span
          style={{
            fontSize: 14,
            color: DIM,
            fontWeight: 500,
            letterSpacing: 0,
            marginLeft: 4,
          }}
        >
          {perMonth}
        </span>
      </div>
      <div style={{ color: DIM, fontSize: 14, lineHeight: 1.5, minHeight: 44 }}>
        {tagline}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderTop: `1px solid ${LINE}`,
          paddingTop: 22,
        }}
      >
        {features.map((f) => (
          <li
            key={f}
            style={{
              fontSize: 14,
              color: INK,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                color: LIME,
                fontFamily: MONO,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              →
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        style={{
          marginTop: "auto",
          padding: "14px 22px",
          borderRadius: 12,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          textDecoration: "none",
          border: featured ? `1px solid ${LIME}` : `1px solid ${LINE2}`,
          color: featured ? BG : INK,
          background: featured ? LIME : "transparent",
          display: "block",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

/* ═══ FootCol sub-component ═══ */
function FootCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 2,
          color: DIM,
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          style={{
            display: "block",
            fontSize: 13,
            color: INK,
            marginBottom: 10,
            textDecoration: "none",
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
