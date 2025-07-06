"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Check login status by presence of token cookie
  useEffect(() => {
    const token = Cookies.get("token");
    setLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    setLoggedIn(false);
    router.push("/auth/login");
  };

  // Navigation links adjust based on login state
  const navLinks = [
    { path: "admin", label: "Admin" },
    { path: "menu", label: "Menu" },
    { path: "reservations", label: "Reservations" },
    { path: "staff-schedules", label: "Staff Schedules" },
    { path: "inventory", label: "Inventory" },
    { path: "notifications", label: "Notifications" },
  ];

  // Your specials & testimonials data
  const specials = [
    {
      title: "Chicken Burger",
      desc: "Juicy grilled chicken patty with fresh veggies",
      img: "/images/Cajun-Chicken-Burger-2.jpg",
    },
    {
      title: "Pizza",
      desc: "Pizza With Extra Cheese.",
      img: "/images/Pepperoni-Pizza-Recipe-Sip-Bite-Go.jpeg",
    },
    {
      title: "Pasta",
      desc: "Italian Pasta.",
      img: "/images/Pasta.jpeg",
    },
    {
      title: "Plain Paratha",
      desc: "With Fresh Olive Oil.",
      img: "/images/Triangle-Plain-Paratha-With-Yogurt-Pickle-.jpeg",
    },
    {
      title: "South Indian Dosa",
      desc: "With Fresh Olive Oil.",
      img: "/images/Dosa.jpeg",
    },
  ];

  const testimonials = [
    {
      name: "Suvi",
      text: "Amazing food and great ambience!",
      avatar: "/images/alice.jpeg",
    },
    {
      name: "Nazat",
      text: "Best restaurant experience ever.",
      avatar: "/images/Bob.jpg",
    },
    {
      name: "Akib",
      text: "Delicious dishes and friendly staff.",
      avatar: "/images/Charlie.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 text-gray-900 font-sans">
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

      {/* Hero section */}
      <section className="relative w-full h-[80vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/images/hero-food.jpg"
          alt="Delicious food"
          fill
          style={{ objectFit: "cover" }}
          priority
          className="brightness-75"
        />
        <div className="absolute inset-0 flex flex-col justify-center max-w-5xl mx-auto px-6 md:px-16 h-full text-white">
          <h1 className="text-3xl md:text-4xl font-semibold leading-snug max-w-2xl mb-4 drop-shadow-lg">
            Delicious meals delivered fast
          </h1>
          <p className="text-lg md:text-xl max-w-xl mb-6 text-pink-100 drop-shadow-md">
            Freshly prepared food from your favorite restaurants .. right at your doorstep.
          </p>
          <Link href="/menu">
            <button className="bg-pink-600 hover:bg-pink-700 transition rounded-full px-8 py-3 font-medium text-lg drop-shadow-md shadow-pink-400/70">
              Explore Menu
            </button>
          </Link>
        </div>
      </section>

      {/* Chef’s specials */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-4xl font-extrabold text-pink-600 text-center mb-16">Chef’s Specials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {specials.map(({ title, desc, img }, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
            >
              <Image
                src={img}
                alt={title}
                width={400}
                height={300}
                className="object-cover w-full h-56"
              />
              <div className="p-6">
                <h3 className="font-semibold text-2xl mb-2">{title}</h3>
                <p className="text-gray-700 text-base">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-pink-50 py-20">
        <h2 className="text-4xl font-extrabold text-pink-600 text-center mb-16">What Our Customers Say</h2>
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-10">
          {testimonials.map(({ name, text, avatar }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-md text-center"
            >
              <Image
                src={avatar}
                alt={name}
                width={80}
                height={80}
                className="rounded-full mx-auto mb-6"
              />
              <p className="italic text-gray-700 mb-4">“{text}”</p>
              <h4 className="font-semibold text-lg">{name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="max-w-3xl mx-auto px-8 py-16 text-center bg-gradient-to-r from-pink-300 to-orange-300 rounded-3xl shadow-lg mt-20">
        <h2 className="text-3xl font-extrabold mb-4 text-white">Stay Updated!</h2>
        <p className="mb-8 text-white text-lg">
          Subscribe to our newsletter for exclusive deals and tasty updates.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <input
            id="emailInput"
            type="email"
            placeholder="Enter your email"
            className="flex-grow px-6 py-4 rounded-full border-0 focus:outline-none text-lg"
          />
          <button
            onClick={async () => {
              const input = document.getElementById(
                "emailInput"
              ) as HTMLInputElement;
              if (!input) return;
              const email = input.value.trim();
              const valid = /^[\w.-]+@[\w.-]+\.\w+$/.test(email);
              if (!valid) return alert("Please enter a valid email.");

              try {
                await fetch("/api/save-email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                setShowModal(true);
                input.value = "";
              } catch {
                alert("Error saving email.");
              }
            }}
            className="bg-white text-pink-600 font-bold px-10 py-4 rounded-full hover:bg-pink-50 transition text-lg"
          >
            Subscribe
          </button>
        </div>
      </section>

      {/* Subscription modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-10 rounded-3xl shadow-xl max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-extrabold text-pink-600 mb-4">🎉 Subscribed!</h2>
            <p className="mb-6 text-gray-700">Thanks for joining our foodie community.</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 py-16 mt-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-16 text-gray-700">
          <div>
            <h4 className="text-pink-600 font-extrabold text-lg mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-pink-600 cursor-pointer">About Us</li>
              <li className="hover:text-pink-600 cursor-pointer">Careers</li>
              <li className="hover:text-pink-600 cursor-pointer">Blog</li>
              <li className="hover:text-pink-600 cursor-pointer">Press</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-600 font-extrabold text-lg mb-6">Services</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-pink-600 cursor-pointer">Order Food</li>
              <li className="hover:text-pink-600 cursor-pointer">Delivery Info</li>
              <li className="hover:text-pink-600 cursor-pointer">Catering</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-600 font-extrabold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-pink-600 cursor-pointer">Help Center</li>
              <li className="hover:text-pink-600 cursor-pointer">Cancellation</li>
              <li className="hover:text-pink-600 cursor-pointer">FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-600 font-extrabold text-lg mb-6">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-pink-600 cursor-pointer">Terms of Use</li>
              <li className="hover:text-pink-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-pink-600 cursor-pointer">Cookie Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-600 font-extrabold text-lg mb-6">Contact</h4>
            <p className="text-sm">📧 sakibhasanzim@gmail.com</p>
            <p className="mt-2 text-sm">📞 +880-1796962184</p>
            <p className="mt-4 text-xs text-gray-400">&copy; 2025 FOODIE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
