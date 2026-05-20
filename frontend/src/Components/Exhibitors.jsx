import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; // 1. Navigate import kiya
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Chip, Stack, 
  Container, Avatar, TextField, InputAdornment, Tooltip, Grid 
} from "@mui/material";

// Icons
import {
  SearchOutlined as SearchIcon,
  PeopleOutlined as PeopleIcon,
  TimerOutlined as PendingIcon,
  VerifiedOutlined as ApprovedIcon,
  DeleteOutlined as DeleteIcon,
  CheckCircleOutlined as ApproveIcon,
  CancelOutlined as RejectIcon,
  MessageOutlined as ChatIcon, // Chat icon add kiya
} from "@mui/icons-material";

const THEME = {
  accent: "#38bdf8",
  bg: "#05070A",
  cardBg: "#0A0D14",
  border: "rgba(255, 255, 255, 0.06)",
  textSecondary: "#94A3B8"
};


export default function ExhibitorsPage({ currentUser }) {
  const navigate = useNavigate(); 
  const [exhibitors, setExhibitors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
     console.log("Current User Data:", currentUser);
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get("http://localhost:5000/api/auth/all-exhibitors")
      .then((res) => setExhibitors(res.data || []))
      .catch((err) => console.log(err));
  };

 const handleStartChat = async (exhibitorId) => {
  
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = currentUser?.id || currentUser?._id || storedUser?.id || storedUser?._id;

  if (!myId) {
    Swal.fire({
      title: "Session Expired",
      text: "Please log in again to start a chat.",
      icon: "warning",
      confirmButtonColor: THEME.accent
    });
    return;
  }

  try {
    const res = await axios.post("http://localhost:5000/api/chat/conversation", {
      senderId: myId,
      receiverId: exhibitorId,
    });

 
    navigate("/admin/support-chat", { state: { currentChatId: res.data._id } });
  } catch (err) {
    console.error("Chat Error:", err);
    Swal.fire("Error", "Could not connect to chat server", "error");
  }
};

  const stats = [
    { label: "Total Registered", count: exhibitors.length, icon: <PeopleIcon />, color: THEME.accent },
    { label: "Pending Approval", count: exhibitors.filter(e => e.status === 'pending').length, icon: <PendingIcon />, color: "#fbbf24" },
    { label: "Verified Members", count: exhibitors.filter(e => e.status === 'approved').length, icon: <ApprovedIcon />, color: "#4ade80" },
  ];

  const filteredDisplay = exhibitors.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.organization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id) => {
    Swal.fire({
      title: "Approve Account?",
      text: "This will allow the exhibitor to log in and apply for events.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      confirmButtonColor: THEME.accent,
      background: THEME.cardBg, color: "#fff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:5000/api/auth/approve-user/${id}`, { status: 'approved' });
          fetchData();
          Swal.fire({ title: "Account Verified", icon: "success", background: THEME.cardBg, color: "#fff" });
        } catch (err) { Swal.fire("Error", "Action failed", "error"); }
      }
    });
  };

  const handleReject = (id) => {
    Swal.fire({
      title: "Reject Access?",
      text: "This user will not be able to log in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: THEME.cardBg, color: "#fff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.put(`http://localhost:5000/api/auth/reject-user/${id}`);
        fetchData();
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Permanently?",
      text: "This action cannot be undone.",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: THEME.cardBg, color: "#fff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/auth/delete-user/${id}`);
          fetchData();
        } catch (err) { console.log(err); }
      }
    });
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>
              Exhibitor <span style={{ color: THEME.accent }}>Management</span>
            </Typography>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '14px' }}>
              Verify accounts and manage corporate access.
            </Typography>
          </Box>

          <TextField 
            placeholder="Search by name or company..."
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              width: '320px',
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.02)",
                borderRadius: '12px',
                "& fieldset": { borderColor: THEME.border },
              }
            }}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: THEME.textSecondary, mr: 1 }} /> }}
          />
        </Stack>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Paper sx={{ p: 3, bgcolor: THEME.cardBg, borderRadius: '20px', border: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color }}>{stat.icon}</Avatar>
                <Box>
                  <Typography sx={{ color: THEME.textSecondary, fontSize: '11px', fontWeight: 700 }}>{stat.label}</Typography>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>{stat.count}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Table */}
        <TableContainer component={Paper} sx={{ bgcolor: THEME.cardBg, borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>EXHIBITOR</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>ORGANIZATION</TableCell>
                <TableCell sx={{ color: THEME.textSecondary, fontWeight: 700 }}>ACCOUNT STATUS</TableCell>
                <TableCell align="right" sx={{ color: THEME.textSecondary, fontWeight: 700 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDisplay.map((item) => (
                <TableRow key={item._id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.01)" } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: THEME.accent, color: '#000', fontSize: '14px', width: 36, height: 36 }}>{item.name?.charAt(0)}</Avatar>
                      <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{item.name}</Typography>
                        <Typography sx={{ color: THEME.textSecondary, fontSize: '12px' }}>{item.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ color: '#E2E8F0', fontSize: '13px' }}>{item.organization}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={item.status} 
                      size="small"
                      sx={{ 
                        fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                        bgcolor: item.status === 'approved' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                        color: item.status === 'approved' ? '#4ade80' : '#fbbf24'
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      
                      {/* --- NEW: Chat Button --- */}
                      <Tooltip title="Send Message">
                        <IconButton 
                          onClick={() => handleStartChat(item._id)} 
                          sx={{ color: THEME.accent, bgcolor: 'rgba(56, 189, 248, 0.05)', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.15)' } }}
                        >
                          <ChatIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {item.status === "pending" && (
                        <Tooltip title="Approve Member">
                          <IconButton onClick={() => handleApprove(item._id)} sx={{ color: '#4ade80' }}>
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Reject Member">
                        <IconButton onClick={() => handleReject(item._id)} sx={{ color: '#f87171' }}>
                          <RejectIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton onClick={() => handleDelete(item._id)} sx={{ color: THEME.textSecondary }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}