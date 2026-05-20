import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Divider,
  Button, Chip, Grid, Dialog, DialogTitle, DialogContent,
  IconButton, Container
} from "@mui/material";
import {
  User, Mail, ShieldCheck, Calendar,
  Briefcase, Key, X, Layout,
  Zap, Fingerprint, Eye, EyeOff, Check, Info, Lock
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  bg:           "#07090F",
  paper:        "#0D1117",
  paperAlt:     "#07090F",
  accent:       "#00D2DC",
  accentDim:    "rgba(0,210,220,0.08)",
  accentBorder: "rgba(0,210,220,0.22)",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(255,255,255,0.15)",
  textMain:     "#F0F6FC",
  textSub:      "#8B949E",
  textMuted:    "#4B5563",
  green:        "#22c55e",
  greenDim:     "rgba(34,197,94,0.08)",
  greenBorder:  "rgba(34,197,94,0.22)",
  red:          "#ef4444",
  amber:        "#f59e0b",
};

// ─── PASSWORD STRENGTH ────────────────────────────────────────────
function getStrength(pw) {
  const r1 = pw.length >= 6;
  const r2 = /\d/.test(pw);
  const r3 = /[a-z]/.test(pw) && /[A-Z]/.test(pw);
  const score = [r1, r2, r3].filter(Boolean).length;
  const levels = [
    { label: "",       color: "rgba(255,255,255,0.1)", pct: 0   },
    { label: "Weak",   color: T.red,                   pct: 33  },
    { label: "Good",   color: T.amber,                 pct: 66  },
    { label: "Strong", color: T.green,                 pct: 100 },
  ];
  return { score, rules: { r1, r2, r3 }, ...(pw.length ? levels[score] : levels[0]) };
}

function RuleRow({ ok, text }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: "3px" }}>
      <Box sx={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        border: ok ? "none" : `1.5px solid rgba(255,255,255,0.1)`,
        bgcolor: ok ? "rgba(34,197,94,0.15)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {ok && <Check size={10} color={T.green} strokeWidth={3} />}
      </Box>
      <Typography sx={{ fontSize: "12.5px", color: ok ? T.textSub : T.textMuted, transition: "color .2s" }}>
        {text}
      </Typography>
    </Stack>
  );
}

