import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  Shield,
  UserCog,
  LogOut,
  ShoppingBag,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import toast from "react-hot-toast";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
    totalStaff: 0,
    totalAdmins: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [status, setStatus] = useState("Pending");
  const [total, setTotal] = useState(0);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: customers, error: custErr } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (custErr) throw custErr;

      const { data: staffList, error: staffErr } = await supabase.from("staff").select("*");
      if (staffErr) throw staffErr;

      const { data: adminList, error: adminErr } = await supabase.from("admin").select("*");
      if (adminErr) throw adminErr;

      setStats({
        totalOrders: customers.length,
        completed: customers.filter((c) => c.status === "Completed").length,
        pending: customers.filter((c) => c.status === "Pending").length,
        revenue: customers.reduce((sum, c) => sum + parseFloat(c.total || 0), 0),
        totalStaff: staffList.length,
        totalAdmins: adminList.length,
      });

      setRecentOrders(customers);
    } catch (error) {
      console.error("Dashboard fetch error:", error.message);
      toast.error("Failed to load dashboard data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Modal handling
  const openModal = (order = null) => {
    if (order) {
      setEditingId(order.id);
      setName(order.name);
      setEmail(order.email);
      setService(order.service_type);
      setQuantity(order.quantity || "");
      setPickupDate(order.pickup_date);
      setPickupTime(order.pickup_time);
      setStatus(order.status || "Pending");
      setTotal(order.total || 0);
    } else {
      setEditingId(null);
      setName("");
      setEmail("");
      setService("");
      setQuantity("");
      setPickupDate("");
      setPickupTime("");
      setStatus("Pending");
      setTotal(0);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const calculateTotal = (serviceType, qty) => {
    if (!serviceType || !qty) return 0;
    if (serviceType === "Wash & Fold") return parseFloat(qty) * 50;
    if (serviceType === "Ironing & Pressing") return parseFloat(qty) * 30;
    if (serviceType === "Dry Cleaning") return parseFloat(qty) * 150;
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !service || !pickupDate || !pickupTime || !quantity) {
      return toast.error("All fields are required!");
    }

    const calculatedTotal = calculateTotal(service, quantity);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("customers")
          .update({
            name,
            email,
            service_type: service,
            quantity,
            pickup_date: pickupDate,
            pickup_time: pickupTime,
            status,
            total: calculatedTotal,
          })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Order updated successfully!");
      } else {
        const { error } = await supabase.from("customers").insert([
          {
            name,
            email,
            service_type: service,
            quantity,
            pickup_date: pickupDate,
            pickup_time: pickupTime,
            status,
            total: calculatedTotal,
          },
        ]);
        if (error) throw error;
        toast.success("Order created successfully!");
      }
      fetchDashboardData();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Order deleted successfully!");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order!");
    }
  };

  // Handle logout
  const handleLogout = () => {
    navigate("/"); // redirect to Landing.jsx
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-50">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-blue-100 p-6 hidden md:block">
        <div className="mb-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LaundryMS
          </h1>
          <p className="text-x1 text-gray-500 mt-1">Management System</p>
        </div>
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200 transition-all"
          >
            <Home size={20} /> 
            <span className="font-semibold">Dashboard</span>
          </Link>
          <Link
            to="/customer"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all"
          >
            <Users size={20} />
            <span className="font-medium">Customer Management</span>
          </Link>
          <Link
            to="/staff"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all"
          >
            <UserCog size={20} />
            <span className="font-medium">Staff Management</span>
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all"
          >
            <Shield size={20} />
            <span className="font-medium">Admin Management</span>
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 mt-auto absolute bottom-6 left-6 right-6 transition-all cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <TrendingUp size={16} className="text-green-500" />
                Real-time analytics and insights
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer font-semibold"
            >
              <Plus size={20} />
              New Order
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium opacity-90">Total Orders</h2>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <ShoppingBag size={24} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">{stats.totalOrders}</p>
                  <p className="text-xs opacity-75 mt-2">All time orders</p>
                </div>

                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium opacity-90">Pending</h2>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Clock size={24} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">{stats.pending}</p>
                  <p className="text-xs opacity-75 mt-2">Awaiting completion</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium opacity-90">Completed</h2>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">{stats.completed}</p>
                  <p className="text-xs opacity-75 mt-2">Successfully finished</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium opacity-90">Revenue</h2>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <DollarSign size={24} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">₱{stats.revenue.toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-2">Total earnings</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium opacity-90">Staff</h2>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <UserCog size={24} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">{stats.totalStaff}</p>
                  <p className="text-xs opacity-75 mt-2">Active employees</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium opacity-90">Admins</h2>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Shield size={24} />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">{stats.totalAdmins}</p>
                  <p className="text-xs opacity-75 mt-2">System administrators</p>
                </div>
              </div>

              {/* RECENT ORDERS */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                  <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                  <p className="text-sm text-gray-500 mt-1">Latest customer transactions</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Pickup Date & Time
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-12 text-gray-400">
                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-medium">No orders yet</p>
                            <p className="text-sm mt-1">Create your first order to get started</p>
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-800">{order.name}</div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">{order.email}</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {order.service_type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-700 font-medium">{order.quantity}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              <div>{order.pickup_date}</div>
                              <div className="text-xs text-gray-400">{order.pickup_time}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-gray-800">
                              ₱{order.total}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal(order)}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all cursor-pointer text-xs font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(order.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all cursor-pointer text-xs font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* EDIT / CREATE ORDER MODAL */}
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
                    <option value="" disabled>
                      --- Choose a service ---
                    </option>
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
      </main>
    </div>
  );
}