'use client'

import { useEffect, useRef, useState } from 'react'

const navLinks = [
  { label: 'Discover', href: '#features' },
  { label: 'Reading guide', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Our library', href: '#products' },
  { label: 'Reading notes', href: '#journal' },
]
const partners = [
  { label: 'BookStore', href: '/library' },
  { label: 'الروايات', href: '/novels' },
  { label: 'اقتباسات', href: '/quotes' },
  { label: 'Classics', href: '#products' },
  { label: 'Poetry', href: '#products' },
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
      <a className="nav-brand" href="#main"><BrandMark/><span>Hikaya</span></a>
      <nav className="nav-pill" aria-label="Primary"><ul>{navLinks.map(({ label, href }, i) => <li key={label}><a href={href}>{label}{i === 0 && <span className="chevron" aria-hidden="true"/>}</a></li>)}</ul></nav>
      <div className="nav-actions"><a className="light-button" href="/sign-in">Sign in</a><button className="nav-burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? '×' : <><i/><i/></>}</button></div>
      {menuOpen && <div className="nav-sheet"><ul>{navLinks.map(({ label, href }) => <li key={label}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>)}</ul><a className="flame-button" href="/sign-up" onClick={() => setMenuOpen(false)}>Create account</a></div>}
    </header>
    <main id="main" className="hero">
      <div className="hero-media"><video ref={videoRef} className={`hero-video${videoReady ? ' is-ready' : ''}`} src="/hero-loop.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => setVideoReady(true)}/><div className="hero-scrim"/><div className="hero-rules"><i/><i/><i/></div></div>
      <div className="hero-inner">
        <div className="hero-lead">
          <p className="hero-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.7 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.7-3.7-9S9.5 5.6 12 3Z"/></svg><span>Timeless books and stories<br/>for every kind of reader</span></p>
          <h1 className="hero-title">Books &amp; Novels<br/>Stories for All<br/><em>Readers</em></h1>
          <p className="hero-sub">Discover timeless books, captivating novels, and literary quotes—all gathered in one welcoming library.</p>
          <div className="hero-cta"><a className="flame-button" href="/sign-up">Start reading<span className="arrow-dot" aria-hidden="true">↗</span></a><a className="hero-login-link" href="/sign-in">Already have an account? Sign in</a><div className="hero-proof"><div className="hero-faces" aria-hidden="true"><i/><i/><i/><i/></div><span className="proof-text"><strong>A growing library</strong>Books, novels &amp; poetry</span></div></div>
          <ul className="hero-stats"><li className="stat"><span className="stat-mark">*</span><span className="stat-value">Books</span><span className="stat-label">Classic works</span><span className="stat-rule"/></li><li className="stat"><span className="stat-mark">*</span><span className="stat-value">Novels</span><span className="stat-label">Stories to discover</span><span className="stat-rule"/></li></ul>
        </div>
        <aside className="hero-ghost" aria-hidden="true"><div className="ghost-row"><div className="ghost-bars">{[34,52,44,70,88].map((height, i) => <span key={i} style={{height: `${height}%`}}/>)}</div><p className="ghost-kpi"><strong>WORDS</strong>Stories<br/>to discover</p></div><h2>Find your next read</h2><p>Browse Arabic classics, memorable novels, and poetry collected for curious readers.</p></aside>
      </div>
      <footer className="hero-foot"><span className="hero-watermark" aria-hidden="true">READ</span><div className="hero-partners"><span className="partners-label">Read &amp; discover</span><ul>{partners.map((partner, i) => <li key={partner.label}><a href={partner.href}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d={['M3 4.5A1.5 1.5 0 0 1 4.5 3H9v14H4.5A1.5 1.5 0 0 1 3 15.5v-11ZM17 4.5A1.5 1.5 0 0 0 15.5 3H11v14h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z','M2 3h16l-5.6 6.9L18 17H2l5.6-7.1L2 3Z','M10 2.5 17 10l-7 7.5L3 10l7-7.5Z','M2 16V6l4.5 6L11 6l4.5 6L20 6v10','M2 5l3.5 11L9 8l3.5 8L16 5'][i]} strokeWidth="1.4"/></svg>{partner.label}</a></li>)}</ul></div></footer>
    </main>
    <section id="features" className="content-section"><div className="section-heading"><span>01 / Discover</span><h2>Pages to turn.<br/><em>Stories to keep.</em></h2><p>A welcoming home for classic books, novels, and the words you want to remember.</p></div><div className="feature-grid"><article><span>01</span><h3>Classic books</h3><p>Explore timeless Arabic works, presented chapter by chapter.</p></article><article><span>02</span><h3>Stories &amp; novels</h3><p>Follow captivating tales at your own pace.</p></article><article><span>03</span><h3>Favorite lines</h3><p>Keep poems and memorable quotations close.</p></article></div></section>
    <section id="how-it-works" className="content-section section-alt"><div className="section-heading"><span>02 / Your reading journey</span><h2>Choose a story<br/>and <em>settle in.</em></h2><p>Find a new favorite, follow it one chapter at a time, and come back whenever you like.</p></div><ol className="steps-grid"><li><b>01</b><h3>Pick a shelf</h3><p>Browse books, novels, and literary selections.</p></li><li><b>02</b><h3>Choose a title</h3><p>Find a story that suits your mood.</p></li><li><b>03</b><h3>Read a chapter</h3><p>Enjoy timeless writing at your own pace.</p></li><li><b>04</b><h3>Discover more</h3><p>Explore quotes, poetry, and other favorites.</p></li></ol></section>
    <section id="about" className="content-section about-section"><div className="section-heading"><span>03 / About Hikaya</span><h2>A home for<br/>the <em>stories that stay.</em></h2></div><p className="about-copy">Hikaya brings Arabic books, novels, and literary quotations together in one welcoming reading space. Explore classic works, follow stories chapter by chapter, and discover words worth remembering.</p></section>
    <section id="products" className="content-section section-alt"><div className="section-heading"><span>04 / Explore Hikaya</span><h2>Books, stories<br/>and <em>ideas.</em></h2><p>Find classic books, captivating novels, and memorable Arabic verses—all collected for curious readers.</p></div><div className="product-grid"><a id="bookstore" className="product-card" href="/library"><span>01 / مكتبة مجانية</span><h3>BookStore</h3><p>كتب تراثية مع أغلفة خاصة، وفصول للقراءة المجانية مع مصدر كل كتاب.</p><b>افتح المكتبة <span aria-hidden="true">↗</span></b></a><a id="zantic" className="product-card" href="/novels"><span>02 / روايات وحكايات</span><h3>الروايات</h3><p>اقرأ أعمالًا أدبية عربية فصلًا بعد فصل، من «حي بن يقظان» إلى حكايات الليالي.</p><b>اكتشف الروايات <span aria-hidden="true">↗</span></b></a><a id="crona" className="product-card" href="/quotes"><span>03 / مختارات أدبية</span><h3>اقتباسات</h3><p>أبيات عربية خالدة، منسوبة إلى أصحابها ومرتبطة بنصوصها الأصلية.</p><b>تصفّح الاقتباسات <span aria-hidden="true">↗</span></b></a></div></section>
    <section id="journal" className="content-section journal-section"><div className="section-heading"><span>05 / From the reading room</span><h2>Words that linger<br/>after <em>the last page.</em></h2></div><a className="journal-link" href="/sign-up"><span><small>Reading / 4 min</small><strong>Why classic stories still speak to us</strong></span><b aria-hidden="true">↗</b></a></section>
    <footer className="site-footer"><a className="nav-brand" href="#main"><BrandMark/><span>Hikaya</span></a><span>A home for books, novels, and literary favorites.</span><div><a href="/sign-in">Sign in</a><a href="/sign-up">Get started</a></div></footer>
  </>
}
