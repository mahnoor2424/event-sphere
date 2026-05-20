import React, { useState } from "react";

const styles = `

.blog-root {
  background: #05070A;
  padding: 110px 0 120px;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  color: #fff;
}

.blog-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  opacity: 0.07;
}
.blog-orb-1 { width: 600px; height: 600px; background: #00f2ff; top: 50%; right: -150px; transform: translateY(-50%); }
.blog-orb-2 { width: 400px; height: 400px; background: #7000ff; bottom: -100px; left: -100px; }

.blog-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header */
.blog-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 56px;
  flex-wrap: wrap;
}

.blog-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #00f2ff;
  margin-bottom: 16px;
}
.blog-kicker-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00f2ff;
  animation: blogPulse 2s infinite;
}
@keyframes blogPulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.4; transform:scale(1.4); }
}

.blog-heading {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(30px, 4.5vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.05;
  letter-spacing: -1px;
  margin: 0;
}
.blog-heading em {
  font-style: normal;
  background: linear-gradient(135deg, #00f2ff, #0e7ddf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.blog-see-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #00f2ff;
  background: rgba(0,242,255,0.06);
  border: 1px solid rgba(0,242,255,0.18);
  padding: 10px 20px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.blog-see-all:hover { background: rgba(0,242,255,0.12); transform: translateY(-2px); }

/* Filters */
.blog-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.blog-filter {
  font-size: 12px;
  font-weight: 600;
  padding: 7px 18px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}
.blog-filter.active {
  background: rgba(0,242,255,0.1);
  border-color: rgba(0,242,255,0.4);
  color: #00f2ff;
}

/* Grid & Cards */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.blog-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}
.blog-card:hover { border-color: rgba(0,242,255,0.3); transform: translateY(-8px); background: rgba(255,255,255,0.04); }

.blog-card.featured {
  grid-column: span 2;
  flex-direction: row;
}

.blog-img-box {
  position: relative;
  overflow: hidden;
  background: #0A0D14;
  flex-shrink: 0;
}
.blog-card:not(.featured) .blog-img-box { height: 220px; }
.blog-card.featured .blog-img-box { width: 50%; }

.blog-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.blog-card:hover .blog-main-img { transform: scale(1.1); }

.blog-img-box::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(5,7,10,0.5), transparent);
}

.blog-img-tag {
  position: absolute;
  top: 16px; left: 16px;
  z-index: 5;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 100px;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Card Content */
.blog-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.blog-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 11px;
  color: #64748B;
}
.blog-dot { width: 3px; height: 3px; border-radius: 50%; background: #334155; }

.blog-title {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
  margin-bottom: 12px;
}
.blog-card.featured .blog-title { font-size: 26px; }
.blog-card:hover .blog-title { color: #00f2ff; }

.blog-excerpt {
  font-size: 14px;
  color: #94A3B8;
  line-height: 1.6;
  margin-bottom: 24px;
  flex: 1;
}

.blog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 18px;
}
.blog-author { display: flex; align-items: center; gap: 10px; }
.blog-avatar {
  width: 32px; height: 32px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #fff;
}
.blog-author-name { font-size: 13px; color: #CBD5E1; }

.blog-arrow {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0,242,255,0.2);
  display: flex; align-items: center; justify-content: center;
  color: #00f2ff;
  transition: all 0.3s;
}
.blog-card:hover .blog-arrow { background: #00f2ff; color: #000; transform: rotate(-45deg); }

/* Newsletter */
.blog-newsletter {
  margin-top: 80px;
  background: linear-gradient(135deg, rgba(0,242,255,0.05), rgba(112,0,255,0.03));
  border: 1px solid rgba(0,242,255,0.1);
  border-radius: 32px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}
.blog-newsletter-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.blog-newsletter-sub { color: #64748B; font-size: 14px; }

.blog-newsletter-form { display: flex; gap: 12px; }
.blog-newsletter-input {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 20px;
  color: #fff;
  width: 280px;
  outline: none;
}

@media (max-width: 960px) {
  .blog-grid { grid-template-columns: 1fr; }
  .blog-card.featured { flex-direction: column; }
  .blog-card.featured .blog-img-box { width: 100%; height: 250px; }
}
`;

const categories = ["All", "Industry", "Product", "Tips & Tricks", "Case Studies"];

