import axios from "axios";
import { createContext, useState } from "react";
import { toast } from 'react-toastify';

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '');
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    const getAllappointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
                headers: { Authorization: `Bearer ${dToken}` },
                withCredentials: true
            });

            if (data) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

    const AppointmentComplete = async (appointmentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/doctor/complete-appointment`, { appointmentId }, {
                headers: { Authorization: `Bearer ${dToken}` },
                withCredentials: true
            });

            if (data) {
                toast.success(data.message);
                getAllappointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

    const Appointmentcancel = async (appointmentId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/doctor/cancel-appointment`, { appointmentId }, {
                headers: { Authorization: `Bearer ${dToken}` },
                withCredentials: true
            });

            if (data) {
                toast.success(data.message);
                getAllappointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
                headers: { Authorization: `Bearer ${dToken}` },
                withCredentials: true
            });

            if (data) {
                setDashData(data.dashdata);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

    const getprofiledata = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
                headers: { Authorization: `Bearer ${dToken}` },
                withCredentials: true
            });

            if (data) {
                setProfileData(data.profileData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    };

    const value = {
        backendUrl,
        dToken,
        setDToken,
        setAppointments,
        appointments,
        getAllappointments,
        AppointmentComplete,
        Appointmentcancel,
        getDashData,
        setDashData,
        dashData,
        profileData,
        setProfileData,
        getprofiledata
    };

    return (
        <DoctorContext.Provider value={value}>
            {children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;
