import React, { useState } from "react";

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .about-root { background: #05070A; font-family: 'DM Sans', sans-serif; color: #fff; overflow-x: hidden; }

  /* HERO */
  .hero-section { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 100px 24px 80px; overflow: hidden; }
  .hero-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%); }
  .hero-glow { position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 700px; height: 400px; background: radial-gradient(ellipse, rgba(56,189,248,0.12) 0%, transparent 65%); pointer-events: none; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: 100px; padding: 6px 18px; font-size: 12px; font-weight: 600; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 28px; }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
  .hero-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(36px, 7vw, 76px); line-height: 1.05; letter-spacing: -1px; color: #fff; margin-bottom: 24px; }
  .hero-title span { color: #38bdf8; }
  .hero-sub { color: #94A3B8; font-size: clamp(15px, 2vw, 18px); line-height: 1.8; max-width: 580px; margin: 0 auto 44px; }
  .hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-primary { background: #38bdf8; color: #000; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.22s; letter-spacing: 0.3px; }
  .btn-primary:hover { background: #7dd3fc; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(56,189,248,0.3); }
  .btn-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.15); padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.22s; }
  .btn-outline:hover { border-color: #38bdf8; color: #38bdf8; transform: translateY(-2px); }

  /* STATS */
  .stats-wrap { background: #0A0D14; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 64px 24px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; max-width: 1000px; margin: 0 auto; }
  .stat-item { text-align: center; padding: 32px 20px; position: relative; }
  .stat-item:not(:last-child)::after { content: ''; position: absolute; right: 0; top: 20%; bottom: 20%; width: 1px; background: rgba(255,255,255,0.06); }
  .stat-num { font-family: 'Orbitron', sans-serif; font-size: clamp(32px, 5vw, 52px); font-weight: 900; color: #38bdf8; line-height: 1; margin-bottom: 10px; }
  .stat-label { color: #64748B; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
  .glow-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent); border: none; margin: 0; }

  /* MISSION & VISION — Asymmetric Split */
  .mv-section { padding: 110px 24px; max-width: 1200px; margin: 0 auto; }
  .eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #38bdf8; margin-bottom: 20px; }
  .eyebrow-line { width: 32px; height: 1px; background: linear-gradient(90deg, #38bdf8, transparent); }
  .section-heading { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(28px, 4.5vw, 48px); line-height: 1.1; color: #fff; margin-bottom: 56px; max-width: 540px; }
  .section-heading em { color: #38bdf8; font-style: normal; }
  .mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .mv-mission { background: #000001; border: 1px solid rgba(255,255,255,0.07); border-radius: 28px; padding: 52px 48px; position: relative; overflow: hidden; transition: border-color 0.35s, transform 0.35s; }
  .mv-mission:hover { border-color: rgba(56,189,248,0.35); transform: translateY(-6px); }
  .mv-vision-stack { display: flex; flex-direction: column; gap: 20px; }
  .mv-vision-top { background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(56,189,248,0.02) 100%); border: 1px solid rgba(56,189,248,0.18); border-radius: 28px; padding: 40px; position: relative; overflow: hidden; flex: 1; transition: border-color 0.35s, transform 0.35s; }
  .mv-vision-top:hover { border-color: rgba(56,189,248,0.45); transform: translateY(-4px); }
  .mv-vision-bottom { background: #0D1117; border: 1px solid rgba(255,255,255,0.05); border-radius: 28px; padding: 32px 40px; display: flex; align-items: center; gap: 20px; transition: border-color 0.35s, transform 0.35s; }
  .mv-vision-bottom:hover { border-color: rgba(56,189,248,0.2); transform: translateY(-3px); }
  .card-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .card-tag { display: inline-block; font-size: 9px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #38bdf8; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.15); border-radius: 100px; padding: 4px 12px; margin-bottom: 18px; }
  .icon-wrap { width: 58px; height: 58px; border-radius: 16px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.18); display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 28px; flex-shrink: 0; }
  .card-h3 { font-family: 'Orbitron', sans-serif; font-size: clamp(17px, 2.2vw, 22px); font-weight: 800; color: #fff; margin-bottom: 16px; line-height: 1.25; }
  .card-p { color: #94A3B8; font-size: 14.5px; line-height: 1.85; }
  .mini-stats { display: flex; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; margin-top: 36px; }
  .mini-stat { flex: 1; padding: 20px 16px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); }
  .mini-stat:last-child { border-right: none; }
  .mini-stat-num { font-family: 'Orbitron', sans-serif; font-size: 22px; font-weight: 900; color: #38bdf8; line-height: 1; }
  .mini-stat-lbl { color: #64748B; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 5px; }
  .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.07); flex-shrink: 0; }
  .globe-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.15); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .big-num { font-family: 'Orbitron', sans-serif; font-size: 36px; font-weight: 900; color: #38bdf8; line-height: 1; white-space: nowrap; }
  .big-lbl { color: #64748B; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* VALUES — Bento */
  .vals-section { padding: 0 24px 110px; max-width: 1200px; margin: 0 auto; }
  .vals-bento { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: minmax(180px, auto); gap: 16px; }
  .vb-1 { grid-column: span 5; grid-row: span 2; }
  .vb-2 { grid-column: span 7; }
  .vb-3 { grid-column: span 4; }
  .vb-4 { grid-column: span 3; }
  .vb-5 { grid-column: span 6; }
  .vb-6 { grid-column: span 6; }
  .vb-card { background: #0A0D14; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 32px; position: relative; overflow: hidden; cursor: default; transition: all 0.32s cubic-bezier(0.23,1,0.32,1); }
  .vb-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 24px 60px rgba(0,0,0,0.6); }
  .vb-inner { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; }
  .vb-card.feat { background: linear-gradient(145deg, #0d1a2a 0%, #0a1520 50%, #05070A 100%); border-color: rgba(56,189,248,0.2); }
  .vb-card.feat:hover { border-color: rgba(56,189,248,0.45); }
  .vb-card.acc { background: linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(56,189,248,0.03) 100%); border-color: rgba(56,189,248,0.2); }
  .vb-card.acc:hover { border-color: rgba(56,189,248,0.5); }
  .vb-bg-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .vb-num { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: rgba(56,189,248,0.35); margin-bottom: 16px; }
  .vb-icon { font-size: 32px; margin-bottom: 16px; display: block; }
  .vb-title { font-family: 'Orbitron', sans-serif; font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 12px; line-height: 1.3; }
  .vb-desc { color: #64748B; font-size: 13px; line-height: 1.75; flex: 1; }
  .vb-arrow { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.15); color: #38bdf8; font-size: 16px; margin-top: 20px; align-self: flex-start; transition: all 0.22s; }
  .vb-card:hover .vb-arrow { background: rgba(56,189,248,0.18); transform: translate(2px,-2px); }

  /* CTA */
  .cta-section { padding: 96px 24px 110px; height: auto;}
  .cta-outer { max-width: 1200px; margin: 0 auto; position: relative; border-radius: 32px; overflow: hidden; border: 1px solid rgba(56,189,248,0.12); }
  .cta-bg { position: absolute; inset: 0; background: #05070A; }
  .cta-bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 20%, transparent 100%); }
  .cta-orb-l { position: absolute; left: -120px; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%); pointer-events: none; }
  .cta-orb-r { position: absolute; right: -120px; top: 50%; transform: translateY(-50%); width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 65%); pointer-events: none; }
  .cta-inner { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center; padding: 80px 72px; }
  .cta-kicker { display: inline-flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #38bdf8; margin-bottom: 20px; }
  .cta-kicker-dot { width: 5px; height: 5px; border-radius: 50%; background: #38bdf8; animation: pulse 2s infinite; }
  .cta-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: clamp(28px, 4.5vw, 52px); line-height: 1.1; color: #fff; margin-bottom: 18px; }
  .cta-title em { color: #38bdf8; font-style: normal; }
  .cta-sub { color: #94A3B8; font-size: 15px; line-height: 1.8; max-width: 500px; }
  .cta-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
  .cta-pill { display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 100px; padding: 6px 14px; font-size: 12px; color: #64748B; }
  .cta-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
  .cta-right { display: flex; flex-direction: column; gap: 14px; flex-shrink: 0; min-width: 210px; }
  .btn-p { background: #38bdf8; color: #000; border: none; padding: 15px 30px; border-radius: 13px; font-weight: 800; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.22s; width: 100%; }
  .btn-p:hover { background: #7dd3fc; transform: translateY(-2px); box-shadow: 0 14px 36px rgba(56,189,248,0.35); }
  .btn-o { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 15px 30px; border-radius: 13px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.22s; width: 100%; }
  .btn-o:hover { border-color: rgba(56,189,248,0.5); color: #38bdf8; transform: translateY(-2px); }
  .social-proof { text-align: center; margin-top: 8px; }
  .avatars { display: flex; justify-content: center; margin-bottom: 6px; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #05070A; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #000; font-family: 'Orbitron', sans-serif; margin-left: -8px; }
  .avatar:first-child { margin-left: 0; }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .vb-1 { grid-column: span 6; } .vb-2 { grid-column: span 6; } .vb-3 { grid-column: span 6; } .vb-4 { grid-column: span 6; } .vb-5 { grid-column: span 6; } .vb-6 { grid-column: span 6; }
    .cta-inner { grid-template-columns: 1fr; padding: 60px 48px; }
    .cta-right { flex-direction: row; min-width: auto; }
    .btn-p, .btn-o { width: auto; }
  }
  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .stat-item:nth-child(2)::after { display: none; }
    .mv-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .vals-bento { grid-template-columns: 1fr 1fr; grid-auto-rows: auto; }
    .vb-1,.vb-2,.vb-3,.vb-4,.vb-5,.vb-6 { grid-column: span 2; grid-row: span 1; }
  }
  @media (max-width: 600px) {
    .hero-section { min-height: auto; padding: 80px 20px 60px; }
    .hero-btns { flex-direction: column; align-items: center; }
    .btn-primary, .btn-outline { width: 100%; max-width: 280px; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .stat-item::after { display: none !important; }
    .mv-section { padding: 64px 20px; }
    .mv-mission { padding: 36px 28px; }
    .mv-vision-top { padding: 32px 28px; }
    .mv-vision-bottom { flex-wrap: wrap; }
    .vals-section { padding: 0 20px 64px; }
    .vals-bento { grid-template-columns: 1fr; }
    .vb-1,.vb-2,.vb-3,.vb-4,.vb-5,.vb-6 { grid-column: span 1; }
    .cta-section { padding: 64px 20px; }
    .cta-inner { padding: 44px 28px; }
    .cta-right { flex-direction: column; }
    .btn-p, .btn-o { width: 100%; }
  }
`;

const stats = [
  { num: "500+", label: "Expos Hosted" },
  { num: "12K+", label: "Exhibitors" },
  { num: "48",   label: "Countries" },
  { num: "1.2M", label: "Attendees" },
];

const values = [
  { cls: "vb-1 feat", icon: "🌐", title: "Global Reach", desc: "Connecting exhibitors and attendees from every corner of the world — breaking physical boundaries and making every expo truly international.", orbColor: "rgba(56,189,248,0.08)", orbSize: "300px", orbPos: { bottom: "-80px", right: "-80px" } },
  { cls: "vb-2 acc",  icon: "⚡", title: "Real-Time Sync", desc: "Live booth updates, instant meeting requests, and real-time analytics — everything happens the moment it should.", orbColor: "rgba(56,189,248,0.06)", orbSize: "200px", orbPos: { top: "-60px", right: "-60px" } },
  { cls: "vb-3",      icon: "🔒", title: "Enterprise Security", desc: "Bank-grade encryption and role-based access keep your expo data locked tight.", orbColor: "rgba(56,189,248,0.04)", orbSize: "150px", orbPos: { bottom: "-40px", left: "-40px" } },
  { cls: "vb-4",      icon: "🎯", title: "Smart Matching", desc: "AI-powered attendee–exhibitor matching ensures every connection counts.", orbColor: "rgba(56,189,248,0.05)", orbSize: "120px", orbPos: { top: "-30px", right: "-30px" } },
  { cls: "vb-5",      icon: "📊", title: "Deep Analytics", desc: "Understand booth traffic, session engagement, and full ROI in one dashboard.", orbColor: "rgba(56,189,248,0.04)", orbSize: "180px", orbPos: { bottom: "-50px", right: "-50px" } },
  { cls: "vb-6",      icon: "🤝", title: "24/7 Support", desc: "Our dedicated team is always on standby so your expo never hits a snag.", orbColor: "rgba(56,189,248,0.05)", orbSize: "140px", orbPos: { top: "-40px", left: "-40px" } },
];

export default function AboutUs() {
  return (
    <>
      <style>{globalCSS}</style>
      <div className="about-root">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-grid-bg" />
          <div className="hero-glow" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              About EventSphere
            </div>
            <h1 className="hero-title">
              Built for the<br /><span>Future of Expos</span>
            </h1>
            <p className="hero-sub">
              We are on a mission to redefine how the world experiences exhibitions — making every connection meaningful, every booth memorable, and every expo extraordinary.
            </p>
            <div className="hero-btns">
              <button className="btn-primary">Explore Expos</button>
              <button className="btn-outline">Become an Exhibitor</button>
            </div>
          </div>
        </section>

        <hr className="glow-divider" />

        {/* STATS */}
        <div className="stats-wrap">
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <hr className="glow-divider" />

        {/* MISSION & VISION — Single combined card, 2 columns */}
        <section style={{ padding:"96px 24px", maxWidth:1160, margin:"0 auto", height: "auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", color:"#38bdf8", marginBottom:14 }}>What drives us</div>
            <h2 style={{ fontFamily:"Orbitron,sans-serif", fontWeight:900, fontSize:"clamp(24px,4vw,38px)", color:"#fff", lineHeight:1.2, marginBottom:16 }}>Our Mission &amp; <span style={{color:"#38bdf8"}}>Vision</span></h2>
            <p style={{ color:"#94A3B8", fontSize:15, lineHeight:1.8, maxWidth:560, margin:"0 auto" }}>Every decision we make is guided by a clear purpose — to make expo experiences extraordinary for everyone involved.</p>
          </div>
          <div style={{ background:"#00060b", border:"1px solid rgba(255,255,255,0.06)", borderRadius:32, padding:"clamp(32px,5vw,64px)", position:"relative", overflow:"hidden" }}>
            {/* bg orb */}
            <div style={{ position:"absolute", top:-100, left:-100, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-80, right:-80, width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)", pointerEvents:"none" }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, position:"relative", zIndex:1 }} className="mv-inner-grid">
              {/* Mission */}
              <div style={{ borderRight:"1px solid rgba(255,255,255,0.06)", paddingRight:48 }} className="mv-col">
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🎯</div>
                  <h3 style={{ fontFamily:"Orbitron,sans-serif", fontSize:"clamp(16px,2vw,22px)", fontWeight:800, color:"#fff" }}>Our Mission</h3>
                </div>
                <p style={{ color:"#94A3B8", fontSize:15, lineHeight:1.85 }}>To empower businesses and creators by providing a world-class platform that makes hosting and attending expos seamless, engaging, and impactful — regardless of scale or geography.</p>
              </div>
              {/* Vision */}
              <div className="mv-col">
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔭</div>
                  <h3 style={{ fontFamily:"Orbitron,sans-serif", fontSize:"clamp(16px,2vw,22px)", fontWeight:800, color:"#fff" }}>Our Vision</h3>
                </div>
                <p style={{ color:"#94A3B8", fontSize:15, lineHeight:1.85 }}>A world where physical and virtual boundaries no longer limit the reach of great ideas. We envision EventSphere as the global infrastructure layer for the future of exhibitions and business networking.</p>
              </div>
            </div>
          </div>
        </section>

        

        {/* VALUES BENTO */}
        {/* <section className="vals-section" style={{ paddingTop:96, height: "auto" }}>
          <div style={{ marginBottom:52 }}>
            <div className="eyebrow"><span className="eyebrow-line" />What we stand for</div>
            <h2 style={{ fontFamily:"Orbitron,sans-serif", fontWeight:900, fontSize:"clamp(28px,4vw,44px)", color:"#fff", lineHeight:1.15, marginBottom:14 }}>Core <span style={{ color:"#38bdf8" }}>Values</span></h2>
            <p style={{ color:"#94A3B8", fontSize:15, lineHeight:1.8, maxWidth:500 }}>The principles that guide every feature we build and every decision we make.</p>
          </div>
          <div className="vals-bento">
            {values.map((v, i) => (
              <div key={v.title} className={`vb-card ${v.cls}`}>
                <div className="vb-bg-orb" style={{ width:v.orbSize, height:v.orbSize, background:`radial-gradient(circle, ${v.orbColor} 0%, transparent 65%)`, ...v.orbPos }} />
                <div className="vb-inner">
                  <div className="vb-num">{String(i+1).padStart(2,"0")}</div>
                  <span className="vb-icon">{v.icon}</span>
                  <div className="vb-title">{v.title}</div>
                  <p className="vb-desc">{v.desc}</p>
                  <div className="vb-arrow">↗</div>
                </div>
              </div>
            ))}
          </div>
        </section> */}


        {/* CTA */}
        <section className="cta-section">
          <div className="cta-outer">
            <div className="cta-bg">
              <div className="cta-bg-grid" />
              <div className="cta-orb-l" />
              <div className="cta-orb-r" />
            </div>
            <div className="cta-inner">
              <div>
                <div className="cta-kicker"><span className="cta-kicker-dot" />Ready to get started?</div>
                <h2 className="cta-title">Join <em>EventSphere</em><br />Today</h2>
                <p className="cta-sub">Whether you're an exhibitor looking to showcase your brand, or an attendee eager to discover innovations — we have a place for you.</p>
                <div className="cta-pills">
                  {["No credit card required","Free forever plan","Setup in 5 minutes"].map(p => (
                    <div className="cta-pill" key={p}><span className="cta-pill-dot" />{p}</div>
                  ))}
                </div>
              </div>
              <div className="cta-right">
                <button className="btn-p">Get Started Free</button>
                <button className="btn-o">Talk to Sales →</button>
                <div className="social-proof">
                  <div className="avatars">
                    {["A","S","O","Z","M"].map((l,i) => (
                      <div key={l} className="avatar" style={{ background:`hsl(${190+i*15},80%,45%)`, zIndex:5-i }}>{l}</div>
                    ))}
                  </div>
                  <p style={{ color:"#64748B", fontSize:11, lineHeight:1.5 }}>Joined by <span style={{ color:"#fff", fontWeight:600 }}>12,000+</span> exhibitors worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}