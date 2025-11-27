import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  UserCog,
  LogOut,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // STATS
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const { data: orders } = await supabase.from("customers").select("*");
      setTotalOrders(orders?.length || 0);

      const { data: revenueData } = await supabase
        .from("customers")
        .select("total");
      const totalRevenue = revenueData?.reduce(
        (sum, x) => sum + (x.total || 0),
        0
      );
      setRevenue(totalRevenue || 0);

      const { data: customers } = await supabase.from("customers").select("*");
      setTotalCustomers(customers?.length || 0);

      const { count: staffCount } = await supabase
        .from("staff")
        .select("*", { count: "exact" });
      setTotalStaff(staffCount || 0);
    } catch (error) {
      console.error("Error fetching stats:", error.message);
      toast.error("Failed to load statistics");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data) setRole(data.role);
    };

    fetchUserRole();
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-50">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-blue-100 p-6 hidden md:flex flex-col">
        <div className="mb-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LaundryMS
          </h1>
          <p className="text-xl text-gray-500 mt-1">Admin Panel</p>
        </div>

        <nav className="space-y-2">
          <div
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
            <Home size={20} />
            <span className="font-semibold">Dashboard</span>
          </div>
          <Link
            to="/customer"
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all"
          >
            <Users size={20} />
            <span className="font-medium">Customer Management</span>
          </Link>

          <Link
            to="/staff"
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all"
          >
            <UserCog size={20} />
            <span className="font-medium">Staff Management</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 text-red-500 hover:text-red-600 mt-auto transition-all cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/customer-dashboard")}
          className="mb-6 p-3 hover:bg-white/60 rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-lg">
              Overview of your laundry management system
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TOTAL CUSTOMERS */}
            <StatCard
              title="Total Customers"
              value={totalCustomers}
              icon={<Users size={30} />}
              gradient="from-blue-500 to-blue-600"
              subtitle="Registered users"
            />

            {/* TOTAL ORDERS */}
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={<ShoppingBag size={30} />}
              gradient="from-amber-400 to-orange-500"
              subtitle="All-time orders"
            />

            {/* TOTAL REVENUE */}
            <StatCard
              title="Total Revenue"
              value={`₱${revenue.toLocaleString()}`}
              icon={<DollarSign size={30} />}
              gradient="from-purple-500 to-pink-500"
              subtitle="Total earnings"
            />

            {/* TOTAL STAFF */}
            <StatCard
              title="Total Staff"
              value={totalStaff}
              icon={<UserCog size={30} />}
              gradient="from-indigo-500 to-purple-600"
              subtitle="Active employees"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------- REUSABLE STAT CARD COMPONENT -------------- */
function StatCard({ title, value, icon, gradient, subtitle }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-xl text-white transform hover:scale-[1.03] hover:shadow-2xl transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium opacity-90">{title}</h2>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>

      <p className="text-4xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs opacity-80 mt-2">{subtitle}</p>
    </div>
  );
}
