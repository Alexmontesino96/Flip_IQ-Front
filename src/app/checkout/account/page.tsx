"use client";

import { useState, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MONO, DISPLAY } from "@/components/ui/theme";
import { pushEvent } from "@/lib/tracking";
import Link from "next/link";

/* ── Design tokens (match HTML exactly) ── */
const BG = "#0A0A0A";
const BG2 = "#0E0E0E";
const INK = "#F5F5F2";
const LIME = "#D4FF3A";
const DIM = "rgba(245,245,242,0.58)";
const DIMMER = "rgba(245,245,242,0.35)";
const LINE = "rgba(245,245,242,0.08)";
const LINE2 = "rgba(245,245,242,0.14)";
const PASS = "#FF6B5A";
const WATCH = "#FFB547";

/* ── Plan info ── */
const PLAN_INFO: Record<
  string,
  {
    name: string;
    nameEs: string;
    price: string;
    priceEs: string;
    daily: string;
    dailyEs: string;
  }
> = {
  starter: {
    name: "Starter",
    nameEs: "Starter",
    price: "$9.99",
    priceEs: "$9.99",
    daily: "30 scans/day",
    dailyEs: "30 escaneos/dia",
  },
  pro: {
    name: "Pro",
    nameEs: "Pro",
    price: "$19.99",
    priceEs: "$19.99",
    daily: "100 scans/day",
    dailyEs: "100 escaneos/dia",
  },
};

