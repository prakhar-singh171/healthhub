import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";

const DoctorProfile = () => {
  const {backendUrl, dToken, getprofiledata, setProfileData, profileData } =
    useContext(DoctorContext);
    const defaultProfile = {
  name: "",
  email: "",
  education: "",
  speciality: "",
  experience: "",
  about: "",
  fees: 0,
  address: { line1: "", line2: "" },
  image: "",
  available: false,
};


  const { currency } = useContext(AppContext);
  const [isEdit,setIsEdit] = useState(false)
 // console.log('dfdfdf',getprofiledata);
  const updateprofile = async()=>{
    try {
      const updateData = {
        address:profileData.address,
        fees:profileData.fees,
        available:profileData.available
      }
      const {data} = await axios.post(backendUrl + '/api/doctor/update-profile',updateData, {
        headers: {
          Authorization: `Bearer ${dToken}`,
        },
        withCredentials:true
      })
      if(data){
        toast.success(data.message)
        setIsEdit(false)
        getprofiledata()
      }
    } catch (error) {
      const msg=error.response?.data?.message || 'Something went wrong'
      toast.error(msg)
    }
  }
  useEffect(() => {
    if (dToken) {
      getprofiledata();
    }
  }, [dToken]);
  return (
    profileData && (
      <div>

      <div className="flex flex-col gap-4 m-5">
        <div>
          <img className="bg-primary/80 w-full sm:max-w-64 rounded-lg" src={profileData.image} alt="doc image" />
        </div>
        <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">{profileData.name}</p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>
              {profileData.education} - {profileData.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">{profileData.experience}</button>
          </div>
          <div>
            <p className="flex items-center gap-1 test-sm font-medium text-neutral-800 mt-3">About:</p>
            <p className="text-sn text-gray-600 max-w-[700px] mt-1">{profileData.about}</p>
          </div>
          <p className="text-gray-600 font-medium mt-4">
            Appointment fee: <span className="text-gray-800">{currency} {isEdit ?<input className="px-2 py-2" type="number" onChange={(e)=>setProfileData(prev=>({...prev,fees:e.target.value}))} value={profileData.fees}/> : profileData.fees }</span>
          </p>
          <div className="flex gap-2 py-2">
            <p>Address:</p>
            <p className="text-sm">
              {isEdit? <input type="text" onChange={(e)=>setProfileData(prev=>({...prev,address:{...prev.address,line1:e.target.value}}))} value={profileData.address.line1}/>:profileData.address.line1}
              <br />
              {isEdit? <input type="text" onChange={(e)=>setProfileData(prev=>({...prev,address:{...prev.address,line2:e.target.value}}))} value={profileData.address.line2}/>:profileData.address.line2}

            </p>
          </div>
          <div className="flex gap-1 pt-2">
            <input onChange={()=>isEdit && setProfileData(prev=>({...prev,available:!prev.available}))} checked={profileData.available} type="checkbox" name="" id=""/>
            <label htmlFor="">Available</label>
          </div>
          {
            isEdit ? <button onClick={updateprofile} className="px-5 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all">save</button> : <button onClick={()=>setIsEdit(true)} className="px-5 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all">Edit</button>
          }
     
        </div>
      </div>
      </div>

    )
  );
};

export default DoctorProfile;