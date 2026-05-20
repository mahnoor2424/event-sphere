import React, { useEffect, useRef } from "react";

const servicesData = [
  {
    title: "Event Strategy & Planning",
    desc: "We design data-driven event roadmaps, from conceptualizing massive tech summits to local corporate showcases.",
    tag: "STRATEGY",
    num: "01",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "Exhibition Booth Management",
    desc: "Complete 3D booth setup, floor planning, and on-site coordination. We turn empty halls into brand experiences.",
    tag: "OPERATIONS",
    num: "02",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    title: "Digital & Hybrid Execution",
    desc: "Seamless live streaming, virtual lobby creation, and attendee engagement tools for the modern hybrid era.",
    tag: "TECH-DRIVEN",
    num: "03",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

export default function Services() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll(".srv-reveal");
    if (!els) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("srv-show");
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="srv-root" id="services" ref={sectionRef}>
      {/* Background Decor */}
      <div className="srv-orb srv-orb-1" />
      <div className="srv-orb srv-orb-2" />
      <div className="srv-grid-overlay" />

      <div className="srv-inner">
        {/* Header Section */}
        <div className="srv-header srv-reveal">
          <div className="srv-kicker">
            <span className="srv-kicker-dot" />
            WHAT WE OFFER
          </div>
          <h2 className="srv-heading">
            Powerful Solutions,<br /><em>Infinite Scale.</em>
          </h2>
          <p className="srv-sub">
            TechNova provides end-to-end event infrastructure designed to 
            accelerate growth and redefine attendee experiences.
          </p>
        </div>

        {/* Services Grid */}
        <div className="srv-grid">
          {servicesData.map((s, i) => (
            <div
              key={i}
              className="srv-card srv-reveal"
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {/* Number Watermark */}
              <div className="srv-card-num">{s.num}</div>

              <div className="srv-card-top">
                <div className="srv-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="srv-tag">{s.tag}</div>
              </div>

              <div className="srv-card-body">
                <h3 className="srv-card-title">{s.title}</h3>
                <p className="srv-card-desc">{s.desc}</p>
              </div>

              <div className="srv-card-footer">
                <div className="srv-learn-more">
                  Explore Details
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Top Accent Line */}
              <div className="srv-card-glow" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=Orbitron:wght@500;700&display=swap');

        .srv-root {
          background: #05070A;
          padding: 110px 0 120px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* --- BACKGROUND ELEMENTS --- */
        .srv-grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
        }
        .srv-orb {
          position: absolute; border-radius: 50%; filter: blur(140px); pointer-events: none; opacity: 0.08;
        }
        .srv-orb-1 { width: 500px; height: 500px; background: #00f2ff; top: -100px; left: -100px; }
        .srv-orb-2 { width: 400px; height: 400px; background: #7000ff; bottom: -80px; right: -80px; }

        .srv-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
        }

        /* --- HEADER --- */
        .srv-header { text-align: center; margin-bottom: 64px; }

        .srv-kicker {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(0, 242, 255, 0.06); border: 1px solid rgba(0, 242, 255, 0.2);
          padding: 8px 20px; border-radius: 100px;
          margin: 0 auto 24px; width: fit-content;
          color: #00f2ff; font-family: 'Orbitron', sans-serif; font-size: 11px; letter-spacing: 2px;
        }
        .srv-kicker-dot {
          width: 6px; height: 6px; background: #00f2ff; border-radius: 50%;
          animation: srvPulse 2s infinite; box-shadow: 0 0 8px #00f2ff;
        }
        @keyframes srvPulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.4; transform:scale(1.4)} }

        .srv-heading {
         font-family: 'Orbitron', sans-serif;font-size: clamp(32px, 5vw, 54px);
          font-weight: 800; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 20px;
        }
        .srv-heading em {
          font-style: normal; background: linear-gradient(135deg, #00f2ff, #00eaff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .srv-sub {
          color: #64748B; font-size: 16px; line-height: 1.7; max-width: 600px; margin: 0 auto;
        }

        /* --- GRID --- */
        .srv-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }

        /* --- CARD --- */
        .srv-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 28px; padding: 40px;
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column;
        }
        .srv-card:hover {
          border-color: rgba(0, 242, 255, 0.3);
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.04);
        }

        /* Number Watermark */
        .srv-card-num {
          position: absolute; top: 30px; right: 30px;
          font-family: 'Syne', sans-serif; font-size: 70px; font-weight: 800;
          color: rgba(0, 242, 255, 0.04); line-height: 1; pointer-events: none;
        }

        .srv-card-top {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;
        }
        .srv-icon-box {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(0, 242, 255, 0.08); border: 1px solid rgba(0, 242, 255, 0.15);
          display: flex; align-items: center; justify-content: center;
          color: #00f2ff; transition: all 0.3s;
        }
        .srv-icon-box svg { width: 26px; height: 26px; }
        .srv-card:hover .srv-icon-box { background: #00f2ff; color: #000; transform: scale(1.1) rotate(5deg); }

        .srv-tag {
          font-family: 'Orbitron', sans-serif; font-size: 9px; letter-spacing: 1.5px;
          color: #64748B; padding: 4px 12px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .srv-card-title {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700;
          margin-bottom: 16px; color: #fff;
        }
        .srv-card-desc {
          font-size: 14px; color: #94A3B8; line-height: 1.7; margin-bottom: 32px; flex: 1;
        }

        .srv-learn-more {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700;
          color: #00f2ff; cursor: pointer; transition: gap 0.3s;
        }
        .srv-card:hover .srv-learn-more { gap: 16px; }

        /* Hover Accent Line */
        .srv-card-glow {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,242,255,0.6), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .srv-card:hover .srv-card-glow { opacity: 1; }

        /* --- ANIMATIONS --- */
        .srv-reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .srv-show { opacity: 1; transform: translateY(0); }

        @media (max-width: 960px) {
          .srv-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 650px) {
          .srv-grid { grid-template-columns: 1fr; }
          .srv-card { padding: 30px; }
        }
      `}</style>
    </section>
  );
}