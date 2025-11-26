import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus} from "lucide-react";
import toast from "react-hot-toast";

export default function Staff() {
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load staff list.");
    else setStaffList(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openModal = (staff = null) => {
    if (staff) {
      setEditingId(staff.id);
      setName(staff.name);
      setEmail(staff.email);
      setPhone(staff.phone);
      setRole(staff.role);
    } else {
      setEditingId(null);
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !role || !phone) return toast.error("All fields are required.");

    if (editingId) {
      const { error } = await supabase
        .from("staff")
        .update({ name, email, phone, role })
        .eq("id", editingId);
      if (error) toast.error("Failed to update staff.");
      else toast.success("Staff updated successfully!");
    } else {
      const { error } = await supabase
        .from("staff")
        .insert([{ name, email, phone, role }]);
      if (error) toast.error("Failed to add staff.");
      else toast.success("New staff added successfully!");
    }

    fetchStaff();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) toast.error("Failed to delete staff.");
    else {
      toast.success("Staff deleted successfully!");
      fetchStaff();
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Staff Management</h1>
          <p className="text-gray-500">Manage your staff members and their roles</p>
        </div>
        <button
          onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer font-semibold"
        >
            <Plus size={20} />
            Add Staff
        </button>
      </div>

      {/* STAFF TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-800">Staff List</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all staff members</p>
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
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-800">{s.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{s.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{s.phone}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          s.role === "Laundry Attendant / Washer"
                            ? "bg-blue-100 text-blue-700"
                            : s.role === "Ironing Attendant / Presser"
                            ? "bg-amber-100 text-amber-700"
                            : s.role === "Dry Cleaning Operator"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(s)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {staffList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400">
                      <p className="font-medium text-lg">No staff found</p>
                      <p className="text-sm mt-2">Add your first staff member to get started</p>
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
              {editingId ? "Edit Staff" : "Add Staff"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">--- Select Role ---</option>
                  <option value="Laundry Attendant / Washer">Laundry Attendant / Washer</option>
                  <option value="Ironing Attendant / Presser">Ironing Attendant / Presser</option>
                  <option value="Dry Cleaning Operator">Dry Cleaning Operator</option>
                </select>
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
