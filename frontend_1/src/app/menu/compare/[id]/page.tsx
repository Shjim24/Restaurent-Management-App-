"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Menu, X } from "lucide-react";
import Cookies from "js-cookie";

interface MenuItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  photo_url?: string;
  is_available?: boolean;
  dietary_tags?: string[];
}

interface ComparisonItem {
  name: string;
  price: number;
  restaurant_name: string;
  source_url: string;
}

const navLinks = [
  { path: "admin", label: "Admin" },
  { path: "menu", label: "Menu" },
  { path: "reservations", label: "Reservations" },
  { path: "staff-schedules", label: "Staff Schedules" },
  { path: "inventory", label: "Inventory" },
  { path: "notifications", label: "Notifications" },
];

export default function ComparePage() {
  const { id } = useParams();
  const router = useRouter();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
  const [updatedPrice, setUpdatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // Toggle mobile menu
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Check login status on mount
  useEffect(() => {
    const token = Cookies.get("token");
    setLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!id) return;

    async function init() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/menu-items/${id}`);
        if (!res.ok) throw new Error("Failed to fetch menu item");
        const data: MenuItem = await res.json();
        setMenuItem(data);
        setUpdatedPrice(data.price);

        const compRes = await fetch(`/api/compare-menu?name=${encodeURIComponent(data.name)}`);
        if (!compRes.ok) throw new Error("Failed to fetch comparison data");
        const compData: ComparisonItem[] = await compRes.json();
        setComparisonData(compData);
      } catch (err) {
        console.error(err);
        toast.error((err as Error).message || "Error loading data");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id]);

  // Logout handler
  const handleLogout = () => {
    Cookies.remove("token");
    setLoggedIn(false);
    router.push("/auth/login");
  };

  const handlePriceUpdate = async () => {
    if (!menuItem || updatedPrice === null) return;

    try {
      const response = await fetch(`http://localhost:3001/menu-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: updatedPrice }),
      });
      if (!response.ok) throw new Error("Failed to update price.");
      toast.success("Price updated successfully!");
      const refreshed = await fetch(`http://localhost:3001/menu-items/${id}`);
      const data: MenuItem = await refreshed.json();
      setMenuItem(data);
      setUpdatedPrice(data.price);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Error updating price.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (!menuItem)
    return <div className="text-gray-600 italic">Menu item not found.</div>;

  return (
    <div className="bg-gradient-to-br from-pink-100 to-orange-100 min-h-screen text-gray-800 pt-28 px-6 pb-10">
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

      {/* Page Content */}
      <h1 className="text-3xl font-extrabold mb-6 text-pink-600">
        Price Comparison
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: our menu item */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-pink-600">{menuItem.name}</h2>
          {menuItem.photo_url && (
            <img
              src={`/images/${menuItem.photo_url}`}
              alt={menuItem.name}
              className="w-40 h-40 object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-gray-700 mb-2">{menuItem.description}</p>
          <p className="mb-2">
            Current Price: <span className="font-semibold">৳{menuItem.price}</span>
          </p>
          <div className="mb-4 flex gap-2">
            <input
              type="number"
              value={updatedPrice ?? ""}
              onChange={(e) => setUpdatedPrice(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 w-32 focus:outline-pink-400"
            />
            <button
              onClick={handlePriceUpdate}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded shadow transition"
            >
              Update Price
            </button>
          </div>
          <p>
            Category: <span className="font-semibold">{menuItem.category || "N/A"}</span>
          </p>
          <p>
            Available: <span className="font-semibold">{menuItem.is_available ? "Yes" : "No"}</span>
          </p>
          <p>
            Tags:{" "}
            <span className="font-semibold">{menuItem.dietary_tags?.join(", ") || "None"}</span>
          </p>
        </div>

        {/* Right: scraped comparison */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-pink-600">Competitor Prices</h2>
          {comparisonData.length === 0 ? (
            <p className="text-gray-600 italic">No similar items found.</p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <div className="grid gap-4">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p>
                      Restaurant:{" "}
                      <span className="font-semibold">{item.restaurant_name}</span>
                    </p>
                    <p>
                      Price:{" "}
                      <span className="font-semibold text-pink-600">৳{item.price}</span>
                    </p>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:underline text-sm"
                    >
                      View Source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
