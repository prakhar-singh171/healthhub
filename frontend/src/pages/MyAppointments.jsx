import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";


const MyAppointments = () => {
  const { doctors, token, backendUrl,getDoctorsData } = useContext(AppContext);
  const [payment, setPayment] = useState('')
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([]);
  const months = [
    "",
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/my-appointments",
        {
          withCredentials: true,
        }
      );
      console.log(data);
      if (data && Array.isArray(data.appointments)) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error("No appointments found or take the appointments");
      }
    } catch (error) {
     const msg=error.response?.data?.message || 'Something went wrong'
                                 toast.error(msg)  
    }
  };

  const cancleAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        {
          withCredentials: true,
        }
      );
      if (data) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData()
      } else {
        toast.error(data.message);
      }
    } catch (error) {
     const msg=error.response?.data?.message || 'Something went wrong'
                                 toast.error(msg)  
    }
  };

  const initPay = (order) => {
    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Appointment Payment',
        description: "Appointment Payment",
        order_id: order.id,
        receipt: order.receipt,
        handler: async (response) => {

          console.log('dsfds')
            console.log(response)

            try {
                const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response,{
                  withCredentials: true,
                });
                if (data) {
                    navigate('/my-appointments')
                    getUserAppointments()
                }
            } catch (error) {
              const msg=error.response?.data?.message || 'Something went wrong'
                                          toast.error(msg)  
            }
        }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
};

// Function to make payment using razorpay
const appointmentRazorpay = async (appointmentId) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, {
          withCredentials: true,
        })
        if (data) {
          console.log(data.order)
            initPay(data.order)
        }else{
            toast.error(data.message)
        }
    } catch (error) {
       const msg=error.response?.data?.message || 'Something went wrong'
       toast.error(msg)  
    }
}


  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
        <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
        <div className=''>
            {appointments.map((item, index) => (
                <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                    <div>
                        <img className='w-36 bg-[#EAEFFF]' src={item.docId.image} alt="" />
                    </div>
                    <div className='flex-1 text-sm text-[#5E5E5E]'>
                        <p className='text-[#262626] text-base font-semibold'>{item.docId.name}</p>
                        <p>{item.docId.speciality}</p>
                        <p className='text-[#464646] font-medium mt-1'>Address:</p>
                        <p className=''>{item.docId.address.line1}</p>
                        <p className=''>{item.docId.address.line2}</p>
                        <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
                    </div>
                    <div></div>
                    <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                        {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                        {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" /></button>}
                        {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Paid</button>}

                        {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}

                        {!item.cancelled && !item.isCompleted && <button onClick={() => cancleAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                        {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                    </div>
                </div>
            ))}
        </div>
    </div>
)
}



export default MyAppointments;