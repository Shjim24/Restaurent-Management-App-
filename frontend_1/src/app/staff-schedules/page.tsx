"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";

export default function StaffSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const navLinks = [
    { path: "admin", label: "Admin" },
    { path: "menu", label: "Menu" },
    { path: "reservations", label: "Reservations" },
    { path: "staff-schedules", label: "Staff Schedules" },
    { path: "inventory", label: "Inventory" },
    { path: "notifications", label: "Notifications" },
  ];

  // Check login & fetch schedules on mount
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setLoggedIn(true);
    fetchSchedules(token);
  }, [router]);

  const fetchSchedules = (token: string) => {
    fetch("http://localhost:3001/staff-schedules", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or failed to fetch");
        return res.json();
      })
      .then(setSchedules)
      .catch(() => {
        toast.error("Failed to load schedules or session expired");
        router.push("/auth/login");
      });
  };

  const handleCreateOrUpdate = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Login required");
      router.push("/auth/login");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:3001/staff-schedules/${editingId}`
      : "http://localhost:3001/staff-schedules";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          shift_date: shiftDate,
          shift_start: shiftStart,
          shift_end: shiftEnd,
          role,
        }),
      });

      if (!res.ok) throw new Error("Failed to save schedule");

      fetchSchedules(token);
      resetForm();
      toast.success(`Schedule ${editingId ? "updated" : "created"}`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to save schedule"
      );
    }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setUserId(s.user_id.toString());
    setShiftDate(s.shift_date);
    setShiftStart(s.shift_start);
    setShiftEnd(s.shift_end);
    setRole(s.role);
  };

  const handleDelete = async (id: number) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Login required");
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/staff-schedules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete schedule");
      fetchSchedules(token);
      toast.success("Schedule deleted");
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setUserId("");
    setShiftDate("");
    setShiftStart("");
    setShiftEnd("");
    setRole("");
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

      {/* Main Content */}
      <main className="pt-32 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-pink-600">
          Staff Schedule Management
        </h1>

        {/* Schedule form */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow space-y-4">
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
          />
          <input
            type="time"
            className="w-full border px-3 py-2 rounded"
            value={shiftStart}
            onChange={(e) => setShiftStart(e.target.value)}
          />
          <input
            type="time"
            className="w-full border px-3 py-2 rounded"
            value={shiftEnd}
            onChange={(e) => setShiftEnd(e.target.value)}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateOrUpdate}
              className="flex-1 bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
            >
              {editingId ? "Update" : "Create"} Schedule
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Schedules list */}
        <h2 className="text-2xl font-semibold mb-4">Current Schedules</h2>
        <ul className="space-y-4">
          {schedules.map((s) => (
            <li key={s.id} className="bg-white p-4 rounded-xl shadow-sm">
              <p>
                <strong>User ID:</strong> {s.user_id}
              </p>
              <p>
                <strong>Date:</strong> {s.shift_date}
              </p>
              <p>
                <strong>Shift:</strong> {s.shift_start} - {s.shift_end}
              </p>
              <p>
                <strong>Role:</strong> {s.role}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
