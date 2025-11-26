import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, UserCog, ShoppingBag, DollarSign } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();

  // STATS
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);

  // Fetch Only 3 Stats
  const fetchStats = async () => {
  try {
    // Total Orders
    const { data: orders } = await supabase.from("customers").select("*");
    setTotalOrders(orders?.length || 0);

    // Revenue (sum of total from customers table)
    const { data: revenueData } = await supabase.from("customers").select("total");
    const totalRevenue = revenueData?.reduce((sum, x) => sum + (x.total || 0), 0);
    setRevenue(totalRevenue || 0);

    // Total Customers
    const { data: customers } = await supabase.from("customers").select("*");
    setTotalCustomers(customers?.length || 0);

    // Total Staff
    const { count: staffCount } = await supabase.from("staff").select("*", { count: "exact" });
    setTotalStaff(staffCount || 0);
  } catch (error) {
    console.error("Error fetching stats:", error.message);
  }
};

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-50 min-h-screen">
      
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 p-3 hover:bg-white/60 rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm shadow-sm"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

            <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Admin Dashboard
      </h1>
      <p className="text-gray-500 mb-6">
        Manage your customer orders and information
      </p>


      {/* 4-CARD DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* TOTAL CUSTOMERS */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium opacity-90">Total Customers</h2>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <p className="text-4xl font-bold">{totalCustomers}</p>
          <p className="text-xs opacity-75 mt-2">Registered users</p>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium opacity-90">Total Orders</h2>
            <div className="bg-white/20 p-3 rounded-xl">
              <ShoppingBag size={24} />
            </div>
          </div>
          <p className="text-4xl font-bold">{totalOrders}</p>
          <p className="text-xs opacity-75 mt-2">All time orders</p>
        </div>

        {/* TOTAL REVENUE */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium opacity-90">Revenue</h2>
            <div className="bg-white/20 p-3 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-4xl font-bold">₱{revenue.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Total earnings</p>
        </div>

        {/* TOTAL STAFF */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium opacity-90">Staff</h2>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserCog size={24} />
            </div>
          </div>
          <p className="text-4xl font-bold">{totalStaff}</p>
          <p className="text-xs opacity-75 mt-2">Active employees</p>
        </div>

      </div>
    </div>
  );
}
