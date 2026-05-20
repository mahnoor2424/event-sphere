import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";
import { 
  Box, Typography, Paper, TextField, Button, Stack, Container, 
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, 
  InputLabel, FormControl, CircularProgress
} from "@mui/material";
import { 
  DeleteSweepTwoTone as DeleteIcon,
  CloudDownloadTwoTone as DownloadIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#00b8d1",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8",
};

const STAFF_ROLES = ["Sales", "Technical", "Manager", "Security", "Support"];

export default function ExhibitorStaff() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(""); 
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", role: "Sales" });

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const exhibitorId = userData?._id || userData?.id;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      backgroundColor: "rgba(255,255,255,0.01)",
      borderRadius: "12px",
      fontSize: "14px",
      "& fieldset": { borderColor: THEME.border },
      "&:hover fieldset": { borderColor: THEME.accent },
      "&.Mui-focused fieldset": { borderColor: THEME.accent },
    },
    "& .MuiInputLabel-root": { color: THEME.textSecondary, fontSize: '13px' },
    "& .MuiInputLabel-root.Mui-focused": { color: THEME.accent },
  };

  useEffect(() => { if (exhibitorId) fetchAllData(); }, [exhibitorId]);

  const fetchAllData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/events/my-events/${exhibitorId}`);
      setAllEvents(res.data || []);
      if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteMember = async (eventIndex, memberIndex) => {
    const targetEvent = allEvents[eventIndex];
    const memberToDelete = targetEvent.staff[memberIndex];

    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `Are you sure you want to remove ${memberToDelete.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: THEME.border,
      confirmButtonText: "Yes, Delete",
      background: THEME.card,
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const updatedStaff = targetEvent.staff.filter((_, idx) => idx !== memberIndex);
        await axios.put("http://localhost:5000/api/events/update-staff", {
          exhibitorId,
          expoId: targetEvent.expoId._id,
          boothNumber: targetEvent.boothNumber,
          staff: updatedStaff
        });
        const updatedEvents = [...allEvents];
        updatedEvents[eventIndex].staff = updatedStaff;
        setAllEvents(updatedEvents);
        Swal.fire({ title: "Removed!", icon: "success", background: THEME.card, color: "#fff", timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ title: "Error", text: "Failed to delete.", icon: "error", background: THEME.card, color: "#fff" });
      }
    }
  };
