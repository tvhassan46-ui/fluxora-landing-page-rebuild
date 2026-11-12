'use client'

import { useEffect, useRef, useState } from 'react'

const navLinks = ['Features', 'How It Works', 'About', 'Product', 'Blogs']
const partners = ['BookStore', 'zantic', 'Crona', 'Mercury', 'Wagon']

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
      <nav className="nav-pill" aria-label="Primary"><ul>{navLinks.map((label, i) => <li key={label}><a href="#main">{label}{i === 0 && <span className="chevron" aria-hidden="true"/>}</a></li>)}</ul></nav>
      <div className="nav-actions"><a className="light-button" href="#main">Get Started</a><button className="nav-burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? '×' : <><i/><i/></>}</button></div>
      {menuOpen && <div className="nav-sheet"><ul>{navLinks.map(label => <li key={label}><a href="#main" onClick={() => setMenuOpen(false)}>{label}</a></li>)}</ul><a className="flame-button" href="#main" onClick={() => setMenuOpen(false)}>Get Started</a></div>}
    </header>
    <main id="main" className="hero">
      <div className="hero-media"><video ref={videoRef} className={`hero-video${videoReady ? ' is-ready' : ''}`} src="/hero-loop.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" onCanPlay={() => setVideoReady(true)}/><div className="hero-scrim"/><div className="hero-rules"><i/><i/><i/></div></div>
      <div className="hero-inner">
        <div className="hero-lead">
          <p className="hero-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.7 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.7-3.7-9S9.5 5.6 12 3Z"/></svg><span>Hub support peoples from<br/>all over the world</span></p>
          <h1 className="hero-title">Technology<br/>Crafted for All<br/>Not <em>Machines</em></h1>
          <p className="hero-sub">We create clear, intuitive, and accessible digital experiences shaped by real human behavior.</p>
          <div className="hero-cta"><a className="flame-button" href="#main">Get started<span className="arrow-dot" aria-hidden="true">↗</span></a><div className="hero-proof"><div className="hero-faces" aria-hidden="true"><i/><i/><i/><i/></div><span className="proof-text"><strong>650+ Happy Clients</strong>Live Support</span></div></div>
          <ul className="hero-stats"><li className="stat"><span className="stat-mark">*</span><span className="stat-value">150+</span><span className="stat-label">Projects delivered</span><span className="stat-rule"/></li><li className="stat"><span className="stat-mark">*</span><span className="stat-value">98%</span><span className="stat-label">Client satisfaction</span><span className="stat-rule"/></li></ul>
        </div>
        <aside className="hero-ghost" aria-hidden="true"><div className="ghost-row"><div className="ghost-bars">{[34,52,44,70,88].map((height, i) => <span key={i} style={{height: `${height}%`}}/>)}</div><p className="ghost-kpi"><strong>+42%</strong>Experience<br/>Performance</p></div><h2>Measure Real Impact</h2><p>We track user response through meaningful metrics and refine every detail until the experience feels effortless.</p></aside>
      </div>
      <footer className="hero-foot"><span className="hero-watermark" aria-hidden="true">AIM</span><div className="hero-partners"><span className="partners-label">Our Partners</span><ul>{partners.map((partner, i) => <li key={partner}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d={['M3 4.5A1.5 1.5 0 0 1 4.5 3H9v14H4.5A1.5 1.5 0 0 1 3 15.5v-11ZM17 4.5A1.5 1.5 0 0 0 15.5 3H11v14h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z','M2 3h16l-5.6 6.9L18 17H2l5.6-7.1L2 3Z','M10 2.5 17 10l-7 7.5L3 10l7-7.5Z','M2 16V6l4.5 6L11 6l4.5 6L20 6v10','M2 5l3.5 11L9 8l3.5 8L16 5'][i]} strokeWidth="1.4"/></svg>{partner}</li>)}</ul></div></footer>
    </main>
  </>
}