/* ── i18n ── */
const T = {
  es: {
    planLabel: "Plan",
    cuentaLabel: "Cuenta",
    helpLink: "Necesitas ayuda?",
    secureBadge: "SECURE \u00B7 TLS 1.3",
    planChosen: "Plan elegido",
    perMonth: "/ mes",
    changePlan: "Cambiar",
    // S1 left
    s1Eyebrow: "Paso 2 de 3 \u00B7 Cuenta",
    s1HeroLine1: "Primero",
    s1HeroLine2: "necesitamos",
    s1HeroLine3: "saber algo de ti.",
    s1Desc1: "Estas a un paso de tu plan ",
    s1Desc2:
      ". Para asociarlo a tu cuenta, decinos si ya flipeas con FlipIQ o si ",
    s1Desc3: "arrancas hoy",
    s1Desc4: ".",
    s1Micro1: "Tu plan se asocia a la cuenta. ",
    s1Micro1b: "Sin cobros sorpresa",
    s1Micro1c: " \u2014 primero confirmas todo.",
    s1Micro2: "Conexion cifrada. Tu password se hashea en el cliente. ",
    s1Micro2b: "Nadie de FlipIQ puede leerla",
    s1Micro2c: ".",
    s1Micro3: "Cambias de idea? ",
    s1Micro3b: "Cancelas en 1 click",
    s1Micro3c: " desde Settings \u00B7 sin preguntas.",
    s1Stat1n: "8.2k",
    s1Stat1l: "Resellers activos",
    s1Stat2n: "$3.4M",
    s1Stat2l: "Profit detectado",
    s1Stat3n: "4.8\u2605",
    s1Stat3l: "App store rating",
    // S1 right
    s1StepOf: "Paso",
    s1StepOfSuffix: "\u00B7 Cuenta",
    s1BackBtn: "\u2190 Volver al plan",
    s1CardTitle1: "Ya tenes FlipIQ o",
    s1CardTitle2: "es tu primera vez?",
    s1CardSub1:
      "Toma la opcion que corresponda. Te llevamos al lugar exacto \u2014 ",
    s1CardSub1b: "sin pasos extra",
    s1CardSub1c: ".",
    s1ChoiceNewTitle: "Es mi primera vez",
    s1ChoiceNewSub: "Te creamos la cuenta y aplicamos el plan ",
    s1ChoiceNewSubEnd: ".",
    s1ChoiceNewBadge: "Recomendado",
    s1ChoiceExTitle: "Ya tengo cuenta",
    s1ChoiceExSub: "Inicias sesion y asociamos ",
    s1ChoiceExSubEnd: " a tu perfil actual.",
    s1ChoiceExBadge: "Login",
    s1OrSep: "o continua con",
    s1CtaNew: "Crear mi cuenta",
    s1CtaExisting: "Ingresar a mi cuenta",
    s1CtaDefault: "Continuar",
    s1Footnote1: "Al continuar aceptas los ",
    s1FootnoteTerms: "Terminos",
    s1Footnote2: " y la ",
    s1FootnotePrivacy: "Politica de privacidad",
    s1Footnote3: ".",
    s1Trust: "Stripe procesa todos los pagos \u00B7 ",
    s1Trustb: "FlipIQ nunca ve tu tarjeta",
    s1Trustc: ". PCI-DSS Level 1.",
    // S2 left
    s2Eyebrow: "Paso 2 de 3 \u00B7 Crear cuenta",
    s2HeroLine1: "Entonces",
    s2HeroLine2: "comencemos",
    s2HeroLine3: "creando tu cuenta.",
    s2Desc1: "Cuatro campos y estas dentro. Tu plan ",
    s2Desc2: " se aplica al confirmar el email \u2014 ",
    s2Desc3: "todavia no se cobra nada",
    s2Desc4: ".",
    s2Micro1b: "Nombre y apellido",
    s2Micro1c: " aparecen solo en tu perfil. Nunca los compartimos.",
    s2Micro2b: "Email",
    s2Micro2c: " es tu login y donde te llegan alertas de comps.",
    s2Micro3b: "Min. 8 caracteres",
    s2Micro3c: ", una mayuscula y un numero. Nunca la guardamos en plain text.",
    s2Stat1n: "~30s",
    s2Stat1l: "Setup completo",
    s2Stat2n: "100/d",
    s2Stat2l: "Analisis incluidos",
    s2Stat3n: "7d",
    s2Stat3l: "Trial sin cargo",
    // S2 right
    s2StepOfSuffix: "\u00B7 Crear cuenta",
    s2BackBtn: "\u2190 Atras",
    s2CardTitle1: "Tus datos.",
    s2CardTitle2: "Despues escaneamos.",
    s2CardSub:
      "Cuatro campos, sin trampa. Te mandamos un email para confirmar.",
    s2LabelName: "Nombre",
    s2LabelLast: "Apellidos",
    s2LabelEmail: "Email",
    s2LabelPw: "Contrasena",
    s2HintLogin: "Usado como login",
    s2HintPw: "Min. 8 caracteres",
    s2PwToggleShow: "Mostrar",
    s2PwToggleHide: "Ocultar",
    s2StrengthLabel: "Fortaleza",
    s2StrengthEmpty: "VACIA",
    s2StrengthWeak: "DEBIL",
    s2StrengthOk: "OK",
    s2StrengthGood: "BUENA",
    s2StrengthStrong: "FUERTE",
    s2Consent1: "Acepto los ",
    s2ConsentTerms: "Terminos de servicio",
    s2Consent2: " y la ",
    s2ConsentPrivacy: "Politica de privacidad",
    s2Consent3:
      ". Quiero recibir alertas de comps por email \u2014 puedo desactivarlas cuando quiera.",
    s2Cta: "Crear cuenta y aplicar ",
    s2CtaLoading: "Creando cuenta...",
    s2FootnoteQ: "Ya tenes cuenta? ",
    s2FootnoteLink: "Ingresar",
    s2Trust1: "Trial 7 dias gratis",
    s2Trust2:
      " \u00B7 cancelas cuando quieras desde Settings \u2014 sin preguntas.",
    s2PlaceholderFirst: "Alex",
    s2PlaceholderLast: "Montesino",
    s2PlaceholderEmail: "alex@correo.com",
    s2PlaceholderPw: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    errorGeneric: "Error al crear cuenta",
  },
  en: {
    planLabel: "Plan",
    cuentaLabel: "Account",
    helpLink: "Need help?",
    secureBadge: "SECURE \u00B7 TLS 1.3",
    planChosen: "Plan selected",
    perMonth: "/ mo",
    changePlan: "Change",
    s1Eyebrow: "Step 2 of 3 \u00B7 Account",
    s1HeroLine1: "First, we",
    s1HeroLine2: "need to know",
    s1HeroLine3: "a bit about you.",
    s1Desc1: "You're one step from your ",
    s1Desc2: " plan. Tell us if you already use FlipIQ or if you're ",
    s1Desc3: "starting today",
    s1Desc4: ".",
    s1Micro1: "Your plan is linked to your account. ",
    s1Micro1b: "No surprise charges",
    s1Micro1c: " \u2014 you confirm everything first.",
    s1Micro2: "Encrypted connection. Your password is hashed client-side. ",
    s1Micro2b: "Nobody at FlipIQ can read it",
    s1Micro2c: ".",
    s1Micro3: "Change your mind? ",
    s1Micro3b: "Cancel in 1 click",
    s1Micro3c: " from Settings \u00B7 no questions asked.",
    s1Stat1n: "8.2k",
    s1Stat1l: "Active resellers",
    s1Stat2n: "$3.4M",
    s1Stat2l: "Profit detected",
    s1Stat3n: "4.8\u2605",
    s1Stat3l: "App store rating",
    s1StepOf: "Step",
    s1StepOfSuffix: "\u00B7 Account",
    s1BackBtn: "\u2190 Back to plan",
    s1CardTitle1: "New here or",
    s1CardTitle2: "returning user?",
    s1CardSub1:
      "Pick the right option. We'll take you to the right place \u2014 ",
    s1CardSub1b: "no extra steps",
    s1CardSub1c: ".",
    s1ChoiceNewTitle: "First time here",
    s1ChoiceNewSub: "We'll create your account and apply the ",
    s1ChoiceNewSubEnd: " plan.",
    s1ChoiceNewBadge: "Recommended",
    s1ChoiceExTitle: "I have an account",
    s1ChoiceExSub: "Sign in and we'll link ",
    s1ChoiceExSubEnd: " to your profile.",
    s1ChoiceExBadge: "Login",
    s1OrSep: "or continue with",
    s1CtaNew: "Create my account",
    s1CtaExisting: "Sign in to my account",
    s1CtaDefault: "Continue",
    s1Footnote1: "By continuing you accept the ",
    s1FootnoteTerms: "Terms",
    s1Footnote2: " and ",
    s1FootnotePrivacy: "Privacy Policy",
    s1Footnote3: ".",
    s1Trust: "Stripe processes all payments \u00B7 ",
    s1Trustb: "FlipIQ never sees your card",
    s1Trustc: ". PCI-DSS Level 1.",
    s2Eyebrow: "Step 2 of 3 \u00B7 Create account",
    s2HeroLine1: "Let's get",
    s2HeroLine2: "started",
    s2HeroLine3: "creating your account.",
    s2Desc1: "Four fields and you're in. Your ",
    s2Desc2: " plan activates after email confirmation \u2014 ",
    s2Desc3: "nothing is charged yet",
    s2Desc4: ".",
    s2Micro1b: "Name and last name",
    s2Micro1c: " only appear on your profile. We never share them.",
    s2Micro2b: "Email",
    s2Micro2c: " is your login and where comp alerts arrive.",
    s2Micro3b: "Min. 8 characters",
    s2Micro3c: ", one uppercase and one number. Never stored in plain text.",
    s2Stat1n: "~30s",
    s2Stat1l: "Full setup",
    s2Stat2n: "100/d",
    s2Stat2l: "Analyses included",
    s2Stat3n: "7d",
    s2Stat3l: "Free trial",
    s2StepOfSuffix: "\u00B7 Create account",
    s2BackBtn: "\u2190 Back",
    s2CardTitle1: "Your details.",
    s2CardTitle2: "Then we scan.",
    s2CardSub: "Four fields, no tricks. We'll send a confirmation email.",
    s2LabelName: "First name",
    s2LabelLast: "Last name",
    s2LabelEmail: "Email",
    s2LabelPw: "Password",
    s2HintLogin: "Used as login",
    s2HintPw: "Min. 8 characters",
    s2PwToggleShow: "Show",
    s2PwToggleHide: "Hide",
    s2StrengthLabel: "Strength",
    s2StrengthEmpty: "EMPTY",
    s2StrengthWeak: "WEAK",
    s2StrengthOk: "OK",
    s2StrengthGood: "GOOD",
    s2StrengthStrong: "STRONG",
    s2Consent1: "I accept the ",
    s2ConsentTerms: "Terms of Service",
    s2Consent2: " and the ",
    s2ConsentPrivacy: "Privacy Policy",
    s2Consent3:
      ". I want to receive comp alerts by email \u2014 I can disable them anytime.",
    s2Cta: "Create account & apply ",
    s2CtaLoading: "Creating account...",
    s2FootnoteQ: "Already have an account? ",
    s2FootnoteLink: "Sign in",
    s2Trust1: "7-day free trial",
    s2Trust2: " \u00B7 cancel anytime from Settings \u2014 no questions asked.",
    s2PlaceholderFirst: "Alex",
    s2PlaceholderLast: "Montesino",
    s2PlaceholderEmail: "alex@correo.com",
    s2PlaceholderPw: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    errorGeneric: "Error creating account",
  },
};

