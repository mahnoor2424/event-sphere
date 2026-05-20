import React, { useEffect, useRef } from "react";

// --- CSS STYLES ---
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;800&family=Syne:wght@700;800&display=swap');

:root {
  --primary: #00f2ff;
  --primary-glow: rgba(0, 242, 255, 0.4);
  --bg-dark: #000001;
  --glass: rgba(255, 255, 255, 0.03);
  --border: rgba(255, 255, 255, 0.1);
}

.premium-hero {
  background-color: var(--bg-dark);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  /* Navbar overlap fix: Add padding top */
  padding-top: 100px; 
}

/* Background Gradients & Effects */
.gradient-sphere {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(140px);
  z-index: 0;
  opacity: 0.12;
}
.top-right { top: -10%; right: -5%; background: var(--primary); }
.bottom-left { bottom: -10%; left: -5%; background: #7000ff; }

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.15;
  mask-image: radial-gradient(circle, black, transparent 80%);
}

/* Text Content */
.hero-wrapper { position: relative; z-index: 2; padding: 0 5%; width: 100%; }

.badge-premium {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 242, 255, 0.05);
  border: 1px solid rgba(0, 242, 255, 0.2);
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
  color: var(--primary);
  font-weight: 600;
}

.badge-premium .dot {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--primary);
  animation: pulse 2s infinite;
}

.main-display {
  font-family: 'Syne', sans-serif;
  font-size: clamp(2rem, 5vw, 5rem);
  line-height: 0.9;
  font-weight: 800;
  margin-bottom: 28px;
  letter-spacing: -2px;
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, #0e7ddf 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 20px var(--primary-glow));
}

.description {
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  max-width: 550px;
  line-height: 1.7;
  margin-bottom: 45px;
}

/* Action Buttons */
.hero-actions { display: flex; gap: 20px; }

.btn-main {
  padding: 18px 40px;
  background: var(--primary);
  border: none;
  border-radius: 50px; /* Rounded for sleek look */
  font-weight: 800;
  color: #000;
  transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 200, 255, 0.2);
}

.btn-main:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(1, 196, 255, 0.4);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: white;
  padding: 18px 40px;
  border-radius: 50px;
  transition: 0.3s;
  backdrop-filter: blur(5px);
  font-weight: 600;
}

.btn-secondary:hover { 
    background: white; 
    color: black;
    border-color: white;
}

/* Portal Visual */
.portal-container {
  display: flex;
  justify-content: center;
  perspective: 1200px;
}

.portal-wrapper {
  position: relative;
  width: 500px;
  height: 500px;
  transition: transform 0.2s ease-out;
}

.portal-ring {
  position: absolute;
  inset: -30px;
  border: 2px solid var(--primary);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
  opacity: 0.2;
  border-style: double;
}

.portal-glass {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 10px solid rgba(255,255,255,0.05);
  box-shadow: 0 0 100px rgba(0, 179, 255, 0.15);
  mask-image: radial-gradient(circle, white 60%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, white 60%, transparent 100%);
}

.portal-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.15);
}

.floating-card {
  position: absolute;
  top: 40px;
  right: -20px;
  background: rgba(1, 1, 19, 0.8);
  backdrop-filter: blur(25px);
  border: 1px solid var(--primary);
  padding: 20px 25px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}

.stat-icon { font-size: 20px; color: var(--primary); margin-bottom: 5px;}
.number { display: block; font-size: 2rem; font-weight: 800; color: white; line-height: 1;}
.label { font-size: 0.7rem; color: var(--primary); text-transform: uppercase; letter-spacing: 2px; font-weight: 700;}

/* Global Animations */
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-20px) translateX(10px); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.hero-bottom-info {
  position: absolute;
  bottom: 30px;
  width: 100%;
  text-align: center;
}

.brand-strip { 
    font-weight: 900; 
    letter-spacing: 8px; 
    opacity: 0.1; 
    font-size: 1.6rem; 
    font-family: 'Syne';
    background: linear-gradient(90deg, transparent, #fff, transparent);
    -webkit-background-clip: text;
}

@media (max-width: 991px) {
  .premium-hero { padding-top: 120px; }
  .portal-wrapper { width: 350px; height: 350px; margin-top: 60px; }
  .main-display { text-align: center; font-size: 3rem; }
  .text-content { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .hero-actions { justify-content: center; }
  .floating-card { right: 0; top: auto; bottom: -20px; }
}
`;

// --- REACT COMPONENT ---
export default function Hero() {
  const portalRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 40;
      const moveY = (clientY - window.innerHeight / 2) / 40;
      
      if (portalRef.current) {
        portalRef.current.style.transform = `rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <section className="premium-hero">
        {/* Decorative Background Design */}
        <div className="gradient-sphere top-right"></div>
        <div className="gradient-sphere bottom-left"></div>
        <div className="grid-overlay"></div>

        <div className="hero-wrapper container">
          <div className="row align-items-center">
            
            {/* Left Content */}
            <div className="col-lg-6 text-content">
              <div className="badge-premium">
                <span className="dot"></span> Next-Gen Event Tech
              </div>
              <h1 className="main-display">
                Expand Your <br />
                <span className="text-gradient">EventSphere.</span>
              </h1>
              <p className="description">
                The ultimate ecosystem for digital expos, corporate summits, and 
                immersive brand experiences. Plan, manage, and scale without limits.
              </p>
              
            </div>

            {/* Right Visual Portal */}
            <div className="col-lg-6 portal-container">
              <div className="portal-wrapper" ref={portalRef} style={{ transformStyle: 'preserve-3d' }}>
                <div className="portal-ring"></div>
                <div className="portal-glass">
                   <video autoPlay muted loop playsInline className="portal-video">
                      <source src="/assets/hero.mp4" type="video/mp4" />
                      <div style={{width:'100%', height:'100%', background:'#0a0a0a'}}></div>
                   </video>
                </div>
                
                {/* Floating Micro-Card */}
                <div className="floating-card">
                  <div className="stat-icon">✦</div>
                  <span className="label">Live Projects</span>
                  <span className="number">850+</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Decorative Strip */}
        <div className="hero-bottom-info">
          <div className="brand-strip">
              SPHERE • CONNECT • SCALE
          </div>
        </div>
      </section>
    </>
  );
}