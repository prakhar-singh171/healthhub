import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';
import jwt_decode from 'jwt-decode';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const currencySymbol = '$';
    const currency = '$';

    const months = [
        "", "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const getDoctorsData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/doctor/list`, {
                withCredentials: true
            });

            if (response.data?.doctors) {
                setDoctors(response.data.doctors);
                toast.success(response.message);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    }

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            console.log(data);

            if (data) {
                setUserData(data.userData);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        }
    }

    const slotsDateFormat = (slotDate) => {
        const dateArray = slotDate.split("_");
        return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
    };

    const logout = async () => {
    try {
        let response;

        if (role === 'admin') {
            response = await axios.post(`${backendUrl}/api/admin/logout`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('aToken')}` },
                withCredentials: true
            });
            if (response.status === 200) {
                localStorage.removeItem("aToken");
            }
        } else if (role === 'doctor') {
            response = await axios.post(`${backendUrl}/api/doctor/logout`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('dToken')}` },
                withCredentials: true
            });
            if (response.status === 200) {
                localStorage.removeItem("dToken");
            }
        } else if (role === 'user') {
            response = await axios.post(`${backendUrl}/api/user/logout`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true
            });
            if (response.status === 200) {
                localStorage.removeItem("token");
            }
        }

        if (response && response.status === 200) {
            setToken(null);
            setRole(null);
            setUserData(null);
            toast.success("Logged out successfully.");
        } else {
            toast.error("Logout failed. Try again.");
        }

    } catch (error) {
        const msg = error.response?.data?.message || 'Logout failed';
        toast.error(msg);
    }
};

const handleUserLogout = async () => {
  try {
    const resp = await axios.post(
      `${backendUrl}/api/user/logout`,
      {}, // empty body since it's logout
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      }
    );

    if (resp.status === 200) {
      localStorage.removeItem("token");
      setToken(null);
      setRole(null);
      setUserData(null);
      toast.success("You have been logged out.");
    } else {
      toast.error("Logout failed.");
    }
  } catch (err) {
    const message = err.response?.data?.message || "Logout request failed.";
    toast.error(message);
  }
};



    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        return age;
    }



    useEffect(() => {
        if (token) {
            try {
                const decoded = jwt_decode(token);
                if (decoded?.role === "admin") {
                    setRole("admin");
                } else {
                    setRole("user");
                }
            } catch (err) {
                console.error("Invalid token", err);
                logout();
            }
        } else {
            setRole(null);
            setUserData(null);
        }
    }, [token]);

    useEffect(() => {
        if (role === "user") {
            loadUserProfileData();
        } else {
            setUserData(null);
        }
    }, [role]);

    useEffect(() => {
        getDoctorsData();
    }, []);

    const value = {
        doctors,
        getDoctorsData,
        token,
        setToken,
        role,
        userData,
        backendUrl,
        logout,
        currencySymbol,
        currency,
        slotsDateFormat,
        calculateAge,setUserData,
        loadUserProfileData,
        handleUserLogout
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;