// ─── PASSWORD DIALOG ──────────────────────────────────────────────
function PasswordDialog({ open, onClose, userEmail }) {
  const [pw, setPw]           = useState("");
  const [cpw, setCpw]         = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const { score, rules, label, color, pct } = getStrength(pw);
  const matched = pw === cpw && cpw.length > 0;
  const canSave = score === 3 && matched;

  const handleClose = () => {
    onClose();
    setTimeout(() => { setPw(""); setCpw(""); setDone(false); setShowPw(false); setShowCpw(false); }, 300);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put("http://localhost:5000/api/auth/update-password", { email: userEmail, newPassword: pw });
      setDone(true);
    } catch {
      Swal.fire({ title: "Error", text: "Could not update password. Please try again.", icon: "error", background: T.paper, color: T.textMain, confirmButtonColor: T.accent });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={handleClose}
      PaperProps={{ sx: { backgroundColor: `${T.paper} !important`, backgroundImage: "none !important", border: `1px solid ${T.accentBorder}`, borderRadius: "20px", width: "100%", maxWidth: "420px", boxShadow: "0 30px 80px rgba(0,0,0,0.85)", overflow: "hidden" } }}
      sx={{ "& .MuiBackdrop-root": { backgroundColor: "rgba(0,0,0,0.75)" }, "& .MuiDialog-paper": { backgroundColor: `${T.paper} !important`, backgroundImage: "none !important" } }}
    >
      <DialogTitle sx={{ backgroundColor: `${T.paper} !important`, p: "20px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${T.accentBorder}` }}>
            <Lock size={16} color={T.accent} />
          </Box>
          <Typography sx={{ color: T.textMain, fontWeight: 700, fontSize: "16px" }}>Update password</Typography>
        </Stack>
        <IconButton onClick={handleClose} sx={{ color: T.textSub, borderRadius: "8px", border: `1px solid ${T.border}`, p: "5px", "&:hover": { color: T.textMain, borderColor: T.borderHover, bgcolor: "rgba(255,255,255,0.04)" } }}>
          <X size={15} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: `${T.paper} !important`, p: "18px 22px 24px" }}>
        {done ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 3, textAlign: "center" }}>
            <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: T.greenDim, border: `1px solid ${T.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={28} color={T.green} strokeWidth={2.5} />
            </Box>
            <Typography sx={{ color: T.textMain, fontWeight: 700, fontSize: "17px" }}>Password updated!</Typography>
            <Typography sx={{ color: T.textSub, fontSize: "13.5px", lineHeight: 1.7 }}>Your account is now secured with the new password.</Typography>
            <Button onClick={handleClose} sx={{ mt: 1, bgcolor: T.greenDim, color: T.green, border: `1px solid ${T.greenBorder}`, borderRadius: "10px", px: 4, py: 1.2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "rgba(34,197,94,0.15)" } }}>Done</Button>
          </Stack>
        ) : (
          <>
            <Typography sx={{ color: T.textSub, mb: 2.5, fontSize: "13.5px", lineHeight: 1.7 }}>Choose a strong, unique password to keep your account secure.</Typography>

            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: T.textMuted, letterSpacing: "1px", textTransform: "uppercase", mb: "7px" }}>New password</Typography>
            <Box sx={{ position: "relative", mb: "10px" }}>
              <input type={showPw ? "text" : "password"} placeholder="Enter new password" value={pw} onChange={e => setPw(e.target.value)}
                style={{ width: "100%", padding: "11px 44px 11px 14px", background: T.paperAlt, color: T.textMain, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color .2s" }}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              <IconButton onClick={() => setShowPw(v => !v)} sx={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: T.textMuted, p: "4px", "&:hover": { color: T.textSub } }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            </Box>

            {pw.length > 0 && (
              <Box sx={{ mb: "14px" }}>
                <Box sx={{ height: "3px", bgcolor: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden", mb: "6px" }}>
                  <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: color, borderRadius: "2px", transition: "width .3s, background .3s" }} />
                </Box>
                <Typography sx={{ fontSize: "11.5px", color: color, fontWeight: 600 }}>{label}</Typography>
              </Box>
            )}

            <Box sx={{ bgcolor: T.paperAlt, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: "12px", p: "12px 14px", mb: "16px" }}>
              <RuleRow ok={rules.r1} text="At least 6 characters" />
              <RuleRow ok={rules.r2} text="Contains a number" />
              <RuleRow ok={rules.r3} text="Uppercase & lowercase mixed" />
            </Box>

            <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: T.textMuted, letterSpacing: "1px", textTransform: "uppercase", mb: "7px" }}>Confirm password</Typography>
            <Box sx={{ position: "relative", mb: cpw.length ? "8px" : "20px" }}>
              <input type={showCpw ? "text" : "password"} placeholder="Re-enter password" value={cpw} onChange={e => setCpw(e.target.value)}
                style={{ width: "100%", padding: "11px 44px 11px 14px", background: T.paperAlt, color: T.textMain, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color .2s" }}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              <IconButton onClick={() => setShowCpw(v => !v)} sx={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: T.textMuted, p: "4px", "&:hover": { color: T.textSub } }}>
                {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            </Box>

            {cpw.length > 0 && (
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: matched ? T.green : T.red, mb: "14px" }}>
                {matched ? "Passwords match" : "Passwords do not match"}
              </Typography>
            )}

            <Button onClick={handleSave} fullWidth disabled={!canSave || loading}
              sx={{ bgcolor: canSave ? T.accent : "rgba(255,255,255,0.05)", color: canSave ? "#07090F" : T.textMuted, border: `1px solid ${canSave ? T.accent : "rgba(255,255,255,0.07)"}`, fontWeight: 700, fontSize: "14.5px", py: "12px", borderRadius: "12px", textTransform: "none", transition: "all .2s", "&:hover": canSave ? { bgcolor: "#00bfca" } : {}, "&.Mui-disabled": { opacity: 0.5, color: T.textMuted } }}>
              {loading ? "Updating..." : "Confirm & save"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── STAT ROW ─────────────────────────────────────────────────────
function StatRow({ icon, label, value, isText }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center"
      sx={{ py: "11px", borderBottom: `1px solid ${T.border}`, "&:last-child": { borderBottom: "none" } }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: T.textMuted, display: "flex" }}>{icon}</Box>
        <Typography sx={{ color: T.textSub, fontSize: "13px" }}>{label}</Typography>
      </Stack>
      {isText
        ? <Typography sx={{ color: T.textSub, fontWeight: 600, fontSize: "13px" }}>{value}</Typography>
        : <Typography sx={{ color: T.accent, fontWeight: 700, fontSize: "20px", lineHeight: 1 }}>{value}</Typography>
      }
    </Stack>
  );
}

// ─── INFO FIELD ───────────────────────────────────────────────────
function InfoField({ icon, label, value, isMono }) {
  return (
    <Box>
      <Typography sx={{ color: T.textMuted, fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", mb: "7px" }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: T.accent, display: "flex", opacity: 0.75, flexShrink: 0 }}>{icon}</Box>
        <Typography sx={{ color: isMono ? T.textSub : T.textMain, fontWeight: 500, fontSize: isMono ? "12px" : "13.5px", wordBreak: "break-all", fontFamily: isMono ? "'JetBrains Mono','Fira Code',monospace" : "inherit" }}>
          {value || "—"}
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function AdminProfile() {
  const [user, setUser] = useState({ id: "", name: "", email: "", role: "admin" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user") || "{}");
    if (saved) {
      setUser({
        id:    saved._id   || saved.id   || "",
        name:  saved.name  || "Admin",
        email: saved.email || "",
        role:  saved.role  || "admin",
      });
    }
  }, []);

  const initials = user.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">

        {/* ── BANNER CARD ── */}
        <Paper elevation={0} sx={{ bgcolor: T.paper, border: `1px solid ${T.border}`, borderRadius: "22px", overflow: "hidden", mb: 3 }}>
          {/* Cover */}
          <Box sx={{ height: 175, bgcolor: T.paper, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(0,210,220,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,220,1) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
            <Box sx={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", bgcolor: T.accent, opacity: 0.07 }} />
            <Chip
              label="SYSTEM ADMINISTRATOR"
              icon={<Zap size={13} color={T.accent} />}
              sx={{ position: "absolute", top: 18, right: 20, bgcolor: "rgba(0,0,0,0.55)", color: T.accent, fontWeight: 800, fontSize: "10px", letterSpacing: "1.4px", border: `1px solid ${T.accentBorder}`, "& .MuiChip-icon": { ml: "8px" } }}
            />
          </Box>

          {/* Profile row */}
          <Box sx={{ px: { xs: 3, md: "28px" }, pb: "28px" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, gap: 2.5, mt: "-1px" }}>

              {/* Avatar */}
              <Box sx={{ width: 104, height: 104, borderRadius: "50%", border: `5px solid ${T.paper}`, bgcolor: "rgba(0,210,220,0.12)", boxShadow: `0 0 0 1px ${T.accentBorder}, 0 16px 40px rgba(0,0,0,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ color: T.accent, fontSize: "34px", fontWeight: 800, lineHeight: 1, userSelect: "none" }}>
                  {initials}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" }, mb: "6px" }}>
                <Typography sx={{ color: T.textMain, fontWeight: 800, fontSize: { xs: "22px", md: "26px" }, letterSpacing: "-.5px", mb: "4px" }}>
                  {user.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "center", sm: "flex-start" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: T.green, flexShrink: 0 }} />
                  <Typography sx={{ color: T.textSub, fontSize: "12.5px", fontWeight: 500 }}>
                    Root Access &nbsp;·&nbsp; System Administrator
                  </Typography>
                </Stack>
              </Box>

              <Button onClick={() => setOpen(true)} startIcon={<Key size={15} />}
                sx={{ mb: { xs: 0, sm: "6px" }, bgcolor: "transparent", color: T.textMain, border: `1px solid ${T.borderHover}`, borderRadius: "10px", px: "20px", py: "9px", textTransform: "none", fontWeight: 600, fontSize: "13px", "&:hover": { borderColor: T.accent, color: T.accent, bgcolor: T.accentDim }, transition: "all .2s" }}>
                Security update
              </Button>
            </Box>
          </Box>
        </Paper>

    {/* ── CONTENT GRID ── */}
