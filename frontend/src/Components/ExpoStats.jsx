import React from "react";

const stats = [
  { label: "ATTENDEES", value: "10", sup: "K+", icon: "ti-users" },
  { label: "EXHIBITORS", value: "500", sup: "+", icon: "ti-building-store" },
  { label: "CITIES", value: "25", sup: "+", icon: "ti-world" },
  { label: "AWARDS", value: "12", sup: "+", icon: "ti-trophy" },
];

export default function ExpoStats() {
  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

      <section style={styles.wrap}>
        <div style={styles.topLine} />

        <div style={styles.eyebrow}>
          <div style={styles.eline} />
          <span style={styles.etxt}>Expo 2025 — by the numbers</span>
          <div style={styles.eline} />
        </div>

        <div style={styles.grid}>
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        <div style={styles.footer}>
          <Badge dot>Live event</Badge>
          <Badge>Registration open</Badge>
          <Badge>Global attendance</Badge>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, sup, icon }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.ibox}>
        <i className={`ti ${icon}`} style={styles.icon} aria-hidden="true" />
      </div>
      <div style={styles.num}>
        {value}<sup style={styles.sup}>{sup}</sup>
      </div>
      <div style={styles.lbl}>{label}</div>
    </div>
  );
}

function Badge({ children, dot }) {
  return (
    <span style={styles.badge}>
      {dot && <span style={styles.dot} />}
      {children}
    </span>
  );
}

const styles = {
  wrap: {
    fontFamily: "'Outfit', sans-serif",
    background: "#000206",
   height: "auto",
    padding: "90px 36px 48px",
    position: "relative",
    overflow: "hidden",
  },
  topLine: {
    position: "absolute", top: "20px", left: "10%", right: "10%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.35), transparent)",
  },
  eyebrow: {
    display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px",
  },
  eline: {
    flex: 1, height: "0.5px", background: "rgba(0,212,255,0.15)",
  },
  etxt: {
    fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase",
    color: "rgba(0,212,255,0.5)", fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  card: {
    background: "#00070c",
    border: "0.5px solid rgba(0, 213, 255, 0.26)",
    borderRadius: "14px",
    padding: "22px 22px 22px",
    display: "flex", flexDirection: "column", gap: "14px",
    transition: "border-color 0.25s, background 0.25s, transform 0.25s",
    cursor: "default",
    marginBottom: "20px",
  },
  cardHover: {
    borderColor: "rgba(0,212,255,0.5)",
    background: "rgba(0,212,255,0.08)",
    transform: "translateY(-3px)",
  },
  ibox: {
    width: "38px", height: "38px", borderRadius: "10px",
    border: "0.5px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,212,255,0.06)",
  },
  icon: { fontSize: "18px", color: "#00d4ff" },
  num: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "33px", fontWeight: 800,
    color: "#fff", lineHeight: 1, letterSpacing: "-1px",
  },
  sup: { fontSize: "22px", color: "#00d4ff", fontWeight: 700 },
  lbl: {
    fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)", fontWeight: 400,
  },
  footer: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "0.5px solid rgba(0,212,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: "10px",
  },
  badge: {
    fontSize: "11px", fontWeight: 500,
    color: "rgba(0,212,255,0.6)",
    border: "0.5px solid rgba(0,212,255,0.2)",
    borderRadius: "999px", padding: "5px 14px",
    background: "rgba(0,212,255,0.05)",
    letterSpacing: "0.5px",
  },
  dot: {
    display: "inline-block", width: "5px", height: "5px",
    borderRadius: "50%", background: "#00d4ff",
    marginRight: "6px", verticalAlign: "middle",
  },
};