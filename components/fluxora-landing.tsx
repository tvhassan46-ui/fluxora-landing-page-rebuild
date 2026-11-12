'use client'

import { useEffect, useRef, useState } from 'react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Product', href: '#products' },
  { label: 'Blogs', href: '#journal' },
]
const partners = [
  { label: 'BookStore', href: '/library' },
  { label: 'الروايات', href: '/novels' },
  { label: 'اقتباسات', href: '/quotes' },
  { label: 'Mercury', href: '#products' },
  { label: 'Wagon', href: '#products' },
]

function BrandMark() {
  return <svg className="brand-mark" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M14 1.6 20.3 8 14 14.4 7.7 8 14 1.6Z" fill="#FF6A00"/><path d="M6.4 9.3 12.7 15.7 6.4 22.1.1 15.7 6.4 9.3Z" fill="#FF3D00"/><path d="m21.6 9.3 6.3 6.4-6.3 6.4-6.3-6.4 6.3-6.4Z" fill="#FF9A2E"/></svg>
}

export default function FluxoraLanding() {
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
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="nav">
      <a className="nav-brand" href="#main"><BrandMark/><span>Fluxora</span></a>
      <nav className="nav-pill" aria-label="Primary"><ul>{navLinks.map(({ label, href }, i) => <li key={label}><a href={href}>{label}{i === 0 && <span className="chevron" aria-hidden="true"/>}</a></li>)}</ul></nav>
      <div className="nav-actions"><a className="light-button" href="/sign-in">Sign in</a><button className="nav-burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? '×' : <><i/><i/></>}</button></div>
      {menuOpen && <div className="nav-sheet"><ul>{navLinks.map(({ label, href }) => <li key={label}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>)}</ul><a className="flame-button" href="/sign-up" onClick={() => setMenuOpen(false)}>Create account</a></div>}
    </header>
    <main id="main" className="hero">
      <div className="hero-media"><video ref={videoRef} className={`hero-video${videoReady ? ' is-ready' : ''}`} src="/hero-loop.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => setVideoReady(true)}/><div className="hero-scrim"/><div className="hero-rules"><i/><i/><i/></div></div>
      <div className="hero-inner">
        <div className="hero-lead">
          <p className="hero-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.7 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.7-3.7-9S9.5 5.6 12 3Z"/></svg><span>Hub support peoples from<br/>all over the world</span></p>
          <h1 className="hero-title">Technology<br/>Crafted for All<br/>Not <em>Machines</em></h1>
          <p className="hero-sub">We create clear, intuitive, and accessible digital experiences shaped by real human behavior.</p>
          <div className="hero-cta"><a className="flame-button" href="/sign-up">Get started<span className="arrow-dot" aria-hidden="true">↗</span></a><a className="hero-login-link" href="/sign-in">Already have an account? Sign in</a><div className="hero-proof"><div className="hero-faces" aria-hidden="true"><i/><i/><i/><i/></div><span className="proof-text"><strong>650+ Happy Clients</strong>Live Support</span></div></div>
          <ul className="hero-stats"><li className="stat"><span className="stat-mark">*</span><span className="stat-value">150+</span><span className="stat-label">Projects delivered</span><span className="stat-rule"/></li><li className="stat"><span className="stat-mark">*</span><span className="stat-value">98%</span><span className="stat-label">Client satisfaction</span><span className="stat-rule"/></li></ul>
        </div>
        <aside className="hero-ghost" aria-hidden="true"><div className="ghost-row"><div className="ghost-bars">{[34,52,44,70,88].map((height, i) => <span key={i} style={{height: `${height}%`}}/>)}</div><p className="ghost-kpi"><strong>+42%</strong>Experience<br/>Performance</p></div><h2>Measure Real Impact</h2><p>We track user response through meaningful metrics and refine every detail until the experience feels effortless.</p></aside>
      </div>
      <footer className="hero-foot"><span className="hero-watermark" aria-hidden="true">AIM</span><div className="hero-partners"><span className="partners-label">Read &amp; discover</span><ul>{partners.map((partner, i) => <li key={partner.label}><a href={partner.href}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d={['M3 4.5A1.5 1.5 0 0 1 4.5 3H9v14H4.5A1.5 1.5 0 0 1 3 15.5v-11ZM17 4.5A1.5 1.5 0 0 0 15.5 3H11v14h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z','M2 3h16l-5.6 6.9L18 17H2l5.6-7.1L2 3Z','M10 2.5 17 10l-7 7.5L3 10l7-7.5Z','M2 16V6l4.5 6L11 6l4.5 6L20 6v10','M2 5l3.5 11L9 8l3.5 8L16 5'][i]} strokeWidth="1.4"/></svg>{partner.label}</a></li>)}</ul></div></footer>
    </main>
    <section id="features" className="content-section"><div className="section-heading"><span>01 / Features</span><h2>Less friction.<br/><em>More meaning.</em></h2><p>Digital experiences built to feel clear, accessible, and effortless for the people using them.</p></div><div className="feature-grid"><article><span>01</span><h3>Human-first design</h3><p>Interfaces shaped around real people, not assumptions.</p></article><article><span>02</span><h3>Accessible by default</h3><p>Thoughtful details that make every interaction easier to use.</p></article><article><span>03</span><h3>Built to grow</h3><p>A flexible foundation for products and teams as they evolve.</p></article></div></section>
    <section id="how-it-works" className="content-section section-alt"><div className="section-heading"><span>02 / How it works</span><h2>From first idea<br/>to <em>what&apos;s next.</em></h2><p>A clear, collaborative process keeps each step moving with purpose.</p></div><ol className="steps-grid"><li><b>01</b><h3>Discover</h3><p>We learn about your people, product, and goals.</p></li><li><b>02</b><h3>Shape</h3><p>We turn the challenge into a clear experience direction.</p></li><li><b>03</b><h3>Build</h3><p>We craft, test, and refine the details together.</p></li><li><b>04</b><h3>Launch</h3><p>We deliver a thoughtful product ready for real use.</p></li></ol></section>
    <section id="about" className="content-section about-section"><div className="section-heading"><span>03 / About Fluxora</span><h2>Technology is<br/>better when it&apos;s <em>human.</em></h2></div><p className="about-copy">We bring strategy, design, and technology together to make digital products that serve people first. Every choice should make the experience more useful, welcoming, and clear.</p></section>
    <section id="products" className="content-section section-alt"><div className="section-heading"><span>04 / Explore Fluxora</span><h2>Books, stories<br/>and <em>ideas.</em></h2><p>Read classic Arabic books for free, follow their stories, and keep the lines you love.</p></div><div className="product-grid"><a id="bookstore" className="product-card" href="/library"><span>01 / مكتبة مجانية</span><h3>BookStore</h3><p>كتب تراثية مع أغلفة خاصة، وفصول للقراءة المجانية مع مصدر كل كتاب.</p><b>افتح المكتبة <span aria-hidden="true">↗</span></b></a><a id="zantic" className="product-card" href="/novels"><span>02 / روايات وحكايات</span><h3>الروايات</h3><p>اقرأ أعمالًا أدبية عربية فصلًا بعد فصل، من «حي بن يقظان» إلى حكايات الليالي.</p><b>اكتشف الروايات <span aria-hidden="true">↗</span></b></a><a id="crona" className="product-card" href="/quotes"><span>03 / مختارات أدبية</span><h3>اقتباسات</h3><p>أبيات عربية خالدة، منسوبة إلى أصحابها ومرتبطة بنصوصها الأصلية.</p><b>تصفّح الاقتباسات <span aria-hidden="true">↗</span></b></a></div></section>
    <section id="journal" className="content-section journal-section"><div className="section-heading"><span>05 / Journal</span><h2>Notes on making<br/>things <em>better.</em></h2></div><a className="journal-link" href="/sign-up"><span><small>Design / 5 min read</small><strong>Designing digital experiences for people, not screens</strong></span><b aria-hidden="true">↗</b></a></section>
    <footer className="site-footer"><a className="nav-brand" href="#main"><BrandMark/><span>Fluxora</span></a><span>Thoughtful technology, made for people.</span><div><a href="/sign-in">Sign in</a><a href="/sign-up">Get started</a></div></footer>
  </>
}