<Grid container spacing={3} sx={{ alignItems: 'stretch' }}>

  {/* LEFT COLUMN: Access Details */}
  <Grid item xs={12} md={4}>
    <Stack spacing={3} sx={{ height: '100%', width: "220px" }}>
      {/* Access Details Box */}
      <Paper elevation={0} sx={{ 
        p: "20px", 
        bgcolor: T.paper, 
        border: `1px solid ${T.border}`, 
        borderRadius: "18px",
        flexGrow: 1 // Yeh box ko stretch karega
      }}>
        <Typography sx={{ color: T.textMuted, fontSize: "10.5px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", mb: "16px" }}>
          Access details
        </Typography>
        <StatRow icon={<Layout size={15} />} label="Access level" value="Root" isText={true} />
        <StatRow icon={<Calendar size={15} />} label="Account type" value={user.role?.toUpperCase() || "ADMIN"} isText={true} />
        <StatRow icon={<Fingerprint size={15} />} label="Security level" value="Level 5" isText={true} />
      </Paper>

      {/* Active Status Box */}
      <Paper elevation={0} sx={{ p: "14px 18px", bgcolor: T.greenDim, border: `1px solid ${T.greenBorder}`, borderRadius: "18px" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: "8px", bgcolor: "rgba(34,197,94,0.1)", borderRadius: "10px", display: "flex" }}>
            <ShieldCheck size={20} color={T.green} />
          </Box>
          <Box>
            <Typography sx={{ color: T.green, fontWeight: 700, fontSize: "13.5px" }}>Account active</Typography>
            <Typography sx={{ color: "rgba(34,197,94,0.65)", fontSize: "12px", mt: "2px" }}>Full system access granted</Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  </Grid>

  {/* RIGHT COLUMN: Identification Details */}
  <Grid item xs={12} md={8}>
    <Paper elevation={0} sx={{ 
      p: { xs: "20px", md: "26px" }, 
      bgcolor: T.paper, 
      border: `1px solid ${T.border}`, 
      borderRadius: "18px", 
      width:"650px",
      height: "100%", // Dono columns ki height barabar karne ke liye
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography sx={{ color: T.textMuted, fontSize: "10.5px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", mb: 3 }}>
        Identification details
      </Typography>

      <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
        <Grid item xs={12} sm={6}>
          <InfoField icon={<User size={16} />} label="Full name" value={user.name} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoField icon={<Mail size={16} />} label="Email" value={user.email} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoField icon={<Fingerprint size={16} />} label="User ID" value={user.id} isMono />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoField icon={<Briefcase size={16} />} label="Designation" value="System Administrator" />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: T.border }} />

      {/* Admin Privileges Info Box */}
      <Box sx={{ 
        mt: 'auto', // Isko hamesha bottom par rakhega
        p: "13px 15px", 
        bgcolor: T.accentDim, 
        borderRadius: "12px", 
        border: `1px solid ${T.accentBorder}`, 
        display: "flex", 
        gap: "10px", 
        alignItems: "flex-start" 
      }}>
        <Box sx={{ display: "flex", mt: "2px", flexShrink: 0 }}>
          <Info size={15} color={T.accent} />
        </Box>
        <Box>
          <Typography sx={{ color: T.accent, fontSize: "13px", fontWeight: 600, mb: "3px" }}>
            Admin privileges
          </Typography>
          <Typography sx={{ color: T.textSub, fontSize: "12.5px", lineHeight: 1.6 }}>
            You have full system access. Manage users, expos, and platform settings from the dashboard.
          </Typography>
        </Box>
      </Box>
    </Paper>
  </Grid>

</Grid>
      </Container>

      <PasswordDialog open={open} onClose={() => setOpen(false)} userEmail={user.email} />
    </Box>
  );
}