const handleDownloadPass = async (member, eventInfo) => {
    if (!member.isPassIssued) {
      return Swal.fire({
        title: "Hold on!",
        text: "Admin approval is pending.",
        icon: "info",
        background: THEME.card,
        color: "#fff"
      });
    }

    const qrData = JSON.stringify({ id: member.passId, role: member.role });
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      margin: 1,
      color: { dark: '#00b8d1', light: '#ffffff' },
      width: 200
    });

    const initial = member.name?.charAt(0).toUpperCase() || "?";
    const expoTitle = eventInfo.expoId?.title?.toUpperCase() || "EVENT SPHERE";
    const passId = member.passId?.substring(0, 10).toUpperCase() || "EXH-000000";
    const boothNo = eventInfo.boothNumber?.toString() || "B-01";
    const role = member.role?.toUpperCase() || "STAFF";

    // Hidden div banao DOM mein
    const container = document.createElement('div');
    container.style.cssText = `
      position:fixed; left:-9999px; top:-9999px;
      width:580px; height:230px;
    `;

    container.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=DM+Sans:wght@400;700&display=swap" rel="stylesheet"/>
      <div id="pass-render" style="
        width:580px; height:230px; border-radius:18px; overflow:hidden;
        display:flex; font-family:'DM Sans',sans-serif;
        border:1px solid rgba(0,184,209,0.25);
        background:#0A0D14;
      ">
        <!-- LEFT CYAN SIDEBAR -->
        <div style="
          width:175px; flex-shrink:0; background:#00b8d1;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:10px; padding:16px; position:relative;
          clip-path:polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%);
        ">
          <div style="
            width:68px; height:68px; border-radius:50%;
            background:rgba(0,0,0,0.2); border:2px solid rgba(255,255,255,0.6);
            display:flex; align-items:center; justify-content:center;
            font-family:'Orbitron',monospace; font-size:28px; font-weight:700; color:#fff;
          ">${initial}</div>
          <div style="
            font-size:9px; letter-spacing:0.1em; color:rgba(0,0,0,0.65);
            font-weight:700; text-align:center; text-transform:uppercase;
            background:rgba(0,0,0,0.12); border-radius:4px; padding:3px 10px;
          ">${role}</div>
        </div>

        <!-- RIGHT CONTENT -->
        <div style="
          flex:1; background:#0A0D14; padding:18px 22px 16px 24px;
          display:flex; flex-direction:column; justify-content:space-between;
        ">
          <!-- TOP ROW -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-size:9px; letter-spacing:0.16em; color:#00b8d1; font-weight:700;">${expoTitle}</div>
              <div style="font-family:'Orbitron',monospace; font-size:19px; font-weight:700; color:#fff; letter-spacing:0.04em; margin-top:3px;">${member.name.toUpperCase()}</div>
            </div>
            <div style="
              background:rgba(0,184,209,0.1); border:1px solid rgba(0,184,209,0.35);
              border-radius:5px; padding:4px 10px; font-size:8px; color:#00b8d1;
              letter-spacing:0.12em; font-weight:700;
            ">STAFF PASS</div>
          </div>

          <!-- MID ROW -->
          <div style="display:flex; gap:24px;">
            <div>
              <div style="font-size:8px; color:#475569; letter-spacing:0.1em; margin-bottom:3px;">STAFF ID</div>
              <div style="font-size:13px; color:#00b8d1; font-weight:700;">${passId}</div>
            </div>
            <div>
              <div style="font-size:8px; color:#475569; letter-spacing:0.1em; margin-bottom:3px;">BOOTH NO.</div>
              <div style="font-size:13px; color:#e2e8f0; font-weight:700;">${boothNo}</div>
            </div>
            <div>
              <div style="font-size:8px; color:#475569; letter-spacing:0.1em; margin-bottom:3px;">ACCESS ZONE</div>
              <div style="font-size:13px; color:#e2e8f0; font-weight:700;">Exhibitor</div>
            </div>
            <div>
              <div style="font-size:8px; color:#475569; letter-spacing:0.1em; margin-bottom:3px;">STATUS</div>
              <div style="font-size:13px; color:#10b981; font-weight:700;">Confirmed</div>
            </div>
          </div>

          <!-- BOTTOM ROW -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
              <div style="font-size:7px; color:#334155; letter-spacing:0.12em; margin-bottom:5px;">SCAN AT EXHIBITOR ENTRY GATE</div>
              <div style="display:flex; align-items:flex-end; gap:3px; height:26px;">
                ${[8,18,26,14,22,10,24,16,20,12].map(h =>
                  `<div style="width:5px;height:${h}px;border-radius:2px;background:#00b8d1;"></div>`
                ).join('')}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="font-size:7px; color:#1e3a4a; letter-spacing:0.07em; text-align:right; line-height:1.6;">
                NON-TRANSFERABLE<br/>ONE ENTRY ONLY
              </div>
              <div style="
                width:70px; height:70px; background:#fff; border-radius:8px;
                display:flex; align-items:center; justify-content:center;
                border:1.5px solid rgba(0,184,209,0.3);
              ">
                <img src="${qrCodeImage}" style="width:58px;height:58px;" alt="QR"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Font load ka wait
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 500));

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(container.querySelector('#pass-render'), {
        scale: 3,
        useCORS: true,
        backgroundColor: '#0A0D14',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      // Landscape PDF — pass size ke mutabiq
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [580, 230] });
      pdf.addImage(imgData, 'PNG', 0, 0, 580, 230);
      pdf.save(`StaffPass_${member.name.replace(/\s+/g, '_')}.pdf`);

    } finally {
      document.body.removeChild(container);
    }
  };

  const handleAddMember = async () => {
    const targetEvent = allEvents.find(e => e._id === selectedEvent);
    if (!targetEvent) return;
    const updatedStaff = [...(targetEvent.staff || []), { ...newMember, isPassIssued: false }];
    try {
      await axios.put("http://localhost:5000/api/events/update-staff", {
        exhibitorId,
        expoId: targetEvent.expoId._id,
        boothNumber: targetEvent.boothNumber,
        staff: updatedStaff
      });
      setOpen(false);
      setNewMember({ name: "", email: "", phone: "", role: "Sales" });
      fetchAllData();
      Swal.fire({ title: "Requested", text: "Sent for Admin Approval", icon: "success", background: THEME.card, color: "#fff" });
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff" }}>
          Staff <span style={{ color: THEME.accent }}>Passes</span>
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}
          sx={{ bgcolor: THEME.accent, color: "#000", fontWeight: 800, borderRadius: '10px' }}>
          + Add Personnel
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: THEME.card, borderRadius: '20px', border: `1px solid ${THEME.border}`, backgroundImage: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>STAFF / ROLE</TableCell>
              <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>EVENT</TableCell>
              <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>STATUS</TableCell>
              <TableCell align="right" sx={{ color: THEME.textSecondary, fontWeight: 700 }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allEvents.map((event, eIdx) => (
              event.staff.map((m, mIdx) => (
                <TableRow key={`${event._id}-${mIdx}`} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                  <TableCell>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>{m.name}</Typography>
                    <Typography sx={{ color: THEME.accent, fontSize: '10px', textTransform: 'uppercase' }}>{m.role}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#fff', fontSize: '13px' }}>{event.expoId?.title}</Typography>
                    <Typography sx={{ color: THEME.textSecondary, fontSize: '11px' }}>Booth {event.boothNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.isPassIssued ? "Ready" : "Pending"} size="small"
                      sx={{
                        bgcolor: m.isPassIssued ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                        color: m.isPassIssued ? '#10b981' : '#ffc107', fontWeight: 700
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton onClick={() => handleDownloadPass(m, event)}
                        sx={{ color: m.isPassIssued ? THEME.accent : THEME.textSecondary }}>
                        <DownloadIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteMember(eIdx, mIdx)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open} onClose={() => setOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            width: "100%", maxWidth: "440px", bgcolor: "#0A0D14",
            borderRadius: '24px', border: `1px solid ${THEME.border}`, backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800, color: '#fff', pt: 3 }}>Add Staff</DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', pb: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: THEME.textSecondary }}>Target Expo</InputLabel>
              <Select value={selectedEvent} label="Target Expo" onChange={(e) => setSelectedEvent(e.target.value)}
                sx={{ color: '#fff', borderRadius: '12px', "& fieldset": { borderColor: THEME.border } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: "#0A0D14", border: `1px solid ${THEME.border}`, color: "#fff" } } }}>
                {allEvents.map(e => <MenuItem key={e._id} value={e._id} sx={{ fontSize: '13px' }}>{e.expoId?.title}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Full Name" size="small" sx={inputSx} value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            <TextField fullWidth label="Email" size="small" sx={inputSx} value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: THEME.textSecondary }}>Assign Role</InputLabel>
              <Select value={newMember.role} label="Assign Role" onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                sx={{ color: '#fff', borderRadius: '12px', "& fieldset": { borderColor: THEME.border } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: "#0A0D14", border: `1px solid ${THEME.border}`, color: "#fff" } } }}>
                {STAFF_ROLES.map(role => <MenuItem key={role} value={role} sx={{ fontSize: '13px' }}>{role}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Phone" size="small" sx={inputSx} value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button onClick={() => setOpen(false)} sx={{ color: THEME.textSecondary, mr: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMember}
            sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 800, borderRadius: '10px', px: 4 }}>
            Add Personnel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}