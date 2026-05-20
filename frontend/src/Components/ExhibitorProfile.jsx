import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Stack, Divider,
  Button, Chip, Grid, Dialog, DialogTitle, DialogContent,
  TextField, IconButton, CircularProgress, InputAdornment, Avatar,
} from "@mui/material";
import {
  Key, X, Zap, Fingerprint, Eye, EyeOff, Check, Lock,
  Camera, BadgeCheck, Clock, Globe, Phone, MapPin,
  FileText, Trash2, Save, Info,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

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
  amberDim:     "rgba(245,158,11,0.08)",
  amberBorder:  "rgba(245,158,11,0.22)",
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
      <Box sx={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: ok ? "none" : `1.5px solid rgba(255,255,255,0.1)`, bgcolor: ok ? "rgba(34,197,94,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
        {ok && <Check size={10} color={T.green} strokeWidth={3} />}
      </Box>
      <Typography sx={{ fontSize: "12.5px", color: ok ? T.textSub : T.textMuted, transition: "color .2s" }}>{text}</Typography>
    </Stack>
  );
}

// ─── PASSWORD DIALOG ─────────────────────────────────────────────
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
      Swal.fire({ title: "Error", text: "Could not update password.", icon: "error", background: T.paper, color: T.textMain, confirmButtonColor: T.accent });
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

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: T.textMain,
    bgcolor: T.paperAlt,
    borderRadius: "12px",
    fontSize: "13.5px",
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: T.accentBorder },
    "&.Mui-focused fieldset": { borderColor: T.accent },
  },
  "& .MuiInputLabel-root": { color: T.textMuted, fontSize: "13px" },
  "& .MuiInputLabel-root.Mui-focused": { color: T.accent },
  "& .MuiInputAdornment-root svg": { color: T.textMuted },
  mb: 2.5,
};

