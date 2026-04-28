import React, { useEffect } from 'react'
import ManagerSidebar from './Components/ManagerSidebar'
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ManagerLayout from './Layouts/ManagerLayout';
import Dashboard from './Pages/Manager/Dashboard/Dashboard';
import Events from './Pages/Manager/Events/Events';
import Members from './Pages/Manager/Members/Members';
import Volunteers from './Pages/Manager/Volunteers/Volunteers';
import Society from './Pages/Manager/Society/Society';
import SocietyForm from './Pages/Manager/Society/SocietyForm';
import Requests from './Pages/Manager/Requests/Requests';
import AdminLayout from './Layouts/AdminLayout';
import Managers from './Pages/Admin/Managers/Managers';
import AdminUsers from './Pages/Admin/Users/Users';
import AdminUserDetail from './Pages/Admin/Users/UserDetail';
import AdminDashboard from './Pages/Admin/Dashboard/Dashboard';
import Scoieties from './Pages/Admin/Societies/Societies';
import AdminSocietyDetail from './Pages/Admin/Societies/SocietyDetail';
import AdminEventsList from './Pages/Admin/Events/EventsList';
import AdminEventDetail from './Pages/Admin/Events/EventDetail';
import AdminElectionsList from './Pages/Admin/Elections/ElectionsList';
import AdminElectionDetail from './Pages/Admin/Elections/ElectionDetail';
import Form from './Pages/Admin/Societies/Form';
import SocietyRequest from './Pages/Admin/SocietyRequests/SocietyRequest';
import Home from './Pages/User/Home/Home';
import Login from './Pages/Auth/Login';
import ProtectedRoute from './middleware/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Loader from './Components/Loader';
import MemberForm from './Pages/Admin/Members/MemberForm';
import { Toaster } from "react-hot-toast";
import { Navigate } from 'react-router-dom';
import Profile from './Pages/User/profile/Profile';
import ProfileEntry from './Pages/User/profile/ProfileEntry';
import SpecificSocietyMembers from './Pages/Manager/Members/SpecificSocietyMembers';
import Election from './Pages/Manager/Election/Election';
import ElectionCandidates from './Pages/Manager/Election/ElectionCandidates';

import ApplyElections from './Pages/User/Election/ElectionList';
import ElectionResult from './Pages/Manager/Election/ElectionResult';

import SocietyDetails from './Pages/Manager/Society/SocietyDetails';
import SocietyStatus from './Pages/Manager/Society/SocietyStatus';
import Topbar from './Components/Topbar';
import Navbar from './Components/Navbar';
import PublicLayout from './Layouts/PublicLayout';
import AllSocieties from './Pages/User/Societies/AllSocieties';
import Contact from './Pages/User/Contact/Contact';
import EventForm from './Pages/Manager/Events/EventForm';
import ReviewCandidate from './Pages/Manager/Election/ReviewCandidate';
import DraftElections from './Pages/Manager/Election/DraftElections';
import AllElections from './Pages/Manager/Election/AllElections';
import EditElection from './Pages/Manager/Election/EditElection';
import ScheduleVoting from './Pages/Manager/Election/ScheduleVoting';
import VotePage from './Pages/User/Election/Vote';
import ApplyPage from './Pages/User/Election/ApplyPage';
import SignupForm from './Pages/Auth/SignUp';
import JoinSocietyFormPage from './Pages/User/Societies/JoinSocietyForm';
import SocietyView from './Pages/User/Societies/SocietyView';
import SocietyPostsFeed from './Pages/User/Societies/SocietyPostsFeed';
import AdminSocietyPosts from './Pages/Admin/SocietyPosts/AdminSocietyPosts';
import AdminContactMessages from './Pages/Admin/ContactMessages/AdminContactMessages';
import ManagerSocietyPosts from './Pages/Manager/Society/SocietyPosts';
import Results from './Pages/User/Election/Results';
import AllEvents from './Pages/User/Events/Events';
import EventDetails from './Pages/User/Events/EventDetails';
import AdminEventDetails from './Pages/Manager/Events/Detail';
import ProfileVolunteerStatus from './Pages/User/profile/ProfileVolunteerStatus';
import ManagerProfile from './Pages/Manager/Profile/ManagerProfile';
import AdminProfile from './Pages/Admin/Profile/AdminProfile';

function RouteScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBehavior = html.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;

    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevHtmlBehavior;
      body.style.scrollBehavior = prevBodyBehavior;
    });
  }, [pathname]);

  return null;
}

function App() {
  const { loading } = useAuth();

  return (
    <>
      {loading && <Loader />} {/* Show loader globally */}
      <Toaster position="top-right" reverseOrder={false} />
      <RouteScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path='/signup' element={<SignupForm />} />
          <Route path="/profile" element={<ProfileEntry />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/community' element={<AllSocieties />} />
          <Route path="/society/:id" element={<SocietyView />} />
          <Route path="/societies/:id" element={<SocietyView />} />
          <Route path='join-society/:id' element={<JoinSocietyFormPage />} />
          <Route path="/applyForElections" element={<ApplyElections />} />
          <Route path="/apply/:electionId" element={<ApplyPage />} />
          <Route path="/VoteNow/:id" element={<VotePage />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path='/events' element={<AllEvents />} />
          <Route path='/eventdetails/:id' element={<EventDetails />} />
          <Route path="/society-posts" element={<SocietyPostsFeed />} />
          <Route path="/student/profile" element={<Profile />} />
           <Route path='/student/profile/volunteer-status' element={<Profile/>} />
          <Route path="/student/profile/volunteers" element={<Profile />} />
          <Route path="/student/profile/societies" element={<Profile />} />
          <Route path="/student/profile/society-posts" element={<Profile />} />
          <Route path="/student/profile/elections" element={<Profile />} />
          <Route path="/student/profile/election-status" element={<Profile />} />
          <Route path='/student/profile/applications' element={<Profile/>} />
          

        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="managers" element={<Managers />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="memberForm" element={<MemberForm />} />
          <Route path="societies" element={<Scoieties />} />
          <Route path="societies/:societyId" element={<AdminSocietyDetail />} />
          <Route path="events" element={<AdminEventsList />} />
          <Route path="events/:eventId" element={<AdminEventDetail />} />
          <Route path="elections" element={<AdminElectionsList />} />
          <Route path="elections/:electionId" element={<AdminElectionDetail />} />
          <Route path="form" element={<Form />} />
          <Route path="societyRequests" element={<SocietyRequest />} />
          <Route path="society-posts" element={<AdminSocietyPosts />} />
          <Route path="contact-messages" element={<AdminContactMessages />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="allmembers" element={<Navigate to="/admin/users" replace />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><ManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path='election' element={<Election />} />
          <Route path="all-elections" element={<AllElections />} />
          <Route path="all-elections/:electionId/edit" element={<EditElection />} />
          <Route path='my-drafts' element={<DraftElections />} />
          <Route path="applications" element={<ElectionCandidates />} />
          <Route path='reviewCandidate/:electionId/:candidateId' element={<ReviewCandidate />} />
          <Route path='schedule-voting' element={<ScheduleVoting />} />
          <Route path="results" element={<ElectionResult />} />
          <Route path="members" element={<Members />} />
          <Route path="SpecificSocietymembers/:societyId" element={<SpecificSocietyMembers />} />
          <Route path="volunteers" element={<Volunteers />} />
          <Route path="society" element={<Society />} />
          <Route path="society-status" element={<SocietyStatus />} />
          <Route path='societyDetails/:societyId' element={<SocietyDetails />} />
          <Route path="societyform/:id/edit" element={<SocietyForm />} />
          <Route path="societyform" element={<SocietyForm />} />
          <Route path="eventForm" element={<EventForm />} />
          <Route path="eventForm/:id/edit" element={<EventForm />} />
          <Route path="details/:id" element={<AdminEventDetails />} />
          <Route path="requests" element={<Requests />} />
          <Route path="society-posts" element={<ManagerSocietyPosts />} />
          <Route path="profile" element={<ManagerProfile />} />
        </Route>

      </Routes>
    </>
  )
}

export default App