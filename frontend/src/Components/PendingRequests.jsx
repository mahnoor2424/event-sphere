import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Avatar, Chip, CircularProgress, Stack, IconButton, Tooltip
} from "@mui/material";
import ApproveIcon from "@mui/icons-material/CheckCircleOutlined"; 
import RejectIcon from "@mui/icons-material/DeleteTwoTone"; 
import CompanyIcon from "@mui/icons-material/Business";
import ExpoIcon from "@mui/icons-material/Event";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined"; // Green badge ke liye icon
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const THEME = {
  bg: "#05070A",
  paper: "#0A0D14",
  accent: "#38bdf8",
  border: "rgba(255, 255, 255, 0.08)",
  textSecondary: "#94A3B8"
};

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/expo/pending-applications");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (reqId, expoId) => {
    Swal.fire({
      title: 'Approve Exhibitor?',
      text: "Assign a booth on the floor plan for this exhibitor.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: THEME.accent,
      background: THEME.paper,
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/admin/floor-plan-designer/${expoId}?requestId=${reqId}`);
      }
    });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Reject Request?',
      text: "Are you sure you want to delete this application?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: THEME.border,
      background: THEME.paper,
      color: '#fff',
      confirmButtonText: 'Yes, Delete'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/expo/delete-application/${id}`);
          setRequests(requests.filter(req => req._id !== id));
          Swal.fire({ title: 'Deleted!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: THEME.paper, color: '#fff' });
        } catch (err) {
          Swal.fire('Error', 'Failed to delete request', 'error');
        }
      }
    });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: THEME.accent }} /></Box>;

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: THEME.bg }}>
      <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', mb: 4 }}>
        Pending <span style={{ color: THEME.accent }}>Requests</span>
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: THEME.paper, borderRadius: '20px', border: `1px solid ${THEME.border}`, backgroundImage: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>EXHIBITOR</TableCell>
              <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>EVENT</TableCell>
              <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>DATE</TableCell>
              <TableCell align="right" sx={{ color: THEME.textSecondary, fontWeight: 700 }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => {
              // logic check for assignment status
              const isAssigned = req.status === "approved";

              return (
                <TableRow key={req._id} sx={{ '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.02)' } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: isAssigned ? 'rgba(74, 222, 128, 0.1)' : 'rgba(56, 189, 248, 0.1)', color: isAssigned ? '#4ade80' : THEME.accent }}>
                        <CompanyIcon />
                      </Avatar>
                      <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                             <Typography sx={{ color: '#fff', fontWeight: 700 }}>{req.exhibitorId?.organization || "Unknown"}</Typography>
                             <Chip label="Booth Request" size="small" sx={{ height: 16, fontSize: '9px', bgcolor: 'rgba(255,255,255,0.05)', color: THEME.textSecondary, borderRadius: '4px' }} />
                          </Stack>
                          <Typography sx={{ color: THEME.textSecondary, fontSize: '12px' }}>{req.exhibitorId?.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ExpoIcon sx={{ color: THEME.accent, fontSize: 16 }} />
                      <Typography fontSize="14px">{req.expoId?.title || "N/A"}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: THEME.textSecondary, fontSize: '13px' }}>
                    {new Date(req.appliedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {/* 🔔 STATUS LOGIC: Agar assigned hai toh green badge dikhao, warna buttons */}
                      {isAssigned ? (
                        <Chip 
                          icon={<VerifiedIcon style={{ color: '#000', fontSize: '16px' }} />}
                          label="Booth Assigned" 
                          sx={{ bgcolor: '#4ade80', color: '#000', fontWeight: 800, borderRadius: '8px', px: 1 }} 
                        />
                      ) : (
                        <>
                          <Button 
                              variant="contained" 
                              size="small" 
                              startIcon={<ApproveIcon />}
                              onClick={() => handleApprove(req._id, req.expoId?._id)}
                              sx={{ bgcolor: THEME.accent, color: '#000', fontWeight: 800, borderRadius: '8px', textTransform: 'none' }}
                          >
                              Assign Booth
                          </Button>
                          <Tooltip title="Reject Request">
                              <IconButton onClick={() => handleDelete(req._id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                                  <RejectIcon fontSize="small" />
                              </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {requests.length === 0 && (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <Typography sx={{ color: THEME.textSecondary }}>No applications found.</Typography>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
}