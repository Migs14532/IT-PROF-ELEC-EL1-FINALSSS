import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function Admin() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load admin list.");
    else setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openModal = (admin = null) => {
    if (admin) {
      setEditingId(admin.id);
      setName(admin.name);
      setEmail(admin.email);
      setPhone(admin.phone || "");
    } else {
      setEditingId(null);
      setName("");
      setEmail("");
      setPhone("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return toast.error("Name and Email are required.");

    if (editingId) {
      const { error } = await supabase
        .from("admin")
        .update({ name, email, phone })
        .eq("id", editingId);
      if (error) toast.error("Failed to update admin.");
      else toast.success("Admin updated successfully!");
    } else {
      const { error } = await supabase
        .from("admin")
        .insert([{ name, email, phone }]);
      if (error) toast.error("Failed to add admin.");
      else toast.success("New admin added successfully!");
    }

    fetchAdmins();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    const { error } = await supabase.from("admin").delete().eq("id", id);
    if (error) toast.error("Failed to delete admin.");
    else {
      toast.success("Admin deleted successfully!");
      fetchAdmins();
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Management</h1>
          <p className="text-gray-500">Manage system administrators and their access</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold cursor-pointer"
        >
          Add Admin
        </button>
      </div>

      {/* ADMIN TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-800">Admin List</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all administrators</p>
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
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-800">{a.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{a.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{a.phone || "-"}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(a)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400">
                      <p className="font-medium text-lg">No admin users found</p>
                      <p className="text-sm mt-2">Add your first administrator to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? "Edit Admin" : "Add Admin"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  placeholder="09*********"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all cursor-pointer font-semibold mt-6"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
