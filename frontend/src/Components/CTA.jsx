  import React, { useState } from "react";
  
  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .about-root { background: #05070A; font-family: 'DM Sans', sans-serif; color: #fff; overflow-x: hidden; }
  

    /* STATS */
  .stats-wrap { background: #0A0D14; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 64px 24px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; max-width: 1000px; margin: 0 auto; }
  .stat-item { text-align: center; padding: 32px 20px; position: relative; }
  .stat-item:not(:last-child)::after { content: ''; position: absolute; right: 0; top: 20%; bottom: 20%; width: 1px; background: rgba(255,255,255,0.06); }
  .stat-num { font-family: 'Orbitron', sans-serif; font-size: clamp(32px, 5vw, 52px); font-weight: 900; color: #38bdf8; line-height: 1; margin-bottom: 10px; }
  .stat-label { color: #64748B; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
  .glow-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent); border: none; margin: 0; }
  
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
    }
`;

  const stats = [
  { num: "500+", label: "Expos Hosted" },
  { num: "12K+", label: "Exhibitors" },
  { num: "48",   label: "Countries" },
  { num: "1.2M", label: "Attendees" },
];

  export default function CTA() {
  return (
    <>
      <style>{globalCSS}</style>
      <div className="about-root">

      
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