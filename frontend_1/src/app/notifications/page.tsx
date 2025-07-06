"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // For notification form inputs
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("order");

  // Editing states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState("order");

  // Check login on mount
  useEffect(() => {
    const token = Cookies.get("token");
    setLoggedIn(!!token);
    fetchNotifications();
  }, []);

  // Fetch all notifications
  const fetchNotifications = () => {
    fetch("http://localhost:3001/notifications")
      .then((res) => res.json())
      .then(setNotifications)
      .catch(console.error);
  };

  // Logout handler
  const handleLogout = () => {
    Cookies.remove("token");
    setLoggedIn(false);
    toast.success("Logged out");
    router.push("/auth/login");
  };

  // Add notification handler
  const handleAdd = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Title and Message cannot be empty");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type }),
      });
      if (res.ok) {
        toast.success("Notification created!");
        fetchNotifications();
        setTitle("");
        setMessage("");
        setType("order");
      } else {
        toast.error("Failed to create notification");
      }
    } catch {
      toast.error("Failed to create notification");
    }
  };

  // Start editing notification
  const handleEditStart = (notification: Notification) => {
    setEditingId(notification.id);
    setEditTitle(notification.title);
    setEditMessage(notification.message);
    setEditType(notification.type);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingId(null);
  };

  // Save edited notification
  const handleEditSave = async () => {
    if (!editTitle.trim() || !editMessage.trim()) {
      alert("Title and Message cannot be empty");
      return;
    }
    if (!editingId) return;

    try {
      const res = await fetch(`http://localhost:3001/notifications/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          message: editMessage,
          type: editType,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to update notification");
        return;
      }
      toast.success("Notification updated!");
      setEditingId(null);
      fetchNotifications();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  // Delete notification
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      const res = await fetch(`http://localhost:3001/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete notification");
        return;
      }
      toast.success("Notification deleted!");
      fetchNotifications();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const navLinks = [
    { path: "admin", label: "Admin" },
    { path: "menu", label: "Menu" },
    { path: "reservations", label: "Reservations" },
    { path: "staff-schedules", label: "Staff Schedules" },
    { path: "inventory", label: "Inventory" },
    { path: "notifications", label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 text-gray-900 font-sans">
      <Toaster position="top-right" />

      {/* Navbar */}
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
          onClick={() => setMenuOpen((prev) => !prev)}
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
      <main className="p-6 max-w-3xl mx-auto pt-28">
        <h1 className="text-3xl font-bold mb-6 text-pink-600">Notifications Center</h1>

        {/* Create Notification Form */}
        <div className="mb-8 space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={editingId !== null}
          />
          <textarea
            className="w-full border px-3 py-2 rounded"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={editingId !== null}
          />
          <select
            className="w-full border px-3 py-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={editingId !== null}
          >
            <option value="order">Order</option>
            <option value="info">Info</option>
            <option value="alert">Alert</option>
          </select>

          <button
            onClick={handleAdd}
            className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
            disabled={editingId !== null}
          >
            Create Notification
          </button>
        </div>

        {/* Notifications List */}
        <h2 className="text-2xl font-semibold mb-4">Existing Notifications</h2>
        <ul className="space-y-4">
          {notifications.map((n) =>
            editingId === n.id ? (
              <li key={n.id} className="border p-4 rounded shadow-sm bg-yellow-50">
                <input
                  className="w-full border px-3 py-2 rounded mb-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                />
                <textarea
                  className="w-full border px-3 py-2 rounded mb-2"
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Message"
                />
                <select
                  className="w-full border px-3 py-2 rounded mb-4"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="order">Order</option>
                  <option value="info">Info</option>
                  <option value="alert">Alert</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={handleEditSave}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ) : (
              <li key={n.id} className="border p-4 rounded shadow-sm bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-lg">{n.title}</strong>{" "}
                    <span className="text-sm text-pink-600 font-semibold capitalize">
                      ({n.type})
                    </span>
                    <p className="mt-1">{n.message}</p>
                    <small className="text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      onClick={() => handleEditStart(n)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(n.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>
      </main>
    </div>
  );
}
