# HealthHub - Doctor Appointment Web App

HealthHub is a full-stack web application designed to make healthcare more accessible by simplifying the process of booking doctor appointments from the comfort of your home. Patients, Doctors, and Admins can schedule, manage, and track their activities in real time. The app integrates essential patient data storage, booking, and hospital data to facilitate secure and efficient patient-doctor interactions. With robust authentication (Express.js, Bcrypt.js, and Node.js), HealthHub provides an efficient, user-friendly experience for both patients and healthcare providers.

---

## 🛠 Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **State Management:** React useContext
- **Authentication:** JSON Web Tokens (JWT)

---

## ✨ Key Features

### 1. Three-Level Authentication

#### Patient Login
- Patients can sign up, log in, and book appointments with doctors.
- Secure online payment system integration (Razorpay).
- Session system implementation with useContext.
- Manage profile with editable attributes (name, email, address, gender, birthday, profile picture).

#### Doctor Login
- Accept, reject, and manage appointments.
- Update profile details like name, email, degree, number of appointments, and location.
- Track earnings and payment history.

#### Admin Login
- Add, update, and delete doctors.
- Manage doctors and patients.
- Track bookings and analytics.

---

## 🏠 Home Page
- Features a top doctors’ display with sheer care.
- Search for doctors based on specialties.
- View top doctors’ lists and their profiles.
- Explore additional sections: About Us, Delivery Information, Privacy Policy, and Get in Touch.
- Footer includes navigation links: Home, About Us, Delivery Info, Privacy Policy, Contact Us.

---

## 👨‍⚕️ All Doctors Page
- List of all available doctors.
- Filter doctors by specialty.
- Click on a doctor’s profile to navigate to the Doctor Appointment Page.

---

## ℹ️ About Page
- Provides information about HealthHub’s vision and mission.
- Why Choose Us section highlighting:
  - Efficiency: Streamlined appointment process.
  - Convenience: Online booking and payment.
  - Personalization: Tailored recommendations based on user preferences.
- Features section with enhanced facilities.

---

## 📞 Contact Page
- Contact clinic address and contact details.
- Section to display app links and social profiles.
- Footer navigation links.

---

## 📅 Doctor Appointment Page
- Displays detailed information about the selected doctor:
  - Doctor’s profile: qualification, description, fees, and short description.
  - Appointment system: Date Picker, Choose time, and payment method.
- Online payment integration (Razorpay).
- User can choose a time slot and confirm booking.

---

## 👤 User Profile
- Accessible after login.
- View and update profile.
- Upload profile photo.
- Update name, email, address, gender, and birthday.
- List of confirmed and canceled appointments.
- Logout option.

---

## 🛠 Admin Panel
- Dashboard overview:
  - Displays statistics: number of doctors, appointments, patients, and recent bookings.
  - Quick navigation menu.
- Doctors management:
  - Add, update, and delete doctor profiles (name, specialty, email, password, degree, address, experience, fees, photo).
- Patient management:
  - View all registered patients with option to edit or delete profiles.
- Appointment management:
  - View list of all appointments including patient name, age, date, doctor name, fees.
  - Change appointment status: Cancel or Mark as Completed.

---

## 📊 Doctor Dashboard
- Track appointments and earnings.
- Manage availability and profile details.
- Accept or reject appointment requests.

---
