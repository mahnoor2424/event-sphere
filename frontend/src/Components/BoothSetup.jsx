import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, TextField, Button, Paper, 
  InputAdornment, Chip, Stack, Container, Divider, IconButton, CircularProgress, Avatar
} from "@mui/material";

// Icons
import { 
  StorefrontTwoTone as ShopIcon,
  CloudUploadTwoTone as UploadIcon,
  Inventory2TwoTone as ProductIcon,
  PeopleAltTwoTone as StaffIcon,
  ArrowBackIosNewRounded as BackIcon,
  AddCircleTwoTone as AddIcon,
  DeleteSweepTwoTone as DeleteIcon,
  PhotoCameraTwoTone as CameraIcon
} from "@mui/icons-material";

const THEME = {
  bg: "#05070A",
  paper: "#0A0D14",
  accent: "#00b8d1",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "rgba(255, 255, 255, 0.08)",
};

export default function BoothSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const bannerRef = useRef(null);
  const logoRef = useRef(null);
  
  const queryParams = new URLSearchParams(location.search);
  const expoId = queryParams.get("expoId");
  const boothId = queryParams.get("boothId");

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([""]);
  const [staff, setStaff] = useState([""]);
  const [banner, setBanner] = useState("");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    if (!expoId || !boothId) { navigate("/exhibitor/booth-selection"); return; }
    fetchCurrentBoothData();
  }, [expoId, boothId]);

  const fetchCurrentBoothData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expo/all-expos");
      const expo = res.data.find(e => e._id === expoId);
      const booth = expo?.booths?.layout?.find(b => b.id === boothId);
      
      if (booth?.boothDetails) {
        setShopName(booth.boothDetails.shopName || "");
        setDescription(booth.boothDetails.description || "");
        setProducts(booth.boothDetails.products?.map(p => p.name || p) || [""]);
        setStaff(booth.boothDetails.staff?.map(s => s.name || s) || [""]);
        setBanner(booth.boothDetails.banner || "");
        setLogo(booth.boothDetails.logo || "");
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'banner') setBanner(reader.result);
        else setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!shopName.trim() || !description.trim()) {
        return Swal.fire({ title: "Required", text: "Brand Name and Description are mandatory", icon: "warning", background: THEME.paper, color: "#fff" });
    }

    setIsSubmitting(true);
    const userData = JSON.parse(localStorage.getItem("user"));
    const currentExhibitorId = userData?._id || userData?.id;

    // 🟢 SYNC LOGIC: Convert for Backend compatibility
    const formattedProducts = products.filter(p => p.trim() !== "").map(p => ({ name: p }));
    const formattedStaff = staff.filter(s => s.trim() !== "").map(s => ({
        name: s,
        email: `${s.toLowerCase().replace(/\s/g, '')}@temp.com`,
        phone: "03000000000",
        role: "Sales",
        isPassIssued: false
    }));

    const payload = { 
      expoId, boothId, exhibitorId: currentExhibitorId,
      boothDetails: { 
        shopName, description, banner, logo,
        products: formattedProducts,
        staff: formattedStaff 
      } 
    };

    try {
      await axios.put("http://localhost:5000/api/events/update-booth-content", payload);
      await Swal.fire({ title: "Live!", text: "Your Digital Showcase is now active.", icon: "success", background: THEME.paper, color: "#fff" });
      navigate("/exhibitor/booth-selection"); 
    } catch (err) { 
      Swal.fire({ title: "Error", text: "Database Sync Failed", icon: "error", background: THEME.paper, color: "#fff" }); 
    } finally { setIsSubmitting(false); }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff", bgcolor: "rgba(255,255,255,0.01)", borderRadius: "16px",
      "& fieldset": { borderColor: THEME.border },
      "&:hover fieldset": { borderColor: THEME.accent },
      "&.Mui-focused fieldset": { borderColor: THEME.accent },
    },
    "& .MuiInputLabel-root": { color: THEME.textSecondary },
    mb: 3
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, bgcolor: THEME.bg, minHeight: '100vh' }}><CircularProgress sx={{ color: THEME.accent }} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: THEME.bg, pb: 8 }}>
      <Container maxWidth="lg">
        
        {/* HEADER SECTION */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 4 }}>
           <Box>
             <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ color: THEME.textSecondary, textTransform: 'none', mb: 1 }}>Back to selection</Button>
             <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff" }}>Showcase <span style={{ color: THEME.accent }}>Architect</span></Typography>
           </Box>
           <Chip label={`BOOTH ${boothId}`} sx={{ bgcolor: THEME.accent, color: "#000", fontWeight: 900, px: 2, height: 40, fontSize: '14px' }} />
        </Stack>

        {/* 🟢 VISUAL IDENTITY: BANNER & LOGO */}
        <Paper sx={{ 
            height: '260px', borderRadius: '32px', mb: 10, position: 'relative',
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${banner})`,
            backgroundSize: 'cover', backgroundPosition: 'center', bgcolor: '#111',
            border: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <input type="file" hidden ref={bannerRef} onChange={(e) => handleImageUpload(e, 'banner')} />
            {!banner && (
                <Button startIcon={<UploadIcon />} onClick={() => bannerRef.current.click()} sx={{ color: THEME.textSecondary }}>Upload Banner</Button>
            )}
            {banner && (
                <IconButton onClick={() => bannerRef.current.click()} sx={{ position: 'absolute', top: 20, right: 20, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}><CameraIcon /></IconButton>
            )}

            {/* LOGO POSITIONED ON OVERLAP */}
            <Box sx={{ position: 'absolute', bottom: '-50px', left: '40px', display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={logo} sx={{ width: 120, height: 120, border: `4px solid ${THEME.bg}`, bgcolor: THEME.paper, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <ShopIcon sx={{ fontSize: 50, color: THEME.border }} />
                    </Avatar>
                    <IconButton 
                        onClick={() => logoRef.current.click()}
                        sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: THEME.accent, color: '#000', "&:hover": {bgcolor: '#fff'} }} size="small"
                    >
                        <CameraIcon fontSize="small" />
                    </IconButton>
                    <input type="file" hidden ref={logoRef} onChange={(e) => handleImageUpload(e, 'logo')} />
                </Box>
                <Box sx={{ pb: 1 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>{shopName || "Your Brand Name"}</Typography>
                    <Typography sx={{ color: THEME.textSecondary, fontSize: '12px' }}>Digital Front Visuals</Typography>
                </Box>
            </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* LEFT: INFO & PRODUCTS */}
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, bgcolor: THEME.paper, borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
                <Typography sx={{ color: THEME.accent, fontWeight: 800, mb: 3, fontSize: '12px', letterSpacing: 1 }}>BRAND IDENTITY</Typography>
                <TextField fullWidth label="Official Showcase Name" value={shopName} onChange={(e) => setShopName(e.target.value)} sx={inputSx} />
                <TextField fullWidth multiline rows={4} label="Brand Story / Description" value={description} onChange={(e) => setDescription(e.target.value)} sx={inputSx} />
              </Paper>

              <Paper sx={{ p: 4, bgcolor: THEME.paper, borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography sx={{ color: THEME.accent, fontWeight: 800, fontSize: '12px', letterSpacing: 1 }}>PRODUCT CATALOG</Typography>
                    <Button startIcon={<AddIcon />} onClick={() => setProducts([...products, ""])} sx={{ color: THEME.accent, fontWeight: 700 }}>Add Item</Button>
                </Stack>
                {products.map((p, i) => (
                    <Stack key={i} direction="row" spacing={2} mb={2}>
                        <TextField fullWidth placeholder="E.g. Wireless Headphones" size="small" value={p} onChange={(e) => { const n = [...products]; n[i] = e.target.value; setProducts(n); }} sx={inputSx} />
                        <IconButton onClick={() => setProducts(products.filter((_, idx) => idx !== i))} sx={{ color: '#ef4444', mt: -3 }}><DeleteIcon /></IconButton>
                    </Stack>
                ))}
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT: STAFF & SUBMIT */}
          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, bgcolor: THEME.paper, borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography sx={{ color: THEME.accent, fontWeight: 800, fontSize: '12px', letterSpacing: 1 }}>BOOTH PERSONNEL</Typography>
                    <Button startIcon={<AddIcon />} onClick={() => setStaff([...staff, ""])} sx={{ color: THEME.accent, fontWeight: 700 }}>Add</Button>
                </Stack>
                {staff.map((s, i) => (
                    <Stack key={i} direction="row" spacing={2} mb={2}>
                        <TextField fullWidth placeholder="Staff Name" size="small" value={s} onChange={(e) => { const n = [...staff]; n[i] = e.target.value; setStaff(n); }} sx={inputSx} />
                        <IconButton onClick={() => setStaff(staff.filter((_, idx) => idx !== i))} sx={{ color: '#ef4444', mt: -3 }}><DeleteIcon /></IconButton>
                    </Stack>
                ))}
                <Typography sx={{ color: THEME.textSecondary, fontSize: '11px', mt: 1 }}>* Full details can be added in Staff Management.</Typography>
              </Paper>

              <Button 
                fullWidth variant="contained" onClick={handleSave} disabled={isSubmitting}
                sx={{ 
                    bgcolor: THEME.accent, color: '#000', fontWeight: 900, py: 2.5, borderRadius: '18px', fontSize: '16px',
                    boxShadow: `0 10px 30px ${THEME.accent}33`, '&:hover': { bgcolor: '#fff' }
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Publish Digital Showcase"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}