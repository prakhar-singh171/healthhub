import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Create axios instance with withCredentials and Authorization
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
  });

  // Attach token to every request dynamically
  axiosInstance.interceptors.request.use((config) => {
    if (aToken) {
      config.headers.Authorization = `Bearer ${aToken}`;
    }
    return config;
  }, (error) => Promise.reject(error));

  const getAllDoctors = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/all-doctors');
      if (response.data) {
        setDoctors(response.data.doctors);
      } else {
        toast.error(response.data?.message || "Failed to fetch doctors");
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axiosInstance.post('/api/admin/change-availability', { docId });
      if (data) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    }
  };

  const getAllappointments = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/appointments');
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

  const Appointmentcancel = async (appointmentId) => {
    try {
      const { data } = await axiosInstance.post('/api/admin/appointment-cancel', { appointmentId });
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

  const getDashData = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/dashboard');
      if (data) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllappointments,
    Appointmentcancel,
    dashData,
    getDashData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
