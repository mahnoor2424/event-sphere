import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Grid, Card, CardContent, Button, 
  Chip, Stack, Skeleton, IconButton, InputBase, Paper, Fade, Container
} from "@mui/material";
import { 
  Search, Filter, MapPin, Users, ArrowRight, 
  Sparkles, Calendar, Zap, LayoutGrid, CheckCircle2
} from "lucide-react";

const THEME = {
  bg: "#05070A",
  card: "#0A0D14",
  accent: "#00e1ffba",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "rgba(255, 255, 255, 0.06)",
  gradient: "linear-gradient(135deg, #5ce2f6 0%, #63eaf1 100%)",
  green: "#10b981"
};

export default function AttendeeExplore() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchExpos = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/expo/all-expos");
        if (Array.isArray(res.data)) {
          const activeOnly = res.data.filter(e => e.status === 'active');
          setExpos(activeOnly);
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchExpos();
  }, []);

  const filteredExpos = expos.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.theme?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ color: THEME.textPrimary, pb: 8, pt: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ mb: { xs: 4, md: 8 } }}>
        <Grid container alignItems="center" spacing={{ xs: 4, md: 2 }}>
          <Grid item xs={12} md={7}>
            <Fade in timeout={800}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Zap size={18} color={THEME.accent} fill={THEME.accent} />
                  <Typography sx={{ color: THEME.accent, fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2 }}>
                    LIVE DIRECTORY
                  </Typography>
                </Stack>
                <Typography variant="h2" sx={{ 
                  fontWeight: 900, 
                  letterSpacing: "-1px", 
                  mb: 2, 
                  lineHeight: 1.1, 
                  fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' } 
                }}>
                  Find Your Next <br />
                  <span style={{ background: THEME.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Opportunity</span>
                </Typography>
                <Typography sx={{ color: THEME.textSecondary, fontSize: { xs: '0.9rem', md: '1rem' }, maxWidth: 500, mx: { xs: 'auto', md: 0 } }}>
                  Discover upcoming expos, browse exhibitors, and explore floor plans before you register.
                </Typography>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ 
              p: 1.5, 
              bgcolor: THEME.card, 
              border: `1px solid ${THEME.border}`, 
              borderRadius: '20px', 
              boxShadow: `0 20px 40px rgba(0,0,0,0.4)`,
              maxWidth: { xs: '100%', sm: '500px' },
              mx: 'auto'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                <Search size={20} color={THEME.accent} />
                <InputBase 
                  placeholder="Search events or cities..." 
                  sx={{ ml: 2, color: '#fff', fontSize: '14px', flex: 1 }} 
                  onChange={(e) => setSearch(e.target.value)}
                />
                <IconButton sx={{ color: THEME.textSecondary }}><Filter size={18}/></IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* --- EVENT GRID --- */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: {xs: 'center', sm: 'flex-start'} }}>
        <LayoutGrid size={20} color={THEME.accent} />
        Live Events ({filteredExpos.length})
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={350} sx={{ bgcolor: THEME.card, borderRadius: "24px" }} />
            </Grid>
          ))
        ) : filteredExpos.length > 0 ? filteredExpos.map((event, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
            <Fade in timeout={400 + index * 100}>
              <Card sx={{ 
                height: '100%', bgcolor: THEME.card, borderRadius: "24px", border: `1px solid ${THEME.border}`, 
                transition: "0.3s", display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden',
                "&:hover": { borderColor: THEME.accent, transform: "translateY(-8px)", boxShadow: `0 20px 40px ${THEME.accent}15` }
              }} onClick={() => navigate(`/attendee/expo/${event._id}`)}>
                
                {/* IMAGE BOX */}
                <Box sx={{ width: '100%', height: { xs: '160px', sm: '150px' }, position: 'relative', bgcolor: 'rgba(255,255,255,0.03)' }}>
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                      <Sparkles size={48} color={THEME.accent} />
                    </Box>
                  )}
                  <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                    <Chip 
                      label={event.theme || "General"} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: THEME.accent, fontWeight: 800, fontSize: '10px', backdropFilter: 'blur(4px)', border: `1px solid ${THEME.border}` }} 
                    />
                  </Box>
                </Box>

                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <RegistrationBadge eventId={event._id} userId={user.id || user._id} />
                  </Stack>

                  <Typography variant="h6" sx={{ 
                    fontWeight: 800, color: '#fff', mb: 2, lineHeight: 1.2, 
                    fontSize: '1.1rem', height: '48px', overflow: 'hidden', 
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' 
                  }}>
                    {event.title}
                  </Typography>

                  <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: THEME.textSecondary }}>
                      <MapPin size={16} color={THEME.accent} />
                      <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                        {typeof event.location === 'object' ? event.location.city : event.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: THEME.textSecondary }}>
                      <Calendar size={16} color={THEME.accent} />
                      <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button 
                    fullWidth
                    variant="contained"
                    sx={{ 
                        borderRadius: '12px', py: 1.5, fontWeight: 700, textTransform: 'none',
                        bgcolor: THEME.accent, color: '#000', "&:hover": { bgcolor: THEME.accent, opacity: 0.8 }
                    }}
                    endIcon={<ArrowRight size={18} />}
                  >
                    Explore Expo
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Box sx={{ py: 10, textAlign: 'center' }}>
               <Typography sx={{ color: THEME.textSecondary }}>No live events found match your search.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

function RegistrationBadge({ eventId, userId }) {
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const checkReg = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/expo/registration-status/${userId}/${eventId}`);
                setIsRegistered(res.data.isRegistered);
            } catch (e) { }
        };
        if(userId && eventId) checkReg();
    }, [userId, eventId]);

    if (!isRegistered) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#fbbf24' }}><Sparkles size={14} /><Typography sx={{ fontSize: '10px', fontWeight: 800 }}>OPEN</Typography></Box>;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: THEME.green }}>
            <CheckCircle2 size={14} />
            <Typography sx={{ fontSize: '10px', fontWeight: 900 }}>REGISTERED</Typography>
        </Box>
    );
}