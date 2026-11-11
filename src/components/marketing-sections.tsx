"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown, Clipboard, Download, Gauge, Infinity, Link2, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { UI_CONTENT } from "@/config/ui-content";
import { GUIDE_CONTENT } from "@/config/guide-content";
import type { Locale } from "@/config/locales";

const featureIcons = [Gauge, Infinity, ShieldCheck, MonitorSmartphone];
export function FeatureCards({ locale }: { locale: Locale }) { const copy = UI_CONTENT[locale].marketing; return <section className="feature-grid" aria-label={copy.benefitsAria}>{copy.features.map(([title, text], index) => { const Icon = featureIcons[index]; return <article className="feature-card" key={title}><span><Icon/></span><div><h3>{title}</h3><p>{text}</p></div></article>; })}</section>; }

const stepIcons = [Link2, Clipboard, ShieldCheck, Download];
export function HowItWorks({ locale }: { locale: Locale }) { const copy = GUIDE_CONTENT[locale].guide; return <section className="how-section" id="guide"><div><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><div className="steps">{copy.steps.map(([title, text], index) => { const Icon = stepIcons[index]; return <div className="step" key={title}><span className="step-number">{index + 1}</span><span className="step-icon"><Icon/></span><div><h3>{title}</h3><p>{text}</p></div>{index < copy.steps.length - 1 && <ArrowRight className="step-arrow"/>}</div>; })}</div></div><Faq locale={locale}/></section>; }

function Faq({ locale }: { locale: Locale }) { const copy = GUIDE_CONTENT[locale].faq; return <div className="faq" id="faq"><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><Accordion.Root type="single" collapsible>{copy.items.map(([question, answer], index) => <Accordion.Item value={`faq-${index}`} key={question}><Accordion.Header><Accordion.Trigger>{question}<ChevronDown/></Accordion.Trigger></Accordion.Header><Accordion.Content>{answer}</Accordion.Content></Accordion.Item>)}</Accordion.Root></div>; }