type Lang = "es" | "en";

/* ── Password strength ── */
function getStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}
function strengthLabel(s: number, lang: Lang) {
  const t = T[lang];
  return (
    [
      t.s2StrengthEmpty,
      t.s2StrengthWeak,
      t.s2StrengthOk,
      t.s2StrengthGood,
      t.s2StrengthStrong,
    ][s] || t.s2StrengthEmpty
  );
}
function strengthColor(s: number) {
  if (s <= 1) return PASS;
  if (s === 2) return WATCH;
  return LIME;
}

/* ── SVG Icons ── */
function SunIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 22v-4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83" />
    </svg>
  );
}
function LockIconSmall() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}
function CheckPolyline() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function MailIconMicro() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1 0 2 1 2 2v12c0 1-1 2-2 2H4c-1 0-2-1-2-2V6c0-1 1-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ShieldCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1 0 2 1 2 2v12c0 1-1 2-2 2H4c-1 0-2-1-2-2V6c0-1 1-2 2-2z" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#FFC107"
        d="M21.8 10.2H12v3.9h5.6c-.5 2.5-2.6 4.3-5.6 4.3-3.4 0-6.2-2.8-6.2-6.2s2.8-6.2 6.2-6.2c1.6 0 3 .6 4.1 1.6l2.8-2.8C16.9 2.7 14.6 1.7 12 1.7 6.3 1.7 1.7 6.3 1.7 12S6.3 22.3 12 22.3c5.9 0 10-4.1 10-10.3 0-.6-.1-1.2-.2-1.8z"
      />
    </svg>
  );
}
function AppleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={INK}>
      <path d="M17.6 13.4c0-2.6 2.2-3.9 2.3-3.9-1.2-1.8-3.2-2-3.9-2-1.6-.2-3.2.9-4 .9s-2.1-.9-3.5-.9c-1.8 0-3.4 1-4.3 2.6-1.8 3.2-.5 7.8 1.3 10.4.9 1.3 1.9 2.7 3.3 2.6 1.3 0 1.8-.8 3.5-.8 1.6 0 2.1.8 3.5.8 1.5 0 2.4-1.3 3.3-2.6 1-1.5 1.4-2.9 1.5-3-.1 0-2.9-1.1-2.9-4.1zM15 4.6c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

