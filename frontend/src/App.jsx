import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'; // Added Navigate
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Layouts & Pages
import DashboardLayout from "./Components/DashboardLayout";
import HomeDashboard from './Components/HomeDashboard'; 
import AdminProfile from './Components/AdminProfile';
import ExhibitorDashboardLayout from './Components/ExhibitorDashboardLayout';

// Components
import Home from "./Pages/Home";
import LoginPage from "./Components/Login";
import RegisterPage from "./Components/Register";
import ForgotPassword from "./Components/ForgetPassword";
// import EventPage from "./Pages/Eventpage";
import ExhibitorsPage from './Components/Exhibitors';
import CreateExpo from './Components/CreateExpo';
import ManageExpo from './Components/ManageExpo';
import EditExpo from './Components/EditExpo';
import PendingRequests from './Components/PendingRequests';
import AssignedBooths from './Components/AssignedBooths';
import CreateSchedule from './Components/CreateSchedule';
import ManageSchedule from './Components/ManageSchedule';
import EditSchedule from './Components/EditSchedule';
import Analytics from './Components/Analytics';
import DetailedReports from './Components/DetailedReports';
import LiveStats from './Components/LiveStats';
import FloorPlanDesigner from './Components/FloorPlanDesigner';
import ExhibitorProfile from './Components/ExhibitorProfile';
import ExhibitorExpoList from './Components/ExhibitorExpoList';
import ExhibitorReservation from './Components/ExhibitorReservation';
import ExhibitorSchedule from './Components/ExhibitorSchedule';
import BoothSetup from './Components/BoothSetup';
import BoothSelection from './Components/BoothSelection';
import ManageShowcase from './Components/ManageShowcase';
import ExhibitorStaff from './Components/ExhibitorStaff';
import NotificationPage from './Components/NotificationPage';
import AdminNotification from './Components/AdminNotification';
import PassRequest from './Components/PassRequest';
import ExhibitorHome from './Components/ExhibitorHome';
import ExhibitorAnalytics from './Components/ExhibitorAnalytics';
import ExhibitorDocument from './Components/ExhibitorDocument';
import AdminVerification from './Components/AdminVerification';
import NeighboringExhibitors from './Components/NeighboringExhibitors';
import ExhibitorAppointments from './Components/ExhibitorAppointments';
// attendee
import AttendeeDashboardLayout from './Components/AttendeeDashboardLayout';
import AttendeeExplore from './Components/AttendeeExplore';
import AttendeeExpoDetails from './Components/AttendeeExpoDetails';
import AttendeeMyEvents from './Components/AttendeeMyEvents';
import MeetingHub from './Components/MeetingHub';
import AttendeeAppointments from './Components/AttendeeAppointments';
import AttendeeSavedAgenda from './Components/AttendeeSavedAgenda';
import AttendeeHome from './Components/AttendeeHome';
import AttendeeProfile from './Components/AttendeeProfile';
import AttendeeNotificationPage from './Components/AttendeeNotificationPage';
import AboutPage from './Pages/AboutPage';
import ExpoPublicDetails from './Components/ExpoPublicDetails';
import ChatMessenger from './Components/ChatMessenger';

import NetworkingMessenger from './Components/NetworkingMessenger';
import ExhibitorSupport from './Components/ExhibitorSupport';
import AdminSupport from './Components/AdminSupport';
import Testimonials from './Components/Testimonials';
import Blog from './Components/Blogs';


// ==========================================
// 🛡️ PROTECTED ROUTE COMPONENT
// ==========================================
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // Agar token nahi hai to login pe bhejo
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Agar role match nahi karta (e.g. attendee admin ka page khole) to login pe bhejo
    return <Navigate to="/login" replace />;
  }

  return children;
};

const TitleHandler = () => {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'EventSphere - Home',
      '/login': 'EventSphere - Login',
      '/register': 'EventSphere - Register',
      '/admin': 'EventSphere - Admin Dashboard',
    };
    document.title = titles[location.pathname] || 'EventSphere';
  }, [location]);
  return null;
};

