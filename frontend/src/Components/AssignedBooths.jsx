import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Paper, Stack, Container,
  TextField, InputAdornment, ToggleButton, ToggleButtonGroup, Chip
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  GridViewOutlined as GridIcon,
  ListOutlined as ListIcon,
} from "@mui/icons-material";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes badgePop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
`;

const T = {
  bg:       "#04060C",
  surface:  "#0A0D14",
  card:     "#0A0D14",
  border:   "rgba(148,163,184,0.08)",
  bHov:     "rgba(56,189,248,0.4)",
  bGold:    "rgba(245,158,11,0.5)",
  accent:   "#38bdf8",
  accentDim:"rgba(56,189,248,0.07)",
  gold:     "#f59e0b",
  goldDim:  "rgba(245,158,11,0.08)",
  green:    "#10b981",
  greenDim: "rgba(16,185,129,0.09)",
  text:     "#e2e8f0",
  sub:      "#64748b",
  muted:    "#334155",
};

// ── ObjectId timestamp extractor ──────────────────────────────────────
function objectIdToMs(id) {
  if (!id || typeof id !== "string" || id.length < 8) return 0;
  return parseInt(id.substring(0, 8), 16) * 1000;
}

function timeAgo(ms) {
  const d = Date.now() - ms;
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

// ── JUST ASSIGNED badge ───────────────────────────────────────────────
function NewBadge() {
  return (
    <Box sx={{
      display:"inline-flex", alignItems:"center", gap:"4px",
      bgcolor: T.goldDim, border:`0.5px solid rgba(245,158,11,0.4)`,
      borderRadius:"6px", px:"8px", py:"2px",
      animation:"badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
    }}>
      <Box sx={{ width:5, height:5, borderRadius:"50%", bgcolor:T.gold, animation:"pulse 1.4s ease infinite" }}/>
      <Typography sx={{ color:T.gold, fontSize:"8px", fontWeight:700, letterSpacing:1.4, fontFamily:"Outfit,sans-serif" }}>
        JUST ASSIGNED
      </Typography>
    </Box>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <Box sx={{
      height:170, borderRadius:"14px",
      background:`linear-gradient(90deg, ${T.card} 25%, rgba(56,189,248,0.04) 50%, ${T.card} 75%)`,
      backgroundSize:"600px 100%",
      animation:"shimmer 1.5s infinite linear",
    }}/>
  );
}

// ── STAT PILL ─────────────────────────────────────────────────────────
function Stat({ n, label, color }) {
  return (
    <Box sx={{
      display:"flex", alignItems:"baseline", gap:"8px",
      bgcolor:T.accentDim, border:`0.5px solid ${T.border}`,
      borderRadius:"10px", px:2, py:"7px",
    }}>
      <Typography sx={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"20px", color: color || T.accent }}>
        {n}
      </Typography>
      <Typography sx={{ fontFamily:"Inter,sans-serif", fontSize:"11px", color:T.sub }}>
        {label}
      </Typography>
    </Box>
  );
}

// ── GRID CARD ─────────────────────────────────────────────────────────
function BoothCard({ item, idx, isNew }) {
  return (
    <Paper elevation={0} sx={{
      bgcolor:T.card, borderRadius:"14px", overflow:"hidden",
      border:`0.5px solid ${isNew ? T.bGold : T.border}`,
      boxShadow: isNew ? `0 0 24px rgba(245,158,11,0.10)` : "none",
      animation:`fadeUp 0.4s ${idx*0.05}s both`,
      transition:"border-color .25s, transform .22s, box-shadow .25s",
      "&:hover": { borderColor: isNew ? T.bGold : T.bHov, transform:"translateY(-3px)" },
    }}>
      {/* Top */}
      <Box sx={{
        px:2, py:1.5,
        background: isNew
          ? `linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))`
          : `linear-gradient(135deg, rgba(56,189,248,0.09), transparent)`,
        borderBottom:`0.5px solid ${isNew ? "rgba(245,158,11,0.15)" : T.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <Typography sx={{ fontFamily:"Outfit,sans-serif", fontWeight:800, fontSize:"14px",
          color: isNew ? T.gold : T.accent, letterSpacing:"-0.5px" }}>
          {item.boothNumber}
        </Typography>
        {isNew
          ? <NewBadge />
          : <Chip label="Reserved" size="small" sx={{
              bgcolor:T.greenDim, color:T.green, fontWeight:700,
              fontSize:"9px", letterSpacing:1,
              border:`0.5px solid rgba(16,185,129,0.3)`,
              fontFamily:"Outfit,sans-serif",
            }}/>
        }
      </Box>

      {/* Body */}
      <Box sx={{ p:2 }}>
        <Typography sx={{ color:T.muted, fontSize:"8.5px", fontWeight:700, letterSpacing:1.8, fontFamily:"Outfit,sans-serif", mb:"4px" }}>
          ORGANIZATION
        </Typography>
        <Typography sx={{ fontFamily:"Outfit,sans-serif", fontWeight:700, fontSize:"13px", color:T.text, mb:1.2, lineHeight:1.3 }}>
          {item.organization}
        </Typography>

        <Box sx={{ height:"0.5px", bgcolor:T.border, mb:1.2 }}/>

        <Typography sx={{ color:T.muted, fontSize:"8.5px", fontWeight:700, letterSpacing:1.8, fontFamily:"Outfit,sans-serif", mb:"4px" }}>
          EVENT
        </Typography>
        <Typography sx={{ fontFamily:"Inter,sans-serif", fontSize:"11px", color:T.sub, mb:"3px" }}>
          📅 {item.expoTitle}
        </Typography>
        <Typography sx={{ fontFamily:"Inter,sans-serif", fontSize:"11px", color:T.muted }}>
          📍 {item.venue}
        </Typography>

        {item.assignedAt > 0 && (
          <Typography sx={{ textAlign:"right", fontSize:"10px", color:T.muted, fontFamily:"Inter,sans-serif", mt:1 }}>
            {timeAgo(item.assignedAt)}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ── LIST ROW ──────────────────────────────────────────────────────────
function BoothRow({ item, idx, isNew }) {
  return (
    <Paper elevation={0} sx={{
      bgcolor:T.card, borderRadius:"10px",
      border:`0.5px solid ${isNew ? T.bGold : T.border}`,
      boxShadow: isNew ? `0 0 20px rgba(245,158,11,0.09)` : "none",
      animation:`fadeUp 0.35s ${idx*0.03}s both`,
      transition:"border-color .2s, transform .18s",
      "&:hover": { borderColor: isNew ? T.bGold : T.bHov, transform:"translateX(4px)" },
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px:2.5, py:1.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{
            minWidth:"56px", textAlign:"center",
            bgcolor: isNew ? T.goldDim : T.accentDim,
            border:`0.5px solid ${isNew ? "rgba(245,158,11,0.25)" : "rgba(56,189,248,0.18)"}`,
            borderRadius:"8px", py:"5px",
          }}>
            <Typography sx={{ color: isNew ? T.gold : T.accent, fontWeight:800, fontSize:"16px", fontFamily:"Outfit,sans-serif" }}>
              {item.boothNumber}
            </Typography>
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {isNew && <NewBadge />}
              <Typography sx={{ color:T.text, fontWeight:700, fontSize:"13px", fontFamily:"Outfit,sans-serif" }}>
                {item.organization}
              </Typography>
            </Stack>
            <Typography sx={{ color:T.sub, fontSize:"11px", fontFamily:"Inter,sans-serif", mt:"2px" }}>
              {item.expoTitle} · {item.venue}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {item.assignedAt > 0 && (
            <Typography sx={{ color:T.muted, fontSize:"10px", fontFamily:"Inter,sans-serif" }}>
              {timeAgo(item.assignedAt)}
            </Typography>
          )}
          <Chip label="Reserved" size="small" sx={{
            bgcolor:T.greenDim, color:T.green, fontWeight:700,
            fontSize:"9px", letterSpacing:1,
            border:`0.5px solid rgba(16,185,129,0.3)`,
            fontFamily:"Outfit,sans-serif",
          }}/>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function AssignedBooths() {
  const [booths, setBooths]       = useState([]);
  const [search, setSearch]       = useState("");
  const [view, setView]           = useState("grid");
  const [loading, setLoading]     = useState(true);
  const injected = useRef(false);

  useEffect(() => {
    if (!injected.current) {
      injected.current = true;
      const s = document.createElement("style");
      s.textContent = FONTS;
      document.head.appendChild(s);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/expo/all-expos");
      const list = [];

      res.data.forEach(expo => {
        (expo.booths?.layout || []).forEach(booth => {
          if (booth.status === "reserved") {
            const rawId = booth._id?.toString() || (booth.id + expo._id);
            list.push({
              _id:          rawId,
              boothNumber:  booth.id,
              expoTitle:    expo.title,
              organization: booth.companyName || booth.organization || "Independent Exhibitor",
              venue:        expo.location?.venue || "Main Floor",
              // ✅ Use ObjectId timestamp — newest _id = most recently created
              assignedAt:   objectIdToMs(rawId),
            });
          }
        });
      });

      // ✅ Newest first — highest ObjectId timestamp at top
      list.sort((a, b) => b.assignedAt - a.assignedAt);
      setBooths(list);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = booths.filter(b =>
    b.boothNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.organization?.toLowerCase().includes(search.toLowerCase()) ||
    b.expoTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const newestId  = booths[0]?._id;
  const todayCount = booths.filter(b => Date.now() - b.assignedAt < 86400000).length;
  const expoCount  = [...new Set(booths.map(b => b.expoTitle))].length;

  return (
    <Box sx={{ py:5, minHeight:"100vh", bgcolor:T.bg }}>
      <Container maxWidth="xl">

        {/* HEADER */}
        <Box sx={{ mb:4, animation:"fadeUp 0.5s both" }}>
          <Box sx={{
            display:"inline-flex", alignItems:"center", gap:"6px",
            bgcolor:"rgba(16,185,129,0.08)", border:`0.5px solid rgba(16,185,129,0.3)`,
            borderRadius:"20px", px:"12px", py:"4px", mb:1.5,
          }}>
            <Box sx={{ width:7, height:7, borderRadius:"50%", bgcolor:T.green, animation:"pulse 1.4s ease infinite" }}/>
            <Typography sx={{ color:T.green, fontSize:"10px", fontWeight:700, letterSpacing:1.6, fontFamily:"Outfit,sans-serif" }}>
              LIVE ALLOCATION FEED
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily:"Outfit,sans-serif", fontWeight:800,
            fontSize:"clamp(26px,3.5vw,40px)",
            color:"#fff", letterSpacing:"-1.2px", lineHeight:1.1,
          }}>
            Assigned{" "}
            <Box component="span" sx={{ color:T.accent }}>Booths</Box>
          </Typography>
          <Typography sx={{ color:T.sub, fontSize:"12px", fontFamily:"Inter,sans-serif", mt:0.8 }}>
            Newest assignments appear first — sorted by MongoDB ObjectId timestamp.
          </Typography>

          {!loading && (
            <Stack direction="row" spacing={1.5} sx={{ mt:2, flexWrap:"wrap", gap:1 }}>
              <Stat n={booths.length} label="total assigned" />
              <Stat n={todayCount}   label="assigned today"  color={T.gold} />
              <Stat n={expoCount}    label="events"          color={T.green} />
            </Stack>
          )}
        </Box>

        {/* TOOLBAR */}
        <Paper elevation={0} sx={{
          bgcolor:T.surface, border:`0.5px solid ${T.border}`,
          borderRadius:"12px", p:"10px 14px", mb:3,
          display:"flex", flexWrap:"wrap", gap:2,
          alignItems:"center", justifyContent:"space-between",
          animation:"fadeUp 0.5s 0.08s both",
        }}>
          <TextField
            placeholder="Search booth, org or event…"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              width:{ xs:"100%", sm:"340px" },
              "& .MuiOutlinedInput-root": {
                color:T.text, bgcolor:"rgba(255,255,255,0.02)",
                borderRadius:"8px", fontSize:"13px", fontFamily:"Inter,sans-serif",
                "& fieldset":{ borderColor:T.border },
                "&:hover fieldset":{ borderColor:"rgba(148,163,184,0.2)" },
                "&.Mui-focused fieldset":{ borderColor:T.accent },
              }
            }}
            InputProps={{ startAdornment:
              <InputAdornment position="start">
                <SearchIcon sx={{ color:T.sub, fontSize:16 }}/>
              </InputAdornment>
            }}
          />
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography sx={{ color:T.muted, fontSize:"11px", fontFamily:"Inter,sans-serif" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </Typography>
            <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)}
              sx={{ bgcolor:"rgba(0,0,0,0.3)", border:`0.5px solid ${T.border}`, borderRadius:"8px", p:"3px" }}>
              {[["grid", <GridIcon fontSize="small"/>], ["list", <ListIcon fontSize="small"/>]].map(([v, icon]) => (
                <ToggleButton key={v} value={v} sx={{
                  color:T.sub, border:"none", borderRadius:"5px !important", px:1.2, py:"5px",
                  "&.Mui-selected":{ bgcolor:T.accentDim, color:T.accent },
                }}>
                  {icon}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {/* CONTENT */}
        {loading ? (
          <Grid container spacing={2}>
            {[...Array(8)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign:"center", py:10, border:`0.5px dashed ${T.border}`, borderRadius:"16px" }}>
            <Typography sx={{ color:T.sub, fontSize:"13px", fontFamily:"Inter,sans-serif" }}>
              No reserved booths match your search.
            </Typography>
          </Box>
        ) : view === "grid" ? (
          <Grid container spacing={2}>
            {filtered.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <BoothCard item={item} idx={idx} isNew={item._id === newestId} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={1}>
            {filtered.map((item, idx) => (
              <BoothRow key={item._id} item={item} idx={idx} isNew={item._id === newestId} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}