/* ── Field input component ── */
function FieldInput({
  icon,
  label,
  hint,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
  right,
}: {
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1.8,
          color: DIM,
          textTransform: "uppercase",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>
          {label}{" "}
          {required && <span style={{ color: LIME, fontWeight: 700 }}>*</span>}
        </span>
        {hint && <span style={{ color: DIMMER, fontSize: 9 }}>{hint}</span>}
      </label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 14,
              color: DIM,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={right ? "ag-input ag-input-toggle" : "ag-input"}
          style={{
            width: "100%",
            padding: `13px ${right ? "48px" : "14px"} 13px ${icon ? "40px" : "14px"}`,
            borderRadius: 11,
            border: `1px solid ${LINE2}`,
            background: BG,
            color: INK,
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            letterSpacing: -0.1,
            transition: "border-color 0.15s, background 0.15s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,255,58,0.45)";
            e.currentTarget.style.background = "rgba(212,255,58,0.025)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = LINE2;
            e.currentTarget.style.background = BG;
          }}
        />
        {right && (
          <span style={{ position: "absolute", right: 10 }}>{right}</span>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
function AccountGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan") ?? "basic";
  const plan = PLAN_INFO[planKey] ?? PLAN_INFO.starter;

  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "es";
    try {
      const saved = localStorage.getItem("fliqLang");
      if (saved === "en" || saved === "es") return saved;
    } catch {
      /* noop */
    }
    return "es";
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [choice, setChoice] = useState<"new" | "existing">("new");

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => getStrength(password), [password]);
  const canSubmit = firstName && email && password.length >= 8 && agreed;
  const t = T[lang];
  const planName = lang === "es" ? plan.nameEs : plan.name;

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "es" ? "en" : "es";
      try {
        localStorage.setItem("fliqLang", next);
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (choice === "existing") {
      router.push(`/login?redirect=/plans&plan=${planKey}`);
    } else {
      setStep(2);
    }
  }, [choice, planKey, router]);

  const handleSignup = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${firstName} ${lastName}`.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    pushEvent("register_completed", { method: "email", flow: "checkout" });
    sessionStorage.setItem("selectedPlan", planKey);
    router.push(`/plans?plan=${planKey}`);
    router.refresh();
  }, [canSubmit, firstName, lastName, email, password, planKey, router]);

  return (
    <div
      className="ag-page"
      style={{
        minHeight: "100dvh",
        background: BG,
        color: INK,
        fontFamily: DISPLAY,
        WebkitFontSmoothing: "antialiased",
        lineHeight: 1.5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(to right, rgba(245,245,242,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,245,242,0.025) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          WebkitMaskImage:
            "radial-gradient(ellipse 800px 500px at 50% 30%, #000 30%, transparent 80%)",
          maskImage:
            "radial-gradient(ellipse 800px 500px at 50% 30%, #000 30%, transparent 80%)",
        }}
      />

      {/* ═══════════ TOP BAR ═══════════ */}
      <div
        className="ag-topbar"
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 36px",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: INK,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: BG2,
              border: "1px solid rgba(212,255,58,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: LIME,
              letterSpacing: -2,
              fontSize: 18,
              boxShadow: "inset 0 0 12px rgba(212,255,58,0.12)",
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>
            Flip<em style={{ fontStyle: "normal", color: LIME }}>IQ</em>
          </span>
        </Link>

        {/* Step track */}
        <div
          className="ag-step-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 1.8,
            color: DIM,
            textTransform: "uppercase",
          }}
        >
          <span>{t.planLabel}</span>
          <div style={{ display: "flex", gap: 5 }}>
            <span
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: "rgba(212,255,58,0.4)",
              }}
            />
            <span
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: step === 1 ? LIME : "rgba(212,255,58,0.4)",
                boxShadow:
                  step === 1 ? "0 0 6px rgba(212,255,58,0.55)" : "none",
              }}
            />
            <span
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: step === 2 ? LIME : "rgba(245,245,242,0.1)",
                boxShadow:
                  step === 2 ? "0 0 6px rgba(212,255,58,0.55)" : "none",
              }}
            />
          </div>
          <span>{t.cuentaLabel}</span>
        </div>

        <div
          className="ag-topbar-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: MONO,
            fontSize: 11,
            color: DIM,
            letterSpacing: 1,
          }}
        >
          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            style={{
              background: "transparent",
              border: "none",
              color: DIM,
              cursor: "pointer",
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: 5,
            }}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <span style={{ cursor: "pointer" }}>{t.helpLink}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={LIME}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {t.secureBadge}
          </span>
        </div>
      </div>

      {/* ═══════════ PLAN SUMMARY STRIP ═══════════ */}
      <div
        className="ag-plan-strip"
        style={{
          position: "relative",
          zIndex: 4,
          maxWidth: 1180,
          margin: "24px auto 0",
          padding: "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 1.5,
            color: DIM,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(212,255,58,0.12)",
              border: "1px solid rgba(212,255,58,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4FF3A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          <span>{t.planChosen}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            border: `1px solid ${LINE2}`,
            borderRadius: 10,
            background: BG2,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 0.5,
          }}
        >
          <span
            style={{
              color: LIME,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {planName}
          </span>
          <span style={{ color: INK, fontWeight: 600 }}>
            {plan.price}{" "}
            <small style={{ color: DIM, fontWeight: 400 }}>{t.perMonth}</small>
          </span>
          <Link
            href="/plans"
            style={{
              color: DIM,
              borderLeft: `1px solid ${LINE2}`,
              paddingLeft: 10,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontSize: 9.5,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            {t.changePlan}
          </Link>
        </div>
      </div>

      {/* ═══════════ MAIN TWO-COLUMN LAYOUT ═══════════ */}
      <div
        className="ag-main"
        style={{
          position: "relative",
          zIndex: 3,
          maxWidth: 1180,
          margin: "36px auto 0",
          padding: "0 36px 60px",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 56,
          alignItems: "start",
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div style={{ paddingTop: 18 }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: 2.5,
              color: LIME,
              textTransform: "uppercase",
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 6,
              background: "rgba(212,255,58,0.08)",
              border: "1px solid rgba(212,255,58,0.25)",
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: LIME,
                animation: "ag-pulse 1.8s infinite",
              }}
            />
            {step === 1 ? t.s1Eyebrow : t.s2Eyebrow}
          </div>

          {/* Hero */}
          {step === 1 ? (
            <>
              <h1
                className="ag-hero"
                style={{
                  margin: 0,
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: -2.2,
                  lineHeight: 1.02,
                  textWrap: "balance" as never,
                }}
              >
                {t.s1HeroLine1}
                <br />
                {t.s1HeroLine2}
                <br />
                <em style={{ fontStyle: "normal", color: LIME }}>
                  {t.s1HeroLine3}
                </em>
              </h1>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 16,
                  color: DIM,
                  lineHeight: 1.55,
                  maxWidth: 460,
                  textWrap: "pretty" as never,
                }}
              >
                {t.s1Desc1}
                <b style={{ color: INK, fontWeight: 600 }}>{planName}</b>
                {t.s1Desc2}
                <b style={{ color: INK, fontWeight: 600 }}>{t.s1Desc3}</b>
                {t.s1Desc4}
              </div>

              {/* Micro list S1 */}
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(212,255,58,0.08)",
                      border: "1px solid rgba(212,255,58,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: LIME,
                      flexShrink: 0,
                    }}
                  >
                    <SunIcon />
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.45,
                      paddingTop: 4,
                    }}
                  >
                    {t.s1Micro1}
                    <b style={{ color: INK, fontWeight: 600 }}>{t.s1Micro1b}</b>
                    {t.s1Micro1c}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(212,255,58,0.08)",
                      border: "1px solid rgba(212,255,58,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: LIME,
                      flexShrink: 0,
                    }}
                  >
                    <LockIconSmall />
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.45,
                      paddingTop: 4,
                    }}
                  >
                    {t.s1Micro2}
                    <b style={{ color: INK, fontWeight: 600 }}>{t.s1Micro2b}</b>
                    {t.s1Micro2c}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(212,255,58,0.08)",
                      border: "1px solid rgba(212,255,58,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: LIME,
                      flexShrink: 0,
                    }}
                  >
                    <RefreshIcon />
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.45,
                      paddingTop: 4,
                    }}
                  >
                    {t.s1Micro3}
                    <b style={{ color: INK, fontWeight: 600 }}>{t.s1Micro3b}</b>
                    {t.s1Micro3c}
                  </div>
                </div>
              </div>

              {/* Tiny stats S1 */}
              <div
                style={{
                  marginTop: 36,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                  maxWidth: 480,
                }}
              >
                {[
                  { n: t.s1Stat1n, l: t.s1Stat1l },
                  { n: t.s1Stat2n, l: t.s1Stat2l },
                  { n: t.s1Stat3n, l: t.s1Stat3l },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      border: `1px solid ${LINE}`,
                      borderRadius: 12,
                      background: BG2,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: 22,
                        color: LIME,
                        letterSpacing: -1,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.n}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1.5,
                        color: DIM,
                        textTransform: "uppercase",
                        marginTop: 8,
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ── S2 LEFT ── */
            <>
              <h1
                className="ag-hero"
                style={{
                  margin: 0,
                  fontSize: 56,
                  fontWeight: 800,
                  letterSpacing: -2.2,
                  lineHeight: 1.02,
                  textWrap: "balance" as never,
                }}
              >
                {t.s2HeroLine1}
                <br />
                <em style={{ fontStyle: "normal", color: LIME }}>
                  {t.s2HeroLine2}
                </em>
                <br />
                {t.s2HeroLine3}
              </h1>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 16,
                  color: DIM,
                  lineHeight: 1.55,
                  maxWidth: 460,
                  textWrap: "pretty" as never,
                }}
              >
                {t.s2Desc1}
                <b style={{ color: INK, fontWeight: 600 }}>{planName}</b>
                {t.s2Desc2}
                <b style={{ color: INK, fontWeight: 600 }}>{t.s2Desc3}</b>
                {t.s2Desc4}
              </div>

              {/* Micro list S2 */}
              <div
                style={{
                  marginTop: 32,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(212,255,58,0.08)",
                      border: "1px solid rgba(212,255,58,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: LIME,
                      flexShrink: 0,
                    }}
                  >
                    <CheckPolyline />
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.45,
                      paddingTop: 4,
                    }}
                  >
                    <b style={{ color: INK, fontWeight: 600 }}>{t.s2Micro1b}</b>
                    {t.s2Micro1c}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(212,255,58,0.08)",
                      border: "1px solid rgba(212,255,58,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: LIME,
                      flexShrink: 0,
                    }}
                  >
                    <MailIconMicro />
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.45,
                      paddingTop: 4,
                    }}
                  >
                    <b style={{ color: INK, fontWeight: 600 }}>{t.s2Micro2b}</b>
                    {t.s2Micro2c}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "rgba(212,255,58,0.08)",
                      border: "1px solid rgba(212,255,58,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: LIME,
                      flexShrink: 0,
                    }}
                  >
                    <LockIconSmall />
                  </span>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.45,
                      paddingTop: 4,
                    }}
                  >
                    <b style={{ color: INK, fontWeight: 600 }}>{t.s2Micro3b}</b>
                    {t.s2Micro3c}
                  </div>
                </div>
              </div>

              {/* Tiny stats S2 */}
              <div
                style={{
                  marginTop: 36,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                  maxWidth: 480,
                }}
              >
                {[
                  { n: t.s2Stat1n, l: t.s2Stat1l },
                  { n: t.s2Stat2n, l: t.s2Stat2l },
                  { n: t.s2Stat3n, l: t.s2Stat3l },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      border: `1px solid ${LINE}`,
                      borderRadius: 12,
                      background: BG2,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: 22,
                        color: LIME,
                        letterSpacing: -1,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.n}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1.5,
                        color: DIM,
                        textTransform: "uppercase",
                        marginTop: 8,
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: BG2,
              border: `1px solid ${LINE2}`,
              borderRadius: 20,
              padding: 32,
              position: "relative",
              boxShadow: "none",
            }}
          >
            {/* Gradient border glow (::before equivalent) */}
            <div
              style={{
                position: "absolute",
                inset: -1,
                borderRadius: 21,
                pointerEvents: "none",
                background:
                  "linear-gradient(160deg, rgba(212,255,58,0.08), transparent 25%, transparent 75%, rgba(212,255,58,0.04))",
                zIndex: 0,
                opacity: 0.4,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Card head */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9.5,
                    letterSpacing: 2,
                    color: LIME,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {t.s1StepOf} <b style={{ color: INK }}>2</b>{" "}
                  {step === 1 ? t.s1StepOfSuffix : t.s2StepOfSuffix}
                </div>
                <button
                  onClick={() => {
                    if (step === 2) setStep(1);
                    else router.push("/plans");
                  }}
                  style={{
                    background: "transparent",
                    border: 0,
                    color: DIM,
                    cursor: "pointer",
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {step === 1 ? t.s1BackBtn : t.s2BackBtn}
                </button>
              </div>

              {step === 1 ? (
                /* ════ STEP 1 CARD CONTENT ════ */
                <>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: -1,
                      lineHeight: 1.1,
                      marginBottom: 10,
                      textWrap: "balance" as never,
                    }}
                  >
                    {t.s1CardTitle1}
                    <br />
                    {t.s1CardTitle2}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.5,
                      marginBottom: 26,
                      maxWidth: 380,
                    }}
                  >
                    {t.s1CardSub1}
                    <b style={{ color: INK, fontWeight: 600 }}>
                      {t.s1CardSub1b}
                    </b>
                    {t.s1CardSub1c}
                  </div>

                  {/* Choice list */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {/* Choice: New */}
                    <button
                      onClick={() => setChoice("new")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 20px",
                        borderRadius: 14,
                        border: `1px solid ${choice === "new" ? LIME : LINE2}`,
                        background:
                          choice === "new" ? "rgba(212,255,58,0.06)" : BG,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        color: INK,
                        fontFamily: "inherit",
                        transition:
                          "border-color 0.15s, background 0.15s, transform 0.15s",
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: `1.5px solid ${choice === "new" ? LIME : LINE2}`,
                          background: choice === "new" ? LIME : "transparent",
                          flexShrink: 0,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {choice === "new" && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: BG,
                            }}
                          />
                        )}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            letterSpacing: -0.4,
                            lineHeight: 1.2,
                          }}
                        >
                          {t.s1ChoiceNewTitle}
                        </div>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: 0.4,
                            color: DIM,
                            marginTop: 5,
                            lineHeight: 1.4,
                          }}
                        >
                          {t.s1ChoiceNewSub}
                          {planName}
                          {t.s1ChoiceNewSubEnd}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: choice === "new" ? LIME : DIM,
                          textTransform: "uppercase",
                          padding: "4px 9px",
                          borderRadius: 5,
                          fontWeight: 700,
                          flexShrink: 0,
                          background:
                            choice === "new"
                              ? "rgba(212,255,58,0.12)"
                              : "rgba(245,245,242,0.05)",
                          border: `1px solid ${choice === "new" ? "rgba(212,255,58,0.3)" : LINE}`,
                        }}
                      >
                        {t.s1ChoiceNewBadge}
                      </span>
                      <span
                        style={{
                          color: choice === "new" ? LIME : DIM,
                          flexShrink: 0,
                          transition: "transform 0.15s, color 0.15s",
                        }}
                      >
                        <ArrowRightIcon />
                      </span>
                    </button>

                    {/* Choice: Existing */}
                    <button
                      onClick={() => setChoice("existing")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 20px",
                        borderRadius: 14,
                        border: `1px solid ${choice === "existing" ? LIME : LINE2}`,
                        background:
                          choice === "existing" ? "rgba(212,255,58,0.06)" : BG,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        color: INK,
                        fontFamily: "inherit",
                        transition:
                          "border-color 0.15s, background 0.15s, transform 0.15s",
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: `1.5px solid ${choice === "existing" ? LIME : LINE2}`,
                          background:
                            choice === "existing" ? LIME : "transparent",
                          flexShrink: 0,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {choice === "existing" && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: BG,
                            }}
                          />
                        )}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            letterSpacing: -0.4,
                            lineHeight: 1.2,
                          }}
                        >
                          {t.s1ChoiceExTitle}
                        </div>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 10.5,
                            letterSpacing: 0.4,
                            color: DIM,
                            marginTop: 5,
                            lineHeight: 1.4,
                          }}
                        >
                          {t.s1ChoiceExSub}
                          {planName}
                          {t.s1ChoiceExSubEnd}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: choice === "existing" ? LIME : DIM,
                          textTransform: "uppercase",
                          padding: "4px 9px",
                          borderRadius: 5,
                          fontWeight: 700,
                          flexShrink: 0,
                          background:
                            choice === "existing"
                              ? "rgba(212,255,58,0.12)"
                              : "rgba(245,245,242,0.05)",
                          border: `1px solid ${choice === "existing" ? "rgba(212,255,58,0.3)" : LINE}`,
                        }}
                      >
                        {t.s1ChoiceExBadge}
                      </span>
                      <span
                        style={{
                          color: choice === "existing" ? LIME : DIM,
                          flexShrink: 0,
                          transition: "transform 0.15s, color 0.15s",
                        }}
                      >
                        <ArrowRightIcon />
                      </span>
                    </button>
                  </div>

                  {/* Or separator */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      margin: "22px 0 18px",
                    }}
                  >
                    <span style={{ flex: 1, height: 1, background: LINE }} />
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9.5,
                        letterSpacing: 2,
                        color: DIMMER,
                        textTransform: "uppercase",
                      }}
                    >
                      {t.s1OrSep}
                    </span>
                    <span style={{ flex: 1, height: 1, background: LINE }} />
                  </div>

                  {/* OAuth row */}
                  <div
                    className="ag-oauth-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <button
                      onClick={async () => {
                        const supabase = createClient();
                        sessionStorage.setItem("selectedPlan", planKey);
                        await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback?next=/plans`,
                          },
                        });
                      }}
                      style={{
                        padding: 13,
                        background: BG,
                        border: `1px solid ${LINE2}`,
                        borderRadius: 12,
                        color: INK,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <GoogleLogo /> Google
                    </button>
                    <button
                      onClick={async () => {
                        const supabase = createClient();
                        sessionStorage.setItem("selectedPlan", planKey);
                        await supabase.auth.signInWithOAuth({
                          provider: "apple",
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback?next=/plans`,
                          },
                        });
                      }}
                      style={{
                        padding: 13,
                        background: BG,
                        border: `1px solid ${LINE2}`,
                        borderRadius: 12,
                        color: INK,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <AppleLogo /> Apple
                    </button>
                  </div>

                  {/* CTA */}
                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <button
                      onClick={handleContinue}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        background: LIME,
                        color: BG,
                        border: 0,
                        borderRadius: 13,
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 15,
                        letterSpacing: -0.2,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        boxShadow: "0 12px 32px rgba(212,255,58,0.25)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                    >
                      {choice === "new" ? t.s1CtaNew : t.s1CtaExisting}{" "}
                      <span
                        style={{
                          fontWeight: 700,
                          transition: "transform 0.2s",
                        }}
                      >
                        {"\u2192"}
                      </span>
                    </button>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: 1,
                        color: DIM,
                        textAlign: "center",
                        lineHeight: 1.5,
                      }}
                    >
                      {t.s1Footnote1}
                      <a
                        href="#"
                        style={{ color: LIME, textDecoration: "none" }}
                      >
                        {t.s1FootnoteTerms}
                      </a>
                      {t.s1Footnote2}
                      <a
                        href="#"
                        style={{ color: LIME, textDecoration: "none" }}
                      >
                        {t.s1FootnotePrivacy}
                      </a>
                      {t.s1Footnote3}
                    </div>
                  </div>
                </>
              ) : (
                /* ════ STEP 2 CARD CONTENT: SIGNUP FORM ════ */
                <>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: -1,
                      lineHeight: 1.1,
                      marginBottom: 10,
                      textWrap: "balance" as never,
                    }}
                  >
                    {t.s2CardTitle1}
                    <br />
                    {t.s2CardTitle2}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: DIM,
                      lineHeight: 1.5,
                      marginBottom: 26,
                    }}
                  >
                    {t.s2CardSub}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSignup();
                    }}
                    autoComplete="on"
                    noValidate
                  >
                    <div
                      className="ag-form-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px 12px",
                      }}
                    >
                      {/* Nombre */}
                      <FieldInput
                        icon={<UserIcon />}
                        label={t.s2LabelName}
                        placeholder={t.s2PlaceholderFirst}
                        value={firstName}
                        onChange={setFirstName}
                        autoComplete="given-name"
                        required
                      />
                      {/* Apellido */}
                      <FieldInput
                        icon={<UserIcon />}
                        label={t.s2LabelLast}
                        placeholder={t.s2PlaceholderLast}
                        value={lastName}
                        onChange={setLastName}
                        autoComplete="family-name"
                        required
                      />
                      {/* Email - span 2 */}
                      <div
                        className="ag-span-2"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <FieldInput
                          icon={<MailIcon />}
                          label={t.s2LabelEmail}
                          placeholder={t.s2PlaceholderEmail}
                          type="email"
                          value={email}
                          onChange={setEmail}
                          autoComplete="email"
                          hint={t.s2HintLogin}
                          required
                        />
                      </div>
                      {/* Password - span 2 */}
                      <div
                        className="ag-span-2"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <FieldInput
                          icon={<LockIcon />}
                          label={t.s2LabelPw}
                          placeholder={t.s2PlaceholderPw}
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={setPassword}
                          autoComplete="new-password"
                          hint={t.s2HintPw}
                          required
                          right={
                            <button
                              type="button"
                              onClick={() => setShowPw(!showPw)}
                              style={{
                                background: "transparent",
                                border: 0,
                                color: DIM,
                                cursor: "pointer",
                                padding: "6px",
                                fontFamily: MONO,
                                fontSize: 9.5,
                                letterSpacing: 1.2,
                                textTransform: "uppercase",
                              }}
                            >
                              {showPw ? t.s2PwToggleHide : t.s2PwToggleShow}
                            </button>
                          }
                        />
                        {/* Password meter */}
                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                          {[0, 1, 2, 3].map((i) => (
                            <span
                              key={i}
                              style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 2,
                                background:
                                  i < strength
                                    ? strength === 1
                                      ? PASS
                                      : strength === 2
                                        ? WATCH
                                        : LIME
                                    : "rgba(245,245,242,0.08)",
                                boxShadow:
                                  i < strength && strength >= 3
                                    ? "0 0 6px rgba(212,255,58,0.4)"
                                    : "none",
                                transition: "all 0.3s",
                              }}
                            />
                          ))}
                        </div>
                        {/* Strength row */}
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontFamily: MONO,
                            fontSize: 9.5,
                            letterSpacing: 1.5,
                            color: DIM,
                            textTransform: "uppercase",
                          }}
                        >
                          <span>
                            {t.s2StrengthLabel} {"\u00B7"}{" "}
                            <span
                              style={{
                                color: strengthColor(strength),
                                fontWeight: 700,
                              }}
                            >
                              {strengthLabel(strength, lang)}
                            </span>
                          </span>
                          <span>
                            Aa {"\u00B7"} 0{"\u2013"}9 {"\u00B7"} 8+
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Consent */}
                    <div
                      onClick={() => setAgreed(!agreed)}
                      style={{
                        marginTop: 22,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          border: `1.5px solid ${agreed ? LIME : LINE2}`,
                          background: agreed ? LIME : "transparent",
                          flexShrink: 0,
                          marginTop: 1,
                          position: "relative",
                          transition: "all 0.15s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {agreed && (
                          <span
                            style={{
                              position: "absolute",
                              left: 4,
                              top: 1,
                              width: 5,
                              height: 9,
                              borderRight: `2px solid ${BG}`,
                              borderBottom: `2px solid ${BG}`,
                              transform: "rotate(45deg)",
                            }}
                          />
                        )}
                      </span>
                      <span
                        style={{ fontSize: 11.5, color: DIM, lineHeight: 1.5 }}
                      >
                        {t.s2Consent1}
                        <a
                          href="#"
                          style={{
                            color: INK,
                            textDecoration: "underline",
                            textDecorationColor: "rgba(245,245,242,0.3)",
                            textUnderlineOffset: 2,
                          }}
                        >
                          {t.s2ConsentTerms}
                        </a>
                        {t.s2Consent2}
                        <a
                          href="#"
                          style={{
                            color: INK,
                            textDecoration: "underline",
                            textDecorationColor: "rgba(245,245,242,0.3)",
                            textUnderlineOffset: 2,
                          }}
                        >
                          {t.s2ConsentPrivacy}
                        </a>
                        {t.s2Consent3}
                      </span>
                    </div>

                    {error && (
                      <p
                        style={{
                          fontFamily: DISPLAY,
                          fontSize: 13,
                          color: "#FF6464",
                          margin: "12px 0 0",
                        }}
                      >
                        {error}
                      </p>
                    )}

                    {/* CTA */}
                    <div
                      style={{
                        marginTop: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <button
                        type="submit"
                        disabled={!canSubmit || loading}
                        style={{
                          width: "100%",
                          padding: "16px 18px",
                          background: canSubmit ? LIME : `rgba(212,255,58,0.4)`,
                          color: BG,
                          border: 0,
                          borderRadius: 13,
                          fontFamily: DISPLAY,
                          fontWeight: 800,
                          fontSize: 15,
                          letterSpacing: -0.2,
                          cursor:
                            canSubmit && !loading ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          boxShadow: canSubmit
                            ? "0 12px 32px rgba(212,255,58,0.25)"
                            : "none",
                          transition: "transform 0.15s, box-shadow 0.15s",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading ? t.s2CtaLoading : `${t.s2Cta}${planName}`}{" "}
                        <span style={{ fontWeight: 700 }}>{"\u2192"}</span>
                      </button>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          letterSpacing: 1,
                          color: DIM,
                          textAlign: "center",
                          lineHeight: 1.5,
                        }}
                      >
                        {t.s2FootnoteQ}
                        <a
                          href={`/login?redirect=/plans&plan=${planKey}`}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(
                              `/login?redirect=/plans&plan=${planKey}`
                            );
                          }}
                          style={{ color: LIME, textDecoration: "none" }}
                        >
                          {t.s2FootnoteLink}
                        </a>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Trust strip */}
          <div
            style={{
              marginTop: 14,
              padding: "14px 18px",
              border: `1px solid ${LINE}`,
              borderRadius: 12,
              background: BG2,
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: 0.4,
              color: DIM,
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(212,255,58,0.08)",
                border: "1px solid rgba(212,255,58,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: LIME,
                flexShrink: 0,
              }}
            >
              {step === 1 ? <ShieldIcon /> : <ShieldCheckIcon />}
            </span>
            <span>
              {step === 1 ? (
                <>
                  {t.s1Trust}
                  <b style={{ color: INK, fontWeight: 600 }}>{t.s1Trustb}</b>
                  {t.s1Trustc}
                </>
              ) : (
                <>
                  <b style={{ color: INK, fontWeight: 600 }}>{t.s2Trust1}</b>
                  {t.s2Trust2}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Responsive + animations ═══ */}
      <style>{`
        @keyframes ag-pulse {
          0% { box-shadow: 0 0 0 0 rgba(212,255,58,0.55); }
          100% { box-shadow: 0 0 0 6px rgba(212,255,58,0); }
        }
        .ag-input::placeholder { color: ${DIMMER}; }
        @media (max-width: 980px) {
          .ag-main { grid-template-columns: 1fr !important; gap: 36px !important; }
          .ag-hero { font-size: 42px !important; letter-spacing: -1.6px !important; }
          .ag-topbar { padding: 18px 24px !important; }
          .ag-plan-strip { padding: 0 24px !important; flex-wrap: wrap !important; }
          .ag-main { padding: 0 24px 48px !important; }
        }
        @media (max-width: 640px) {
          .ag-form-grid { grid-template-columns: 1fr !important; }
          .ag-form-grid .ag-span-2 { grid-column: 1 !important; }
          .ag-oauth-row { grid-template-columns: 1fr !important; }
          .ag-hero { font-size: 34px !important; }
          .ag-topbar { flex-direction: column !important; gap: 14px !important; align-items: flex-start !important; }
          .ag-step-track { order: 3 !important; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DEFAULT EXPORT with Suspense wrapper
   ══════════════════════════════════════════════ */
export default function CheckoutAccountPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            background: BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: `2px solid ${LIME}`,
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      }
    >
      <AccountGateContent />
    </Suspense>
  );
}
