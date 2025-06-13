import { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Common
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import NavbarAdmin from './components/NavbarAdmin';

// Contexts

// Admin Pages
import DashBoard from './pages/Admin/DashBoard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsLists from './pages/Admin/DoctorsLists';

// Doctor Pages
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';

// Patient Pages
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import Contact from './pages/Contact';
import About from './pages/About';
import MyProfile from './pages/MyProfile';
import MyAppointments from './pages/MyAppointments';
import Appointment from './pages/Appointment';
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';

function App() {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  const isLoggedIn = aToken || dToken;

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <ToastContainer />
      
      {/* Authenticated admin/doctor layout */}
      {isLoggedIn ? (
        <>
          <NavbarAdmin />
          <div className="flex items-start">
            <Sidebar />
            <div className="flex-grow p-4">
              <Routes>

                {/* Admin Routes */}
                {aToken && (
                  <>
                    <Route path="/" element={<Navigate to="/admin-dashboard" />} />
                    <Route path="/admin-dashboard" element={<DashBoard />} />
                    <Route path="/all-appointments" element={<AllAppointments />} />
                    <Route path="/add-doctor" element={<AddDoctor />} />
                    <Route path="/doctor-list" element={<DoctorsLists />} />
                  </>
                )}

                {/* Doctor Routes */}
                {dToken && (
                  <>
                    <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor-appointments" element={<DoctorAppointments />} />
                    <Route path="/doctor-profile" element={<DoctorProfile />} />
                  </>
                )}

              </Routes>
            </div>
          </div>
        </>
      ) : (
        // Patient side layout
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:speciality" element={<Doctors />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/appointment/:docId" element={<Appointment />} />
            <Route path="/verify-email/:token/:email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
