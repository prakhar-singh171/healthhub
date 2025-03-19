import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const VerifyEmail = () => {
  const { token, email } = useParams(); // Extract token and email from the URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {backendUrl}=useContext(AppContext)
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Call the backend API for verification
        const response = await axios.post(`${backendUrl}/api/user/verify`, {
          token,
          email,
        });

        console.log(response);

        if (response.data) {
          toast.success("Email verified successfully!");
          navigate("/login"); // Redirect to login or another page
        } else {
          toast.error(response.data.message || "Verification failed");
        }
      } catch (error) {
        const msg=error.response?.data?.message || 'Something went wrong'
                   toast.error(msg)  
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, email, navigate]);

  return loading ? (
    <p className="text-center mt-10">Verifying your email, please wait...</p>
  ) : (
    <p className="text-center mt-10">Redirecting...</p>
  );
};

export default VerifyEmail;
