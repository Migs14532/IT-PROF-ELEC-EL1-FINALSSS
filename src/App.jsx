import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Loading from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import Customer from "./pages/Customer";
import Staff from "./pages/Staff";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Router>
      {/* Global toast container */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Auth Screens */}
        <Route path="/" element={<Loading />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Main App Screens */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