const App = () => {
  return (
    <Router>
      <TitleHandler />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
{/* ./        <Route path="/event" element={<EventPage />} /> */}

        {/* 🔐 ADMIN ROUTES (Protected) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeDashboard />} />
          <Route path="settings/profile" element={<AdminProfile />} />
          <Route path="expo/create" element={<CreateExpo />} />
          <Route path="expo/manage" element={<ManageExpo />} />
          <Route path="expo/edit/:id" element={<EditExpo />} />
          <Route path="floor-plan-designer/:id" element={<FloorPlanDesigner />} />
          <Route  path="exhibitors"  element={<ExhibitorsPage currentUser={JSON.parse(localStorage.getItem("user") || "{}")} />} />
          <Route path="exhibitors/requests" element={<PendingRequests />} />
          <Route path="exhibitors/booths" element={<AssignedBooths />} />
          <Route path="schedule/create" element={<CreateSchedule />} />
          <Route path="schedule/manage" element={<ManageSchedule />} />
          <Route path="schedule/edit/:id" element={<EditSchedule />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/reports" element={<DetailedReports />} /> 
          <Route path="analytics/live" element={<LiveStats />} /> 
          <Route path="exhibitors/passes" element={<PassRequest />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="notifications/history" element={<NotificationPage role="admin" />} />
          <Route path="notifications/send" element={<AdminNotification />} />
<Route path='support-chat' element={<AdminSupport currentUser={JSON.parse(localStorage.getItem("user") || "{}")} />}/>
           {/* <Route path="messages" element={<ChatMessenger currentUser={JSON.parse(localStorage.getItem("user") || "{}")} />} /> */}
        </Route> 

        {/* 🔐 EXHIBITOR ROUTES (Protected) */}
        <Route 
          path="/exhibitor" 
          element={
            <ProtectedRoute allowedRole="exhibitor">
              <ExhibitorDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ExhibitorHome />} /> 
          <Route path="profile/edit" element={<ExhibitorProfile />} />
          <Route path="register-expo" element={<ExhibitorExpoList />} />
          <Route path="booth/my-space" element={<ExhibitorReservation />} />
          <Route path="schedule" element={<ExhibitorSchedule />} />
          <Route path="booth-setup" element={<BoothSetup />} />
          <Route path="booth-selection" element={<BoothSelection />} />
          <Route path="booth/manage" element={<ManageShowcase />} /> 
          <Route path="booth/staff" element={<ExhibitorStaff />} />
          <Route path="profile/documents" element={<ExhibitorDocument />} />
          <Route path="notifications" element={<NotificationPage role="exhibitor" />} />
          <Route path="neighbors" element={<NeighboringExhibitors />} />
          <Route path="manage-events" element={<ExhibitorAnalytics />} />
<Route path="appointments" element={<ExhibitorAppointments />} />   
<Route path="networking-messages" element={<NetworkingMessenger/>}/>
<Route path="support" element={<ExhibitorSupport currentUser={JSON.parse(localStorage.getItem("user") || "{}")} />} />
<Route path="messages" element={<ChatMessenger currentUser={JSON.parse(localStorage.getItem("user") || "{}")} />} />  
   </Route>

        {/* 🔐 ATTENDEE ROUTES (Protected) */}
        <Route 
          path="/attendee" 
          element={
            <ProtectedRoute allowedRole="attendee">
              <AttendeeDashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* <Route index element={<AttendeeHome />} /> */}
          <Route path="explore" element={<AttendeeExplore/>} />
          <Route path="expo/:id" element={<AttendeeExpoDetails />} /> 
          <Route path="my-events" element={<AttendeeMyEvents />} />
          <Route path="meeting-hub" element={<MeetingHub />} />
         <Route path="my-appointments" element={<AttendeeAppointments/>}/>
         <Route path='bookmarks' element={<AttendeeSavedAgenda/>}/>
         <Route path='' element={<AttendeeHome/>}/>
         <Route path='profile' element={<AttendeeProfile/>}/>
         <Route path='notification' element={<AttendeeNotificationPage role="attendee" />}/>
          <Route path="messages" element={<ChatMessenger currentUser={JSON.parse(localStorage.getItem("user") || "{}")} />} />
          {/* <Route index element={<AttendeeExplore />} /> 
          <Route path="explore" element={<AttendeeExplore />} />
          <Route path="my-events" element={<AttendeeMyEvents />} />
          <Route path="floor-plan" element={<AttendeeFloorPlan />} />
          <Route path="exhibitors" element={<AttendeeExhibitors />} />
          <Route path="bookmarks" element={<AttendeeBookmarks />} />
          <Route path="messages" element={<AttendeeMessages />} />
          <Route path="profile" element={<AttendeeProfile />} />
          <Route path="notifications" element={<NotificationPage role="attendee" />} /> */}
        </Route>
 <Route path="/about" element={<AboutPage />} />
 <Route path="/expo-details/:id" element={<ExpoPublicDetails />} />
 <Route path="testimonials" element={<Testimonials/>}/>
 <Route path="/blog" element={<Blog/>}/>
 
 

      </Routes>
    </Router>
  );
};

export default App;