import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, CircularProgress, Stack,
  Dialog, Tooltip, Avatar
} from "@mui/material";
import {
  VisibilityTwoTone as ViewIcon,
  CheckCircleTwoTone as ApproveIcon,
  DeleteTwoTone as DeleteIcon,
  PictureAsPdf as PdfIcon,
  DownloadOutlined as DownloadIcon,
  OpenInNew as OpenIcon,
  Close as CloseIcon,
  ShieldTwoTone as ShieldIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const THEME = {
  bg: "#05070A",
  card: "#0D1117",
  cardHover: "#111827",
  accent: "#38bdf8",
  danger: "#f87171",
  border: "rgba(255, 255, 255, 0.07)",
  sub: "#64748B",
};

export default function AdminVerification() {
  const [exhibitors, setExhibitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState(null);

  useEffect(() => { fetchExhibitors(); }, []);

  const fetchExhibitors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/all-exhibitors");
      setExhibitors(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const downloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);
    } catch { window.open(url, "_blank"); }
  };

  const handleVerify = async (id, name) => {
    const result = await Swal.fire({
      title: `Approve ${name}?`,
      text: "This will grant them verified exhibitor status.",
      icon: "question",
      showCancelButton: true,
      background: THEME.card,
      color: "#fff",
      confirmButtonColor: THEME.accent,
      cancelButtonColor: "transparent",
      confirmButtonText: "Yes, Approve",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.put(`http://localhost:5000/api/auth/verify-user/${id}`);
      Swal.fire({ title: "Verified!", text: `${name} is now verified.`, icon: "success", background: THEME.card, color: "#fff", confirmButtonColor: THEME.accent });
      fetchExhibitors();
    } catch { Swal.fire("Error", "Action Failed", "error"); }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      background: THEME.card,
      color: "#fff",
      confirmButtonColor: THEME.danger,
      cancelButtonColor: "transparent",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/delete-user/${id}`);
      Swal.fire({ title: "Deleted!", icon: "success", background: THEME.card, color: "#fff", confirmButtonColor: THEME.accent });
      fetchExhibitors();
    } catch { Swal.fire("Error", "Delete Failed", "error"); }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", bgcolor: THEME.bg }}>
      <CircularProgress sx={{ color: THEME.accent }} />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: THEME.bg, color: "#fff", p: { xs: 2, md: 4 }, boxSizing: "border-box" }}>

      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <ShieldIcon sx={{ color: THEME.accent, fontSize: 28 }} />
          <Typography sx={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.5px", color: "#fff" }}>
            Exhibitor <span style={{ color: THEME.accent }}>Verification</span>
          </Typography>
        </Box>
        <Typography sx={{ color: THEME.sub, fontSize: "13px", ml: 5 }}>
          Review documents and authorize ecosystem partners
        </Typography>
      </Box>

      {/* STATS ROW */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {[
          { label: "Total Exhibitors", value: exhibitors.length, color: THEME.accent },
          { label: "Verified", value: exhibitors.filter(e => e.isVerified).length, color: "#4ade80" },
          { label: "Pending Review", value: exhibitors.filter(e => !e.isVerified).length, color: "#fbbf24" },
        ].map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{
            px: 3, py: 2, bgcolor: THEME.card, borderRadius: "14px",
            border: `1px solid ${THEME.border}`, minWidth: 140,
          }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 900, color: stat.color }}>{stat.value}</Typography>
            <Typography sx={{ fontSize: "11px", color: THEME.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={0} sx={{
        bgcolor: THEME.card,
        borderRadius: "20px",
        border: `1px solid ${THEME.border}`,
        backgroundImage: "none",
        overflow: "hidden",
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
              {["Exhibitor", "Email", "Documents", "Status", "Actions"].map((h, i) => (
                <TableCell key={h} align={i === 4 ? "right" : "left"} sx={{
                  color: THEME.sub, fontWeight: 700, fontSize: "10px",
                  letterSpacing: 1.2, textTransform: "uppercase",
                  borderBottom: `1px solid ${THEME.border}`, py: 2,
                }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {exhibitors.length > 0 ? exhibitors.map((ex, idx) => (
              <TableRow key={ex._id} sx={{
                "&:hover": { bgcolor: "rgba(56,189,248,0.03)" },
                borderBottom: `1px solid ${THEME.border}`,
                transition: "background 0.2s",
              }}>

                {/* Company */}
                <TableCell sx={{ py: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{
                      width: 34, height: 34, fontSize: "13px", fontWeight: 800,
                      bgcolor: `rgba(56,189,248,0.15)`, color: THEME.accent,
                    }}>
                      {(ex.organization || "?")[0].toUpperCase()}
                    </Avatar>
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>
                      {ex.organization || "N/A"}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Email */}
                <TableCell sx={{ color: "#94A3B8", fontSize: "13px" }}>{ex.email}</TableCell>

                {/* Docs */}
                <TableCell>
                  <Button
                    startIcon={<ViewIcon sx={{ fontSize: 15 }} />}
                    size="small"
                    disabled={!ex.documents || ex.documents.length === 0}
                    onClick={() => setSelectedDocs(ex.documents)}
                    sx={{
                      color: THEME.accent, textTransform: "none", fontWeight: 700,
                      fontSize: "12px", borderRadius: "8px", px: 1.5,
                      bgcolor: "rgba(56,189,248,0.08)",
                      "&:hover": { bgcolor: "rgba(56,189,248,0.18)" },
                      "&.Mui-disabled": { color: THEME.sub },
                    }}
                  >
                    {ex.documents?.length || 0} Files
                  </Button>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip
                    label={ex.isVerified ? "✓ Verified" : "Pending"}
                    size="small"
                    sx={{
                      bgcolor: ex.isVerified ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)",
                      color: ex.isVerified ? "#4ade80" : "#fbbf24",
                      fontWeight: 800, fontSize: "10px", borderRadius: "6px",
                      border: `1px solid ${ex.isVerified ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`,
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {!ex.isVerified && (
                      <Tooltip title="Approve Exhibitor">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ApproveIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleVerify(ex._id, ex.organization)}
                          sx={{
                            bgcolor: THEME.accent, color: "#000", fontWeight: 800,
                            borderRadius: "8px", textTransform: "none", fontSize: "12px",
                            px: 2, "&:hover": { bgcolor: "#7dd3fc" }, transition: "0.2s",
                          }}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Exhibitor">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(ex._id, ex.organization)}
                        sx={{
                          color: THEME.danger, bgcolor: "rgba(248,113,113,0.08)",
                          borderRadius: "8px", width: 32, height: 32,
                          "&:hover": { bgcolor: "rgba(248,113,113,0.2)" },
                          transition: "0.2s",
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>

              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 12, color: THEME.sub, fontSize: "14px" }}>
                  No exhibitors awaiting verification.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DOCUMENT DIALOG */}
      <Dialog
        open={Boolean(selectedDocs)}
        onClose={() => setSelectedDocs(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: THEME.card, borderRadius: "24px", backgroundImage: "none", border: `1px solid ${THEME.border}` }
          }
        }}
      >
        <Box sx={{ p: 4, color: "#fff", position: "relative" }}>
          <IconButton
            onClick={() => setSelectedDocs(null)}
            sx={{ position: "absolute", right: 20, top: 20, color: THEME.sub, "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" } }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" sx={{ mb: 4, fontWeight: 900, letterSpacing: "-0.5px" }}>
            Document <span style={{ color: THEME.accent }}>Preview</span>
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {selectedDocs?.map((doc, i) => {
              const isPdf = doc.toLowerCase().includes(".pdf") || doc.includes("application/pdf");
              return (
                <Box key={i} sx={{
                  flex: "1 1 calc(50% - 8px)", minWidth: 240,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: "16px", overflow: "hidden",
                  bgcolor: "rgba(0,0,0,0.3)",
                  transition: "0.3s",
                  "&:hover": { borderColor: THEME.accent },
                }}>
                  {isPdf ? (
                    <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                      <PdfIcon sx={{ fontSize: 60, color: "#f87171", mb: 1.5 }} />
                      <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: "14px" }}>Document_{i + 1}.pdf</Typography>
                      <Typography sx={{ color: THEME.sub, fontSize: "11px", mb: 3 }}>PDF Attachment</Typography>
                      <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
                        <Button fullWidth variant="outlined" startIcon={<OpenIcon />}
                          onClick={() => window.open(doc, "_blank")}
                          sx={{ borderColor: THEME.border, color: "#fff", borderRadius: "10px", textTransform: "none", fontWeight: 600, fontSize: "12px" }}>
                          Open
                        </Button>
                        <Button fullWidth variant="contained" startIcon={<DownloadIcon />}
                          onClick={() => downloadFile(doc, `Doc_${i + 1}.pdf`)}
                          sx={{ bgcolor: THEME.accent, color: "#000", borderRadius: "10px", textTransform: "none", fontWeight: 800, fontSize: "12px", "&:hover": { bgcolor: "#7dd3fc" } }}>
                          Download
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ position: "relative" }}>
                      <img src={doc} alt={`doc-${i}`}
                        style={{ width: "100%", height: "220px", objectFit: "cover", display: "block", cursor: "pointer" }}
                        onClick={() => window.open(doc, "_blank")} />
                      <Box sx={{
                        position: "absolute", bottom: 0, left: 0, right: 0, p: 1.5,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>Image_{i + 1}.jpg</Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Open"><IconButton size="small" onClick={() => window.open(doc, "_blank")} sx={{ color: "#fff" }}><OpenIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Download"><IconButton size="small" onClick={() => downloadFile(doc, `Doc_${i + 1}.jpg`)} sx={{ color: THEME.accent }}><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}