// ─── MAIN ─────────────────────────────────────────────────────────
export default function ExhibitorProfile() {
  const fileInputRef = useRef(null);
  const docInputRef  = useRef(null);

  const [user,      setUser]    = useState({ id: "", name: "", email: "", role: "exhibitor" });
  const [profile, setProfile] = useState({ organization: "", phone: "", website: "", description: "", logo: "", city: "", isVerified: false, documents: [] });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user") || "{}");
    if (saved) {
      const uid = saved._id || saved.id || "";
      setUser({ id: uid, name: saved.name || "Exhibitor", email: saved.email || "", role: saved.role || "exhibitor" });
      fetchProfile(uid);
    }
  }, []);

  const fetchProfile = async (uid) => {
    if (!uid) { setLoading(false); return; }
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${uid}`);
      setProfile({ organization: "", phone: "", website: "", description: "", logo: "", city: "", isVerified: false, documents: [], ...res.data });
    } catch { console.error("Profile fetch error"); }
    finally { setLoading(false); }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(p => ({ ...p, logo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(p => ({ ...p, documents: [...(p.documents || []), reader.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removeDoc = (i) => setProfile(p => ({ ...p, documents: p.documents.filter((_, idx) => idx !== i) }));

  const handleUpdate = async () => {
    if (!profile.organization?.trim()) return Swal.fire({ title: "Required", text: "Organization name is missing", icon: "warning", background: T.paper, color: T.textMain, confirmButtonColor: T.accent });
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/auth/update-profile/${user.id}`, profile);
      Swal.fire({ title: "Profile Updated", icon: "success", background: T.paper, color: T.textMain, confirmButtonColor: T.accent });
    } catch {
      Swal.fire({ title: "Error", text: "Update failed.", icon: "error", background: T.paper, color: T.textMain, confirmButtonColor: T.accent });
    } finally { setSaving(false); }
  };

  const initials = user.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (loading) return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: T.accent }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 } }}>
      
      {/* ── CENTRALIZED WRAPPER ── */}
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>

        {/* ── BANNER CARD ── */}
        <Paper elevation={0} sx={{ bgcolor: T.paper, border: `1px solid ${T.border}`, borderRadius: "22px", overflow: "hidden", mb: 3 }}>
          <Box sx={{ height: 175, bgcolor: T.paper, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(0,210,220,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,210,220,1) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
            <Box sx={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", bgcolor: T.accent, opacity: 0.07 }} />
            <Chip label="CERTIFIED EXHIBITOR" icon={<Zap size={13} color={T.accent} />}
              sx={{ position: "absolute", top: 18, right: 20, bgcolor: "rgba(0,0,0,0.55)", color: T.accent, fontWeight: 800, fontSize: "10px", letterSpacing: "1.4px", border: `1px solid ${T.accentBorder}`, "& .MuiChip-icon": { ml: "8px" } }} />
          </Box>

          <Box sx={{ px: { xs: 3, md: "28px" }, pb: "28px" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, gap: 2.5, mt: "-1px" }}>

              {/* Avatar / Logo */}
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Box sx={{ width: 104, height: 104, borderRadius: "50%", border: `5px solid ${T.paper}`, bgcolor: profile.logo ? "transparent" : "rgba(0,210,220,0.12)", boxShadow: `0 0 0 1px ${profile.isVerified ? T.greenBorder : T.accentBorder}, 0 16px 40px rgba(0,0,0,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {profile.logo
                    ? <img src={profile.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Typography sx={{ color: T.accent, fontSize: "34px", fontWeight: 800, lineHeight: 1, userSelect: "none" }}>{initials}</Typography>
                  }
                </Box>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleLogoChange} />
                <IconButton onClick={() => fileInputRef.current.click()}
                  sx={{ position: "absolute", bottom: 2, right: 2, width: 28, height: 28, bgcolor: T.accent, color: "#07090F", border: `2px solid ${T.paper}`, "&:hover": { bgcolor: "#00bfca" } }}>
                  <Camera size={13} />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" }, mb: "6px" }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "center", sm: "flex-start" }}>
                  <Typography sx={{ color: T.textMain, fontWeight: 800, fontSize: { xs: "22px", md: "26px" }, letterSpacing: "-.5px" }}>
                    {profile.organization || user.name}
                  </Typography>
                  {profile.isVerified && <BadgeCheck size={20} color={T.green} />}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "center", sm: "flex-start" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: profile.isVerified ? T.green : T.amber, flexShrink: 0 }} />
                  <Typography sx={{ color: T.textSub, fontSize: "12.5px", fontWeight: 500 }}>
                    {profile.isVerified ? "Certified Exhibitor" : "Under Review"} &nbsp;·&nbsp; {user.email}
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

      {/* ── 2-COL EXHIBITOR CONTENT (FIXED ALIGNMENT) ── */}
        <Grid 
          container 
          sx={{ 
            width: "100%", 
            m: 0,            // Margins zero kiye taake alignment out na ho
            p: 0, 
            gap: "20px"
          }}
        >
          {/* LEFT — Corporate Details */}
          <Grid item xs={12} md={5.9} sx={{ p: 0, mb: { xs: 3, md: 0, width: "400px" } }}>
            <Paper elevation={0} sx={{ p: { xs: "20px", md: "26px" }, bgcolor: T.paper, border: `1px solid ${T.border}`, borderRadius: "18px", height: "100%" }}>
              <Typography sx={{ color: T.textMuted, fontSize: "10.5px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", mb: 3 }}>
                Corporate details
              </Typography>

              <TextField fullWidth label="Organization Name" value={profile.organization}
                onChange={e => setProfile(p => ({ ...p, organization: e.target.value }))} sx={inputSx} />

              <TextField fullWidth multiline rows={6} label="Business Description" value={profile.description}
                onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} sx={{ ...inputSx, mb: 0 }} />
            </Paper>
          </Grid>

          {/* RIGHT — Contact + Documents + Save */}
          <Grid item xs={12} md={5.9} sx={{ p: 0, width: "480px" }}>
            <Paper elevation={0} sx={{ p: { xs: "20px", md: "26px" }, bgcolor: T.paper, border: `1px solid ${T.border}`, borderRadius: "18px", height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography sx={{ color: T.textMuted, fontSize: "10.5px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", mb: 3 }}>
                Contact & location
              </Typography>

              <TextField fullWidth label="Website URL" value={profile.website}
                onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} sx={inputSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Globe size={16} /></InputAdornment> }} />

              <TextField fullWidth label="Phone (11 digits)" value={profile.phone} inputProps={{ maxLength: 11 }}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} sx={inputSx}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment> }} />

              <TextField fullWidth label="Headquarters City" value={profile.city}
                onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} sx={{ ...inputSx, mb: 0 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={16} /></InputAdornment> }} />

              <Divider sx={{ my: 2.5, borderColor: T.border }} />

              {/* Documents Section */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ color: T.textMuted, fontSize: "10.5px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  Verification docs
                </Typography>
                <input type="file" ref={docInputRef} style={{ display: "none" }} multiple accept=".pdf,image/*" onChange={handleDocUpload} />
                <Button onClick={() => docInputRef.current.click()} disabled={profile.isVerified} size="small"
                  sx={{ bgcolor: "transparent", color: profile.isVerified ? T.textMuted : T.textMain, border: `1px solid ${profile.isVerified ? T.border : T.borderHover}`, borderRadius: "8px", px: "12px", py: "5px", textTransform: "none", fontWeight: 600, fontSize: "12px", "&:hover": !profile.isVerified ? { borderColor: T.accent, color: T.accent, bgcolor: T.accentDim } : {}, transition: "all .2s" }}>
                  {profile.isVerified ? "Locked" : "+ Add"}
                </Button>
              </Stack>

              {profile.documents?.length > 0 ? (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {profile.documents.map((doc, i) => (
                    <Box key={i} sx={{ p: "10px 12px", bgcolor: T.paperAlt, border: `1px solid ${profile.isVerified ? T.greenBorder : T.border}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 28, height: 28, borderRadius: "7px", bgcolor: profile.isVerified ? T.greenDim : T.accentDim, border: `1px solid ${profile.isVerified ? T.greenBorder : T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={13} color={profile.isVerified ? T.green : T.accent} />
                        </Box>
                        <Box>
                          <Typography sx={{ color: T.textMain, fontSize: "12px", fontWeight: 600 }}>Document_{i + 1}</Typography>
                          <Typography sx={{ color: profile.isVerified ? T.green : T.textMuted, fontSize: "10.5px" }}>
                            {profile.isVerified ? "Verified" : "Under Review"}
                          </Typography>
                        </Box>
                      </Stack>
                      {!profile.isVerified && (
                        <IconButton size="small" onClick={() => removeDoc(i)} sx={{ color: T.red, p: "4px", borderRadius: "6px", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
                          <Trash2 size={14} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ py: 2.5, mb: 2, textAlign: "center", border: `1px dashed ${T.border}`, borderRadius: "10px" }}>
                  <Typography sx={{ color: T.textMuted, fontSize: "12.5px" }}>No documents uploaded yet.</Typography>
                </Box>
              )}

              {/* Save button pinned to bottom */}
              <Box sx={{ mt: "auto" }}>
                <Button onClick={handleUpdate} fullWidth disabled={saving}
                  startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <Save size={15} />}
                  sx={{ bgcolor: T.accent, color: "#07090F", fontWeight: 700, fontSize: "14px", py: "12px", borderRadius: "12px", textTransform: "none", "&:hover": { bgcolor: "#00bfca" }, "&.Mui-disabled": { opacity: 0.5 } }}>
                  {saving ? "Saving changes..." : "Update profile"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <PasswordDialog open={open} onClose={() => setOpen(false)} userEmail={user.email} />
    </Box>
  );
}