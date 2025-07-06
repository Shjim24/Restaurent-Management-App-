"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { Menu, X } from "lucide-react";

interface Log {
  level: string;
  message: string;
  context: string;
  createdAt?: string;
}

interface User {
  id: number;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  // Navbar state & login check
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // Admin page states
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [newLog, setNewLog] = useState<Partial<Log>>({ level: 'info' });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Check login & load data
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setLoggedIn(true);

    fetch("http://localhost:3001/logs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setLogs)
      .catch(() => toast.error("Failed to load logs"));

    fetch("http://localhost:3001/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, [router]);

  // Navbar functions
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLogout = () => {
    Cookies.remove("token");
    setLoggedIn(false);
    router.push("/auth/login");
  };

  // Admin page functions
  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  const handleRoleChange = async (id: number, newRole: string) => {
    const token = Cookies.get("token");
    await fetch(`http://localhost:3001/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    const token = Cookies.get("token");
    const res = await fetch(`http://localhost:3001/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } else {
      toast.error("Failed to delete user");
    }
  };

  const handleAddLog = async () => {
    if (!newLog.message || !newLog.context) {
      toast.error("Message and context required");
      return;
    }
    const token = Cookies.get("token");
    await fetch("http://localhost:3001/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newLog),
    });
    const updatedLogs = await fetch("http://localhost:3001/logs", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());
    setLogs(updatedLogs);
    setNewLog({ level: 'info' });
    toast.success("Log added");
  };

  // Navbar links same as main page
  const navLinks = [
    { path: "admin", label: "Admin" },
    { path: "menu", label: "Menu" },
    { path: "reservations", label: "Reservations" },
    { path: "staff-schedules", label: "Staff Schedules" },
    { path: "inventory", label: "Inventory" },
    { path: "notifications", label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-100 text-gray-800">
      <Toaster position="top-right" />

      {/* Navbar (same as main page) */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-pink-600 tracking-wide">
          FOODIE 🍽
        </Link>
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
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none text-pink-600"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>

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
      </header>

      {/* Main admin content */}
      <main className="pt-28 px-6 max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-pink-600 text-center">Admin Dashboard</h1>

        {/* Users */}
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">User Management</h2>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p className="italic text-gray-500">No users found.</p>
          ) : (
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.id}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border px-2 py-1 rounded"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Logs */}
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">System Logs</h2>
          <div className="flex gap-2 mb-4">
            {['all', 'error', 'warn', 'info'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level as any)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  filter === level ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={newLog.level}
              onChange={(e) => setNewLog({ ...newLog, level: e.target.value })}
              className="border px-2 py-1 rounded"
            >
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
            </select>
            <input
              type="text"
              placeholder="Message"
              value={newLog.message || ''}
              onChange={(e) => setNewLog({ ...newLog, message: e.target.value })}
              className="border px-2 py-1 rounded w-full"
            />
            <input
              type="text"
              placeholder="Context"
              value={newLog.context || ''}
              onChange={(e) => setNewLog({ ...newLog, context: e.target.value })}
              className="border px-2 py-1 rounded w-full"
            />
            <button
              onClick={handleAddLog}
              className="bg-pink-600 text-white px-4 py-1 rounded hover:bg-pink-700"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2 text-sm">
            {filteredLogs.length === 0 ? (
              <li className="italic text-gray-500">No logs found.</li>
            ) : (
              filteredLogs.map((log, idx) => (
                <li key={idx} className="bg-gray-50 p-2 rounded shadow">
                  <span
                    className={`text-xs font-bold mr-2 px-2 py-1 rounded-full text-white ${
                      log.level === 'error'
                        ? 'bg-red-600'
                        : log.level === 'warn'
                        ? 'bg-yellow-500'
                        : 'bg-pink-500'
                    }`}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  {log.message} - <span className="italic text-gray-600">{log.context}</span>
                  {log.createdAt && (
                    <div className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
