import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Context imports
import { AppContext } from "../context/AppContext";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [loginType, setLoginType] = useState("User"); // User | Admin | Doctor
  const [state, setState] = useState("login"); // login | Sign Up (only for user)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { backendUrl, setToken } = useContext(AppContext);
  const { setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let response;
    if (loginType === "User") {
      // User Login/Register Flow
      if (state === "Sign Up") {
        response = await axios.post(`${backendUrl}/api/user/register`, {
          name, email, password
        }, { withCredentials: true });  // <-- added here

        toast.success("Sign up successful! Please login.");
        setState("login");
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, {
          email, password
        }, { withCredentials: true });  // <-- already present

        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        toast.success("Login successful");
        navigate("/");
      }
    } else if (loginType === "Admin") {
      // Admin Login Flow
      response = await axios.post(`${backendUrl}/api/admin/login`, {
        email, password
      }, { withCredentials: true });  // <-- added here

      localStorage.setItem("aToken", response.data.token);
      setAToken(response.data.token);
      toast.success("Admin login successful");
      navigate("/admin-dashboard");
    } else if (loginType === "Doctor") {
      // Doctor Login Flow
      response = await axios.post(`${backendUrl}/api/doctor/login`, {
        email, password
      }, { withCredentials: true });  // <-- added here

      localStorage.setItem("dToken", response.data.token);
      setDToken(response.data.token);
      toast.success("Doctor login successful");
      navigate("/doctor-dashboard");
    }
  } catch (error) {
    const msg = error.response?.data?.message || "Something went wrong";
    toast.error(msg);
  }
};


  return (
    <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:w-96 border rounded-xl text-zinc-600 text-sm shadow-lg text-left">
        <p className="font-semibold text-2xl">
          {state === "Sign Up" ? "Create Account" : `${loginType} Login`}
        </p>

        {loginType === "User" && state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="bg-primary text-white w-full py-2 rounded-md text-base"
          type="submit"
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {/* Sign up / Login switch */}
        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              className="text-primary underline cursor-pointer ml-1"
              onClick={() => setState("login")}
            >
              Login here
            </span>
          </p>
        ) : (
          <>
            {loginType === "User" && (
              <p>
                New user?{" "}
                <span
                  className="text-primary underline cursor-pointer ml-1"
                  onClick={() => setState("Sign Up")}
                >
                  Sign up here
                </span>
              </p>
            )}

            {/* Forgot password always visible */}
            <p>
              Forgot your password?{" "}
              <span
                className="text-primary underline cursor-pointer ml-1"
                onClick={() => navigate("/forgot-password")}
              >
                Reset here
              </span>
            </p>
          </>
        )}

        {/* Login type selection */}
        <div className="w-full flex justify-between mt-4">
          <button
            type="button"
            className={`border rounded px-3 py-1 ${loginType === "User" && "bg-primary text-white"}`}
            onClick={() => { setLoginType("User"); setState("login"); }}
          >
            User
          </button>
          <button
            type="button"
            className={`border rounded px-3 py-1 ${loginType === "Admin" && "bg-primary text-white"}`}
            onClick={() => { setLoginType("Admin"); setState("login"); }}
          >
            Admin
          </button>
          <button
            type="button"
            className={`border rounded px-3 py-1 ${loginType === "Doctor" && "bg-primary text-white"}`}
            onClick={() => { setLoginType("Doctor"); setState("login"); }}
          >
            Doctor
          </button>
        </div>
      </div>
    </form>
  );
};

export default Login;
