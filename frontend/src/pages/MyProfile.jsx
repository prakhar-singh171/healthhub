import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const MyProfile = () => {
  const {
    userData,
    setUserData,
    loadUserProfileData,
    backendUrl,
    token,
  } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formdata = new FormData();
      formdata.append("name", userData.name);
      formdata.append("phone", userData.phone);
      formdata.append("address", JSON.stringify(userData.address));
      formdata.append("gender", userData.gender);
      formdata.append("dob", userData.dob);

      image && formdata.append("image", image);
      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formdata,
        {
          withCredentials:true
        }
      );
      console.log('ttttttttt',data);
      if (data) {
        toast.success(data.message);
        await loadUserProfileData();
        setImage(false);
        setIsEdit(false);
      } else { 
        const msg=error.response?.data?.message || 'Something went wrong'
                  toast.error(msg)  
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Network error");
    }
  };

  const handleResendVerificationEmail = async () => {
    try {
      setIsVerifying(true);
      const { data } = await axios.post(
        `${backendUrl}/api/user/send-email`,
        { email: userData.email, subject: "EmailVerification" },
        {
         withCredentials:true
        }
      );

      if (data.message) {
        toast.success("Verification email sent successfully!");
      } else {
        toast.error(data.error || "Failed to send verification email.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Network error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/change-password",
        {
          email: userData.email,
          newPassword: passwordData.newPassword,
        },
        {
          withCredentials:true
        }
      );

      console.log(data);
      if (data.message) {
        toast.success(data.message);
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-sm text-left">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img
                className="w-36 opacity-75 rounded"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt=""
              />
              <img
                className="w-10 absolute bottom-12 right-12"
                src={image ? "" : assets.upload_icon}
                alt=""
              />
            </div>
            <input
              type="file"
              hidden
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image || ""} alt="" />
        )}
        {isEdit ? (
          <input
            className="bg-gray-50 text-3xl font-medium max-w-60 mt-4 border border-gray-700 px-2 py-1 mb-2 text-start rounded-md"
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <p className="font-medium text-3xl text-neutral-800 mt-4">
            {userData.name}
          </p>
        )}
        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email id:</p>
            <p className="text-blue-500">{userData.email}</p>
            <p className="font-medium">Verification:</p>
            {userData.isVerified ? (
              <p className="text-green-500 font-medium">Verified</p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-red-500 font-medium">Not Verified</p>
                <button
                  className="text-blue-500 underline"
                  disabled={isVerifying}
                  onClick={handleResendVerificationEmail}
                >
                  {isVerifying ? "Sending..." : "Resend Verification Email"}
                </button>
              </div>
            )}
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-52 border rounded-md border-gray-700 px-2 py-1 mb-2"
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            ) : (
              <p className="text-blue-400">{userData.phone}</p>
            )}
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <p>
                <input
                  className="bg-gray-50 border rounded-md border-gray-700 px-2 py-1 mb-2"
                  type="text"
                  value={userData.address?.line1 || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                />
                <br />
                <input
                  className="bg-gray-50 border rounded-md border-gray-700 px-2 py-1 mb-2"
                  type="text"
                  value={userData.address?.line2 || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                />
              </p>
            ) : (
              <p>
                {userData.address?.line1}
                <br />
                {userData.address?.line2}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                value={userData.gender}
                className="max-w-20 bg-gray-100 border rounded-md border-gray-700 px-2 py-1 mb-2"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
              >
                <option value="Other">Other</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData.gender}</p>
            )}
            <p className="font-medium">BirthDay</p>
            {isEdit ? (
              <input
                className="max-w-28 rounded-md bg-gray-100 border border-gray-700 px-2 py-1 mb-2"
                type="date"
                value={userData.dob}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
              />
            ) : (
              <p className="text-gray-400">{userData.dob}</p>
            )}
          </div>
        </div>
        <div>
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 mt-5 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={updateUserProfileData}
            >
              Save Information
            </button>
          ) : (
            <button
              className="border border-primary px-8 py-2 mt-4 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit
            </button>
          )}
          <button
            className="border border-red-500 px-8 py-2 mt-4 rounded-full hover:bg-red-500 hover:text-white transition-all"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>

        {showPasswordModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
             
              <input
                type="password"
                placeholder="New Password"
                className="w-full border rounded-md px-3 py-2 mb-2"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full border rounded-md px-3 py-2 mb-4"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
              <div className="flex justify-between">
                <button
                  className="border border-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white"
                  onClick={handleChangePassword}
                >
                  Change Password
                </button>
                <button
                  className="border border-gray-400 px-6 py-2 rounded-full hover:bg-gray-200"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default MyProfile;

               