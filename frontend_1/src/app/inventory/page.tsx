"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";

interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  par_level: number;
  last_updated: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<InventoryItem>>({});
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    item_name: "",
    quantity: 0,
    unit: "",
    par_level: 0,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const navLinks = [
    { path: "admin", label: "Admin" },
    { path: "menu", label: "Menu" },
    { path: "reservations", label: "Reservations" },
    { path: "staff-schedules", label: "Staff Schedules" },
    { path: "inventory", label: "Inventory" },
    { path: "notifications", label: "Notifications" },
  ];

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setLoggedIn(true);
    fetchItems(token);
  }, [router]);

  const fetchItems = async (token: string) => {
    try {
      const res = await fetch("http://localhost:3001/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Failed to load inventory or session expired");
      router.push("/auth/login");
    }
  };

  const handleCreate = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Login required");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error("Failed to create item");
      toast.success("Item added successfully!");
      fetchItems(token);
      setNewItem({ item_name: "", quantity: 0, unit: "", par_level: 0 });
    } catch {
      toast.error("Failed to create item");
    }
  };

  const handleUpdate = async () => {
    if (!form.id) return;
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Login required");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/inventory/${form.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Item updated successfully!");
      setEditingId(null);
      fetchItems(token);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Login required");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/inventory/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Item deleted successfully!");
      fetchItems(token);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setLoggedIn(false);
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-100 text-gray-800">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 px-8 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl font-extrabold text-pink-600 tracking-wide"
        >
          FOODIE 🍽
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6 text-lg font-medium">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              href={`/${path}`}
              className="hover:text-pink-600 transition-colors duration-300"
            >
              {label}
            </Link>
          ))}

          {!loggedIn ? (
            <Link
              href="/auth/login"
              className="ml-4 px-4 py-2 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition cursor-pointer"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none text-pink-600"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 w-full bg-white shadow-md md:hidden z-40 py-6 px-8 flex flex-col gap-5">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              href={`/${path}`}
              onClick={() => setMenuOpen(false)}
              className="text-lg font-semibold hover:text-pink-600 transition"
            >
              {label}
            </Link>
          ))}
          {!loggedIn ? (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-semibold hover:text-pink-600 transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="text-left text-lg font-semibold text-pink-600 hover:text-pink-800 transition"
            >
              Logout
            </button>
          )}
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-28">
        {/* Add New Item Section */}
        <h2 className="text-3xl font-bold mb-6 text-pink-600 border-b border-pink-300 pb-2">
          Add New Inventory Item
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <input
            placeholder="Item Name"
            className="border border-pink-300 focus:ring-2 focus:ring-pink-400 focus:outline-none px-4 py-2 rounded shadow-sm"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            className="border border-pink-300 focus:ring-2 focus:ring-pink-400 focus:outline-none px-4 py-2 rounded shadow-sm"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          />
          <input
            placeholder="Unit"
            className="border border-pink-300 focus:ring-2 focus:ring-pink-400 focus:outline-none px-4 py-2 rounded shadow-sm"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          />
          <input
            type="number"
            placeholder="Par Level"
            className="border border-pink-300 focus:ring-2 focus:ring-pink-400 focus:outline-none px-4 py-2 rounded shadow-sm"
            value={newItem.par_level}
            onChange={(e) => setNewItem({ ...newItem, par_level: Number(e.target.value) })}
          />
          <button
            className="bg-pink-600 text-white rounded-lg px-6 py-2 hover:bg-pink-700 transition shadow-md"
            onClick={handleCreate}
          >
            Add Item
          </button>
        </div>

        {/* Inventory List */}
        <h2 className="text-3xl font-bold mt-12 mb-6 text-pink-600 border-b border-pink-300 pb-2">
          Inventory List
        </h2>
        <div className="overflow-x-auto rounded-xl shadow-lg border border-pink-200">
          <table className="w-full border-collapse">
            <thead className="bg-pink-50 text-pink-700 text-left text-lg font-semibold">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Par Level</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) =>
                editingId === item.id ? (
                  <tr key={item.id} className="bg-yellow-50">
                    <td className="p-3">
                      <input
                        value={form.item_name || ""}
                        onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                        className="border px-2 py-1 w-full rounded"
                      />
                    </td>
                    <td className="p-3 flex gap-2 items-center">
                      <input
                        type="number"
                        value={form.quantity || 0}
                        onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                        className="border px-2 py-1 w-24 rounded"
                      />
                      <input
                        value={form.unit || ""}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        className="border px-2 py-1 w-20 rounded"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={form.par_level || 0}
                        onChange={(e) => setForm({ ...form, par_level: Number(e.target.value) })}
                        className="border px-2 py-1 w-24 rounded"
                      />
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={item.id}
                    className="hover:bg-pink-50 transition-colors cursor-pointer"
                  >
                    <td className="p-4">{item.item_name}</td>
                    <td className="p-4">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-4">{item.par_level}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm(item);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
