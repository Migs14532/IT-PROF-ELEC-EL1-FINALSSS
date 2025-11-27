import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Customer() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Editable fields
  const [editForm, setEditForm] = useState({
    quantity: "",
    total: "",
    status: "",
  });

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

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) toast.error("Failed to delete order.");
    else {
      toast.success("Order deleted!");
      fetchCustomers();
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from("customers")
      .update({
        quantity: editForm.quantity,
        total: editForm.total,
        status: editForm.status,
      })
      .eq("id", selectedCustomer.id);

    if (error) toast.error("Failed to update order.");
    else {
      toast.success("Order updated!");
      setEditModalOpen(false);
      fetchCustomers();
    }
  };

  // Open edit modal
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      quantity: customer.quantity,
      total: customer.total,
      status: customer.status,
    });
    setEditModalOpen(true);
  };

  // PH Date Formatting
  const formatPHDateTime = (date, time) => {
    if (!date || !time) return { date: "-", time: "-" };
    const dt = new Date(`${date}T${time}`);
    return {
      date: dt.toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      time: dt.toLocaleTimeString("en-PH", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-50 min-h-screen">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/admin-dashboard")}
        className="mb-6 p-3 hover:bg-white/60 rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm shadow-sm"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Customer Orders
          </h1>
          <p className="text-gray-500">Manage all laundry service orders</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-800">Order List</h2>
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

                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Service
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Qty
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Pickup Date
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Pickup Time
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => {
                  const ph = formatPHDateTime(c.pickup_date, c.pickup_time);

                  return (
                    <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium">{c.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{c.email}</td>
                      <td className="py-4 px-6">{c.service_type}</td>
                      <td className="py-4 px-6">{c.quantity}</td>
                      <td className="py-4 px-6 font-bold">₱{c.total}</td>
                      <td className="py-4 px-6">{ph.date}</td>
                      <td className="py-4 px-6">{ph.time}</td>

                      <td className="py-4 px-6">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleSaveEdit(c.id, e.target.value)
                          }
                          className="px-3 py-2 rounded-xl border bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 flex gap-2">
                        {/* VIEW BUTTON */}
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setViewModalOpen(true);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs hover:shadow"
                        >
                          View
                        </button>

                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => openEditModal(c)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-xs hover:shadow"
                        >
                          Edit
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs hover:shadow"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {customers.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-400">
                      <p className="font-medium text-lg">No orders found</p>
                      <p className="text-sm mt-2">
                        No customer records are available
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>

            <p><strong>Name:</strong> {selectedCustomer.name}</p>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Service:</strong> {selectedCustomer.service_type}</p>
            <p><strong>Qty:</strong> {selectedCustomer.quantity}</p>
            <p><strong>Total:</strong> ₱{selectedCustomer.total}</p>
            <p><strong>Status:</strong> {selectedCustomer.status}</p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2 bg-gray-700 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Order</h2>

            <div className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-xl"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Total</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-xl"
                  value={editForm.total}
                  onChange={(e) =>
                    setEditForm({ ...editForm, total: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Status</label>
                <select
                  className="w-full p-3 border rounded-xl"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-5 py-2 bg-gray-500 text-white rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
