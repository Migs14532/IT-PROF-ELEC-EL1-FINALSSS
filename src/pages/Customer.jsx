import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { ChevronLeft } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ import toast

export default function Customer() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(""); 
  const [quantity, setQuantity] = useState(""); 
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("Pending"); 
  const [editingId, setEditingId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load customers.");
    else setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const calculateTotal = (serviceType, qty) => {
    if (!serviceType || !qty) return 0;
    if (serviceType === "Wash & Fold") return parseFloat(qty) * 50;
    if (serviceType === "Ironing & Pressing") return parseFloat(qty) * 30;
    if (serviceType === "Dry Cleaning") return parseFloat(qty) * 150;
    return 0;
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setName(customer.name);
      setEmail(customer.email);
      setService(customer.service_type);
      setQuantity(customer.quantity || "");
      setPickupDate(customer.pickup_date);
      setPickupTime(customer.pickup_time);
      setTotal(customer.total || 0);
      setStatus(customer.status || "Pending");
    } else {
      setEditingId(null);
      setName("");
      setEmail("");
      setService("");
      setQuantity("");
      setPickupDate("");
      setPickupTime("");
      setTotal(0);
      setStatus("Pending");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !service || !pickupDate || !pickupTime || !quantity) {
      return toast.error("All fields are required.");
    }

    const calculatedTotal = calculateTotal(service, quantity);

    if (editingId) {
      const { error } = await supabase
        .from("customers")
        .update({
          name,
          email,
          service_type: service,
          quantity,
          total: calculatedTotal,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          status,
        })
        .eq("id", editingId);
      if (error) toast.error("Failed to update customer.");
      else toast.success("Customer updated successfully!");
    } else {
      const { error } = await supabase.from("customers").insert([
        {
          name,
          email,
          service_type: service,
          quantity,
          total: calculatedTotal,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          status,
        },
      ]);
      if (error) toast.error("Failed to add customer.");
      else toast.success("New customer added successfully!");
    }

    fetchCustomers();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) toast.error("Failed to delete customer.");
    else {
      toast.success("Customer deleted successfully!");
      fetchCustomers();
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-50 min-h-screen">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 p-3 hover:bg-white/60 rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm shadow-sm"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Management</h1>
          <p className="text-gray-500">Manage your customer orders and information</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold cursor-pointer"
        >
          Add Customer
        </button>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-800">Customer List</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all customer orders</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pickup Date</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pickup Time</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-800">{c.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{c.email}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {c.service_type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">{c.quantity}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-800">₱{c.total}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{c.pickup_date}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{c.pickup_time}</td>
                    {/* UPDATED STATUS BADGE */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          c.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(c)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-400">
                      <p className="font-medium text-lg">No customers found</p>
                      <p className="text-sm mt-2">Add your first customer to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT / CREATE CUSTOMER MODAL */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative shadow-2xl transform animate-in">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-2xl font-light"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? "Edit Order" : "Create New Order"}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setTotal(calculateTotal(e.target.value, quantity));
                }}
              >
                <option value="" disabled>--- Choose a service ---</option>
                <option value="Wash & Fold">Wash & Fold - ₱50/kg</option>
                <option value="Ironing & Pressing">Ironing & Pressing - ₱30/piece</option>
                <option value="Dry Cleaning">Dry Cleaning - ₱150/piece</option>
              </select>
            </div>

            {/* Quantity and Total */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setTotal(calculateTotal(service, e.target.value));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-3 rounded-xl bg-gray-50 font-bold text-gray-700"
                  value={`₱${total}`}
                  readOnly
                />
              </div>
            </div>

            {/* Pickup Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>
            </div>

            {/* Status - only show when editing */}
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all cursor-pointer font-semibold mt-6"
            >
              {editingId ? "Update Order" : "Create Order"}
            </button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}
