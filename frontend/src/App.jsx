import React from 'react'
import ManagerSidebar from './Components/ManagerSidebar'
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import AdminMembers from './Pages/Admin/Members/Members';
import Scoieties from './Pages/Admin/Societies/Societies';
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
import SpecificSocietyMembers from './Pages/Manager/Members/SpecificSocietyMembers';
import Election from './Pages/Manager/Election/Election';
import ElectionCandidates from './Pages/Manager/Election/ElectionCandidates';

import ApplyElections from './Pages/User/Election/ElectionList';
import ElectionResult from './Pages/Manager/Election/ElectionResult';

import SocietyDetails from './Pages/Manager/Society/SocietyDetails';
import Topbar from './Components/Topbar';
import Navbar from './Components/Navbar';
import PublicLayout from './Layouts/PublicLayout';
import AllSocieties from './Pages/User/Societies/AllSocieties';
import About from './Pages/User/About/About';
import Contact from './Pages/User/Contact/Contact';
import EventForm from './Pages/Manager/Events/EventForm';
import ReviewCandidate from './Pages/Manager/Election/ReviewCandidate';
import DraftElections from './Pages/Manager/Election/DraftElections';
import ScheduleVoting from './Pages/Manager/Election/ScheduleVoting';
import VotePage from './Pages/User/Election/Vote';
import ApplyPage from './Pages/User/Election/ApplyPage';

function App() {
  const { loading } = useAuth();

  return (
    <>
      {loading && <Loader />} {/* Show loader globally */}
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path='/about-us' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/community' element={<AllSocieties />} />
          <Route path="/applyForElections" element={<ApplyElections />} />
          <Route path="/apply/:electionId" element={<ApplyPage/>} />
          <Route path="/VoteNow" element={<VotePage />} />
          
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="allmembers" replace />} />

          <Route path="managers" element={<Managers />} />
          <Route path="allmembers" element={<AdminMembers />} />

          <Route path="memberForm" element={<MemberForm />} />
          <Route path="societies" element={<Scoieties />} />
          <Route path="form" element={<Form />} />
          <Route path="societyRequests" element={<SocietyRequest />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><ManagerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path='election' element={<Election />} />
          <Route path='my-drafts' element={<DraftElections />} />
          <Route path="applications" element={<ElectionCandidates />} />
          <Route path='reviewCandidate/:electionId/:candidateId' element ={<ReviewCandidate/>} />
          <Route path='schedule-voting' element={<ScheduleVoting/>} />
          <Route path="results/:electionId" element={<ElectionResult />} />
          <Route path="members" element={<Members />} />
          <Route path="SpecificSocietymembers/:societyId" element={<SpecificSocietyMembers />} />
          <Route path="volunteers" element={<Volunteers />} />
          <Route path="society" element={<Society />} />
          <Route path='societyDetails/:societyId' element={<SocietyDetails />} />
          <Route path="societyform/:id/edit" element={<SocietyForm />} />
          <Route path="societyform" element={<SocietyForm />} />
          <Route path="eventForm" element={<EventForm/>} />
          <Route path="eventForm/:id/edit" element={<EventForm/>} />
          <Route path="requests" element={<Requests />} />
        </Route>

      </Routes>
    </>
  )
}

export default App