const postsData = [
  {
    id: 1,
    category: "Industry",
    tag: "Future Tech",
    tagColor: "#00f2ff",
    image: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&q=80&w=1200", // Mega Exhibition
    title: "The Future of B2B Expos: Hybrid Events Reshaping Commerce",
    excerpt: "Organizers worldwide are discovering that hybrid events don't just extend reach — they fundamentally transform attendee engagement.",
    date: "May 10, 2025",
    read: "8 min read",
    author: "Amara Diallo",
    authorColor: "#00b8d1",
    authorInit: "AD",
    featured: true,
  },
  {
    id: 2,
    category: "Product",
    tag: "Booth Design",
    tagColor: "#a78bfa",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000", // Modern Booth
    title: "Introducing Smart Booth Builder 2.0",
    excerpt: "Drag, drop, and go live. Design a stunning 3D exhibition stall in under 30 minutes with our new interface.",
    date: "Apr 28, 2025",
    read: "4 min read",
    author: "Dev Team",
    authorColor: "#7c3aed",
    authorInit: "DT",
    featured: false,
  },
  {
    id: 3,
    category: "Tips & Tricks",
    tag: "Engagement",
    tagColor: "#34d399",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000", // Crowd/Engagement
    title: "10 Ways to Drive Booth Traffic",
    excerpt: "From interactive LED displays to live demo scheduling, discover how to keep your stall busy all day.",
    date: "Apr 15, 2025",
    read: "6 min read",
    author: "Nadia Khalid",
    authorColor: "#059669",
    authorInit: "NK",
    featured: false,
  },
  {
    id: 4,
    category: "Case Studies",
    tag: "Success Story",
    tagColor: "#fbbf24",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000", // Data/Charts
    title: "How NovaTech 3x'd Their Leads",
    excerpt: "A deep dive into how one Dubai-based tech firm turned raw expo data into a $2M pipeline using TechNova.",
    date: "Mar 30, 2025",
    read: "5 min read",
    author: "Ravi Patel",
    authorColor: "#d97706",
    authorInit: "RP",
    featured: false,
  },
  {
    id: 5,
    category: "Industry",
    tag: "Networking",
    tagColor: "#f472b6",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000", // Networking event
    title: "The New Era of Expo Networking",
    excerpt: "How AI-driven matchmaking is replacing random encounters with curated high-value meetings.",
    date: "Mar 12, 2025",
    read: "7 min read",
    author: "Lena Fischer",
    authorColor: "#db2777",
    authorInit: "LF",
    featured: false,
  },
];

export default function Blog() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? postsData : postsData.filter(p => p.category === active);

  return (
    <>
      <style>{styles}</style>
      <section className="blog-root" id="blogs">
        <div className="blog-orb blog-orb-1" />
        <div className="blog-orb blog-orb-2" />

        <div className="blog-inner">
          <div className="blog-header">
            <div>
              <div className="blog-kicker">
                <span className="blog-kicker-dot" />
                Latest Updates
              </div>
              <h2 className="blog-heading">Insights &amp; <em>Ideas.</em></h2>
            </div>
            <a className="blog-see-all" href="#">View all posts &nbsp;→</a>
          </div>

          <div className="blog-filters">
            {categories.map(c => (
              <button
                key={c}
                className={`blog-filter${active === c ? " active" : ""}`}
                onClick={() => setActive(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="blog-grid">
            {filtered.map((post) => (
              <div className={`blog-card${post.featured ? " featured" : ""}`} key={post.id}>
                <div className="blog-img-box">
                  <img src={post.image} alt={post.title} className="blog-main-img" />
                  <div className="blog-img-tag" style={{ color: post.tagColor }}>
                    {post.tag}
                  </div>
                </div>

                <div className="blog-body">
                  <div className="blog-meta">
                    <span>{post.date}</span>
                    <span className="blog-dot" />
                    <span>{post.read}</span>
                  </div>
                  <h3 className="blog-title">{post.title}</h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <div className="blog-footer">
                    <div className="blog-author">
                      <div className="blog-avatar" style={{ background: post.authorColor }}>
                        {post.authorInit}
                      </div>
                      <span className="blog-author-name">{post.author}</span>
                    </div>
                    <div className="blog-arrow">→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="blog-newsletter">
            <div>
              <div className="blog-newsletter-title">Subscribe for Expo Trends 📡</div>
              <div className="blog-newsletter-sub">Get the latest industry insights delivered to your inbox.</div>
            </div>
            <div className="blog-newsletter-form">
              <input className="blog-newsletter-input" type="email" placeholder="Enter email" />
              <button className="blog-see-all" style={{border: 'none', marginLeft: '10px'}}>Join Now</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}