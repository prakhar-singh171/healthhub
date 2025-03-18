import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext();

const AppContextProvider = ({children}) => {
    const [doctors, setDoctors] = useState([]);
    const currencySymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [token,setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):false)
    const [userData,setUserData] = useState(false)
  
    const getDoctorsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/doctor/list');
            
            if (response.data) {
                if (Array.isArray(response.data.doctors)) {
                    setDoctors(response.data.doctors);
                    toast.success(response.message);
                }
            } 
        } catch (error) {
            const msg=error.response?.data?.message || 'Something went wrong'
                       toast.error(msg)  
        }
    }

    const loadUserProfileData = async ()=>{
        try {
            const {data} = await axios.get(`${backendUrl}/api/user/get-profile`,
                {
                    withCredentials: true,
                  });          
                    if(data){
                setUserData(data.userData)
            }else{
                toast.error(data.error)
            }
        } catch (error) {
             const msg=error.response?.data?.message || 'Something went wrong'
                        toast.error(msg)  
        }
    }
    const value = {
        doctors,
        currencySymbol,
        getDoctorsData,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
        backendUrl
    }
    useEffect(() => {
        getDoctorsData()
    }, [])
    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    },[token])

   

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;