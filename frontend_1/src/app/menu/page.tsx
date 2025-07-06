"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Define the type for each menu item
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

// Image options for the dropdown
const imageOptions = [

  "20220211142754-margherita-9920_5a73220e-4a1a-4d33-b38f-26e98e3cd986.jpg",
  "Bottled Water.jpeg", "Cajun-Chicken-Burger-2.jpg",
  "Chicken-Alfredo-Pasta-1-1.webp", "Dosa.jpeg", "Easy-grilled-chicken-sandwich.jpg",
  "Iced Tea.jpeg", "Pasta.jpeg", "Pepperoni-Pizza-Recipe-Sip-Bite-Go.jpeg",
  "Soft Drinks (Coke, Pepsi, Sprite).jpeg", "Tiramisu.jpeg",
  "Triangle-Plain-Paratha-With-Yogurt-Pickle-.jpeg", "brownie.jpeg",
  "butter chicken.jpeg", "chicken biriani.jpeg", "chole bhature.jpeg",
  "cold coffee.jpeg", "dal tadka.jpeg", "fish chips.jpeg", "french.jpeg",
  "fresh lime soda.jpeg", "fried rice.jpeg", "garden freash salad.jpeg",
  "garlic bread.jpeg", "greek salad.jpeg", "gulab jamoon.jpeg", "hero-food.jpeg",
  "hero-food.jpg", "ice cream sundae.jpeg", "mango lassi.jpeg", "mozzala.jpeg",
  "naan roti.jpeg", "nachos.jpeg", "paneer tikka.jpeg", "paneer.jpeg", "peparoni.jpeg",
  "quinoa bowl.jpeg", "real-simple-mushroom-black-bean-burgers-recipe-0c365277d4294e6db2daa3353....jpeg",
  "rolls.jpeg", "rosomalai.jpeg", "salad.jpeg", "samosa.webp", "soup.jpeg",
  "strawberry.jpeg", "tandori.jpeg", "tikka salad.jpeg", "wings.jpeg",

];


const navLinks = [
  { path: "admin", label: "Admin" },
  { path: "menu", label: "Menu" },
  { path: "reservations", label: "Reservations" },
  { path: "staff-schedules", label: "Staff Schedules" },
  { path: "inventory", label: "Inventory" },
  { path: "notifications", label: "Notifications" },
];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<Omit<Partial<MenuItem>, "dietary_tags"> & { dietary_tags?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMenuItems();
    const token = Cookies.get("token");
    setLoggedIn(!!token);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Fetch menu items from backend
  async function fetchMenuItems() {
    try {
      const res = await fetch("http://localhost:3001/menu-items");
      if (!res.ok) throw new Error("Failed to fetch menu items");
      const data = await res.json();
      setMenuItems(data);
    } catch (error) {
      toast.error("Failed to load menu items");
    }
  }

  // Form field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit form to create or update menu item
  const handleSubmit = async () => {
    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `http://localhost:3001/menu-items/${editingId}`
      : "http://localhost:3001/menu-items";

    const payload: MenuItem = {
      name: form.name || "",
      description: form.description || "",
      price: Number(form.price) || 0,
      category: form.category || "",
      photo_url: form.photo_url || "",
      is_available: form.is_available ?? true,
      dietary_tags: form.dietary_tags
        ? form.dietary_tags.split(",").map((tag) => tag.trim())
        : [],
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Error saving menu item");
      await fetchMenuItems();
      setForm({});
      setEditingId(null);
      toast.success(`Menu item ${editingId ? "updated" : "created"} successfully!`);
    } catch {
      toast.error("Error saving menu item.");
    }
  };

  // Load menu item data into form for editing
  const handleEdit = (item: MenuItem) => {
    setForm({
      ...item,
      dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags.join(", ") : "",
    });
    setEditingId(item.id || null);
  };

  // Delete menu item
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/menu-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchMenuItems();
      toast.success("Menu item deleted successfully.");
    } catch {
      toast.error("Failed to delete menu item.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    Cookies.remove("token");
    setLoggedIn(false);
    router.push("/auth/login");
  };

  return (
    <div className="bg-gradient-to-br from-pink-100 to-orange-100 min-h-screen text-gray-800">
      <Toaster position="top-right" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-pink-600 tracking-wide">
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
      <main className="pt-28 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-pink-600">Menu Management</h1>

        {/* Form */}
        <div className="grid gap-4 mb-10 bg-white p-6 rounded-lg shadow-md">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-pink-400"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 resize-none focus:outline-pink-400"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-pink-400"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-pink-400"
          />
          <select
            name="photo_url"
            value={form.photo_url || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-pink-400"
          >
            <option value="">Select Image</option>
            {imageOptions.map((img, index) => (
              <option key={index} value={img}>
                {img}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="dietary_tags"
            placeholder="Dietary Tags (comma separated)"
            value={form.dietary_tags || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-pink-400"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_available"
              checked={form.is_available ?? true}
              onChange={handleChange}
              className="accent-pink-500"
            />
            Available
          </label>
          <button
            onClick={handleSubmit}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-2 rounded shadow transition"
          >
            {editingId ? "Update" : "Create"} Menu Item
          </button>
        </div>

        {/* Menu List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-pink-600">Menu Items</h2>
          {menuItems.length === 0 ? (
            <p className="text-gray-600 italic">No menu items found.</p>
          ) : (
            <ul className="space-y-6">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  className="bg-white rounded-lg shadow p-4 flex gap-6 items-center"
                >
                  {item.photo_url && (
                    <img
                      src={`/images/${item.photo_url}`}
                      alt={item.name}
                      className="w-28 h-28 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-xl font-bold">{item.name}</p>
                    <p className="text-gray-700">{item.description}</p>
                    <p className="mt-1">
                      Price: <span className="font-semibold">${item.price}</span>
                    </p>
                    <p>
                      Category: <span className="font-semibold">{item.category}</span>
                    </p>
                    <p>
                      Available:{" "}
                      <span className="font-semibold">{item.is_available ? "Yes" : "No"}</span>
                    </p>
                    <p>
                      Tags: <span className="font-semibold">{item.dietary_tags?.join(", ")}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded shadow transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition"
                    >
                      Delete
                    </button>
                    <Link href={`/menu/compare/${item.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition">
                        Compare
                      </button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
