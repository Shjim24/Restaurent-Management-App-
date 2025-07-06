"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function ReservationsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [partySize, setPartySize] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const router = useRouter();

  const navLinks = [
    { path: "admin", label: "Admin" },
    { path: "menu", label: "Menu" },
    { path: "reservations", label: "Reservations" },
    { path: "staff-schedules", label: "Staff Schedules" },
    { path: "inventory", label: "Inventory" },
    { path: "notifications", label: "Notifications" },
  ];

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const token = Cookies.get("token");
    setLoggedIn(!!token);
    fetchReservations();
  }, []);

  const fetchReservations = () => {
    fetch("http://localhost:3001/reservations")
      .then((res) => res.json())
      .then(setReservations)
      .catch(console.error);
  };

  const handleCreate = async () => {
    try {
      await fetch("http://localhost:3001/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_size: parseInt(partySize),
          reservation_time: reservationTime,
          table_number: parseInt(tableNumber),
          special_requests: specialRequests,
        }),
      });
      toast.success("Reservation created!");
      fetchReservations();
      setPartySize("");
      setReservationTime("");
      setTableNumber("");
      setSpecialRequests("");
    } catch {
      toast.error("Failed to create reservation");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/reservations/${id}`, {
        method: "DELETE",
      });
      toast.success("Reservation deleted!");
      fetchReservations();
    } catch {
      toast.error("Failed to delete reservation");
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
          onClick={toggleMenu}
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
      <main className="pt-32 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-pink-600">
          Reservation Management
        </h1>

        {/* Reservation creation form */}
        <div className="mb-8 space-y-4 bg-white rounded-xl shadow p-6">
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            placeholder="Party Size"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            placeholder="Reservation Time"
            value={reservationTime}
            onChange={(e) => setReservationTime(e.target.value)}
          />
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Special Requests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
          >
            Create Reservation
          </button>
        </div>

        {/* List of current reservations */}
        <h2 className="text-2xl font-semibold mb-4">Current Reservations</h2>
        <ul className="space-y-4">
          {reservations.map((r: any) => (
            <li key={r.id} className="bg-white p-4 rounded-xl shadow-sm">
              <p>
                <strong>Party Size:</strong> {r.party_size}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(r.reservation_time).toLocaleString()}
              </p>
              <p>
                <strong>Table:</strong> {r.table_number}
              </p>
              <p>
                <strong>Requests:</strong> {r.special_requests}
              </p>
              <button
                onClick={() => handleDelete(r.id)}
                className="mt-2 text-sm bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
