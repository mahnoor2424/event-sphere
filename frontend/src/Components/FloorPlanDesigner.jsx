import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button, Paper, CircularProgress, Container, Stack, Chip, Tooltip } from "@mui/material";
import { 
  ArrowBackIosNew as BackIcon, 
  Save as SaveIcon, 
  LockRounded as ReservedIcon, 
  AddRounded as AddIcon,
  PersonPinCircle as AssignIcon 
} from "@mui/icons-material";
import Swal from "sweetalert2";

export default function FloorPlanDesigner() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestId = queryParams.get("requestId"); 

  const [expo, setExpo] = useState(null);
  const [selectedBooths, setSelectedBooths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchExpoData(); }, [id]);

  const fetchExpoData = () => {
    axios.get(`http://localhost:5000/api/expo/get-expo/${id}`)
      .then(res => {
        setExpo(res.data);
        if (res.data.booths?.layout) setSelectedBooths(res.data.booths.layout);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleBoothClick = async (r, c) => {
    if (!expo) return;

    // Generate Global Code
    const rowLabel = String.fromCharCode(65 + r);
    const colLabel = (c + 1).toString().padStart(2, '0');
    const displayCode = `${rowLabel}-${colLabel}`;
    const boothUniqueId = `EXP-${id.slice(-4).toUpperCase()}-${displayCode}`;

    const targetBooth = selectedBooths.find(b => b.id === boothUniqueId);

    if (requestId) {
        // --- ASSIGNMENT MODE (Only Blue booths can be assigned) ---
        if (!targetBooth) {
          Swal.fire({ title: "No Space", text: "Please create a booth here in Design Mode first.", icon: "info", background: '#0A0D14', color: '#fff' });
          return;
        }
        if (targetBooth.status === 'reserved') {
          Swal.fire({ title: "Occupied", text: "This booth is already RED (Reserved).", icon: "error", background: '#0A0D14', color: '#fff' });
          return;
        }

        // Logic: Turn Blue into Red
        Swal.fire({
            title: 'Assign Exhibitor?',
            html: `Assign Booth <b>${displayCode}</b>? It will turn <b>RED</b>.`,
            icon: 'question',
            showCancelButton: true, confirmButtonColor: '#38bdf8', background: '#0A0D14', color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.put(`http://localhost:5000/api/expo/assign-booth/${id}`, { boothId: boothUniqueId, requestId: requestId });
                    Swal.fire("Assigned!", "Booth marked as Reserved.", "success");
                    navigate('/admin/exhibitors/requests');
                } catch (e) { Swal.fire("Error", "Assignment failed.", "error"); }
            }
        });
        return;
    }

    // --- DESIGN MODE (Admin creating Cyan booths) ---
    if (targetBooth) {
      if(targetBooth.status === 'reserved') return; // Cannot delete Red booths
      setSelectedBooths(selectedBooths.filter(b => b.id !== boothUniqueId));
    } else {
      // ✅ LOGIC: Check limit from Expo Creation
      const maxLimit = parseInt(expo.booths.total) || 0;

      if (selectedBooths.length < maxLimit) {
        setSelectedBooths([...selectedBooths, { id: boothUniqueId, code: displayCode, row: r, col: c, status: 'available' }]);
      } else {
        Swal.fire({ title: "Limit Reached", text: `You set a limit of ${maxLimit} booths for this expo.`, icon: "warning", background: '#0A0D14', color: '#fff' });
      }
    }
  };

  const saveLayout = async () => {
    try {
      await axios.put(`http://localhost:5000/api/expo/update-layout/${id}`, { layout: selectedBooths });
      Swal.fire({ title: "Layout Saved!", icon: "success", background: "#0A0D14", color: "#fff", timer: 1000, showConfirmButton: false });
    } catch (err) { Swal.fire("Error", "Failed to save structure.", "error"); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{color: '#38bdf8'}} /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ color: "#94a3b8", textTransform: 'none' }}>Back</Button>
          {requestId && <Chip icon={<AssignIcon style={{color: '#000'}}/>} label="ASSIGNMENT MODE" sx={{ bgcolor: '#fbbf24', color: '#000', fontWeight: 800 }} />}
      </Stack>

      <Paper sx={{ p: 4, bgcolor: "#0A0D14", color: "#fff", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>{requestId ? "Assign Booth" : "Floor Plan Designer"}</Typography>
          <Typography variant="body2" sx={{ color: "#38bdf8" }}>{expo.title} (Target: {expo.booths.total} | Placed: {selectedBooths.length})</Typography>
        </Box>

        <Stack direction="row" spacing={3} sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <Stack direction="row" alignItems="center" spacing={1}><Box sx={{ width: 12, height: 12, bgcolor: '#38bdf8', borderRadius: '3px' }} /><Typography variant="caption">Available (Blue)</Typography></Stack>
          <Stack direction="row" alignItems="center" spacing={1}><Box sx={{ width: 12, height: 12, bgcolor: '#f43f5e', borderRadius: '3px' }} /><Typography variant="caption">Reserved (Red)</Typography></Stack>
          <Stack direction="row" alignItems="center" spacing={1}><Box sx={{ width: 12, height: 12, border: '1px dashed #333', borderRadius: '3px' }} /><Typography variant="caption">Empty Path</Typography></Stack>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1, p: 1.5, bgcolor: '#05070A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[...Array(10)].map((_, r) => [...Array(10)].map((_, c) => {
              const rowLabel = String.fromCharCode(65 + r);
              const colLabel = (c + 1).toString().padStart(2, '0');
              const dCode = `${rowLabel}-${colLabel}`;
              const boothId = `EXP-${id.slice(-4).toUpperCase()}-${dCode}`;
              const booth = selectedBooths.find(b => b.id === boothId);

              return (
                <Tooltip key={boothId} title={booth ? `Booth ${dCode}` : "Add Booth"} arrow>
                  <Box onClick={() => handleBoothClick(r, c)}
                    sx={{
                      aspectRatio: '1/1', borderRadius: '6px', cursor: 'pointer',
                      bgcolor: booth ? (booth.status === 'reserved' ? "#f43f5e" : "#38bdf8") : "rgba(255,255,255,0.02)",
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: '0.2s', border: booth ? 'none' : '1px dashed rgba(255,255,255,0.05)',
                      '&:hover': { transform: 'scale(1.1)', zIndex: 2 }
                    }}>
                      {booth ? (
                        <>
                          <Typography sx={{ fontSize: '9px', fontWeight: 900, color: '#000' }}>{dCode}</Typography>
                          {booth.status === 'reserved' && <ReservedIcon sx={{ fontSize: 10, color: '#fff', mt: 0.1 }} />}
                        </>
                      ) : (
                        <AddIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.05)' }} />
                      )}
                  </Box>
                </Tooltip>
              )
          }))}
        </Box>

        {!requestId && (
          <Button fullWidth variant="contained" onClick={saveLayout} startIcon={<SaveIcon />} sx={{ mt: 4, bgcolor: "#38bdf8", color: "#000", fontWeight: 800, py: 1.5, borderRadius: '12px', "&:hover": { bgcolor: "#fff" } }}>
            Save Final Structure
          </Button>
        )}
      </Paper>
    </Container>
  );
}