'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { LanguageSwitch } from '@/components/language-switch'
import { useLanguage } from '@/components/language-provider'
import { getLandingCopy } from '@/lib/landing-copy'

const navHrefs = ['#features', '#how-it-works', '#about', '#products', '#journal']
const partnerHrefs = ['/library', '/novels', '/stories', '/quotes']

function BrandMark() {
  return <Image className="brand-mark" src="/riwaq-mark.svg" alt="" width={28} height={28} priority />
}

export default function FluxoraLanding() {
  const { locale } = useLanguage()
  const copy = getLandingCopy(locale)
  const navLinks = copy.nav.map((label, index) => ({ label, href: navHrefs[index] }))
  const partners = copy.partners.map((label, index) => ({ label, href: partnerHrefs[index] }))
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const play = video.play()
    play?.catch(() => {})
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      setVideoReady(true)
    }
  }, [])

  return <>
    <a className="skip-link" href="#main">{copy.skip}</a>
    <header className="nav">
      <a className="nav-brand" href="#main"><BrandMark/><span>Riwaq</span></a>
      <nav className="nav-pill" aria-label={copy.primaryNav}><ul>{navLinks.map(({ label, href }, i) => <li key={label}><a href={href}>{label}{i === 0 && <span className="chevron" aria-hidden="true"/>}</a></li>)}</ul></nav>
      <div className="nav-actions"><LanguageSwitch /><a className="light-button" href="/sign-in">{copy.signIn}</a><button className="nav-burger" aria-label={menuOpen ? copy.closeMenu : copy.openMenu} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? '×' : <><i/><i/></>}</button></div>
      {menuOpen && <div className="nav-sheet"><ul>{navLinks.map(({ label, href }) => <li key={label}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>)}</ul><a className="flame-button" href="/sign-up" onClick={() => setMenuOpen(false)}>{copy.createAccount}</a></div>}
    </header>
    <main id="main" className="hero">
      <div className="hero-media"><video ref={videoRef} className={`hero-video${videoReady ? ' is-ready' : ''}`} src="/hero-loop.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => setVideoReady(true)}/><div className="hero-scrim"/><div className="hero-rules"><i/><i/><i/></div></div>
      <div className="hero-inner">
        <div className="hero-lead">
          <p className="hero-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.7 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.7-3.7-9S9.5 5.6 12 3Z"/></svg><span>{copy.heroNote}</span></p>
          <h1 className="hero-title">{copy.heroTitleOne}<br/>{copy.heroTitleTwo}<br/><em>{copy.heroTitleThree}</em></h1>
          <p className="hero-sub">{copy.heroSubtitle}</p>
          <div className="hero-cta"><a className="flame-button" href="/sign-up">{copy.startReading}<span className="arrow-dot" aria-hidden="true">↗</span></a><a className="hero-login-link" href="/sign-in">{copy.existingAccount}</a><div className="hero-proof"><div className="hero-faces" aria-hidden="true"><i/><i/><i/><i/></div><span className="proof-text"><strong>{copy.proofTitle}</strong>{copy.proofSubtitle}</span></div></div>
          <ul className="hero-stats"><li className="stat"><span className="stat-mark">*</span><span className="stat-value">{copy.stats[0]}</span><span className="stat-label">{copy.stats[2]}</span><span className="stat-rule"/></li><li className="stat"><span className="stat-mark">*</span><span className="stat-value">{copy.stats[1]}</span><span className="stat-label">{copy.stats[3]}</span><span className="stat-rule"/></li></ul>
        </div>
        <aside className="hero-ghost" aria-hidden="true"><div className="ghost-row"><div className="ghost-bars">{[34,52,44,70,88].map((height, i) => <span key={i} style={{height: `${height}%`}}/>)}</div><p className="ghost-kpi"><strong>{copy.ghostLabel}</strong>{copy.ghostWords}<br/>{copy.ghostDiscover}</p></div><h2>{copy.ghostTitle}</h2><p>{copy.ghostCopy}</p></aside>
      </div>
      <footer className="hero-foot"><span className="hero-watermark" aria-hidden="true">{copy.watermark}</span><div className="hero-partners"><span className="partners-label">{copy.discoverLabel}</span><ul>{partners.map((partner, i) => <li key={partner.label}><a href={partner.href}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d={['M3 4.5A1.5 1.5 0 0 1 4.5 3H9v14H4.5A1.5 1.5 0 0 1 3 15.5v-11ZM17 4.5A1.5 1.5 0 0 0 15.5 3H11v14h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z','M2 3h16l-5.6 6.9L18 17H2l5.6-7.1L2 3Z','M10 2.5 17 10l-7 7.5L3 10l7-7.5Z','M2 16V6l4.5 6L11 6l4.5 6L20 6v10','M2 5l3.5 11L9 8l3.5 8L16 5'][i]} strokeWidth="1.4"/></svg>{partner.label}</a></li>)}</ul></div></footer>
    </main>
    <section id="features" className="content-section"><div className="section-heading"><span>{copy.featureKicker}</span><h2>{copy.featureTitle}<br/><em>{copy.featureTitleEm}</em></h2><p>{copy.featureCopy}</p></div><div className="feature-grid">{copy.featureCards.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section id="how-it-works" className="content-section section-alt"><div className="section-heading"><span>{copy.journeyKicker}</span><h2>{copy.journeyTitle}<br/><em>{copy.journeyTitleEm}</em></h2><p>{copy.journeyCopy}</p></div><ol className="steps-grid">{copy.steps.map(([title, description], index) => <li key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{description}</p></li>)}</ol></section>
    <section id="about" className="content-section about-section"><div className="section-heading"><span>{copy.aboutKicker}</span><h2>{copy.aboutTitle}<br/><em>{copy.aboutTitleEm}</em></h2></div><p className="about-copy">{copy.aboutCopy}</p></section>
    <section id="products" className="content-section section-alt"><div className="section-heading"><span>{copy.exploreKicker}</span><h2>{copy.exploreTitle}<br/><em>{copy.exploreTitleEm}</em></h2><p>{copy.exploreCopy}</p></div><div className="product-grid">{copy.products.map(([tag, title, description, action], index) => <a id={['bookstore', 'novels', 'stories', 'quotes'][index]} className="product-card" href={['/library', '/novels', '/stories', '/quotes'][index]} key={title}><span>{tag}</span><h3>{title}</h3><p>{description}</p><b>{action} <span aria-hidden="true">↗</span></b></a>)}</div></section>
    <section id="journal" className="content-section journal-section"><div className="section-heading"><span>{copy.journalKicker}</span><h2>{copy.journalTitle}<br/><em>{copy.journalTitleEm}</em></h2></div><a className="journal-link" href="/sign-up"><span><small>{copy.journalMeta}</small><strong>{copy.journalLink}</strong></span><b aria-hidden="true">↗</b></a></section>
    <footer className="site-footer"><a className="nav-brand" href="#main"><BrandMark/><span>Riwaq</span></a><span>{copy.footer}</span><div><a href="/sign-in">{copy.signIn}</a><a href="/sign-up">{copy.getStarted}</a></div></footer>
  </>
}
