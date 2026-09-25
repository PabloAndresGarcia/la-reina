"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async () => {
    setError("");

    if (!email || !password) {
      setError("Ingresá tu email y contraseña.");
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setCargando(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    window.location.href = "/admin/productos";
  };

  return (
    <main className="min-h-screen bg-[#f7f7f2] flex items-center justify-center p-4 text-gray-900">
      <div className="bg-white border border-gray-300 shadow-md rounded-3xl p-6 w-full max-w-md">

        <div className="flex justify-center mb-4">
          <Image
            src="/logo-la-reina.jpg.jpeg"
            alt="Verdulería La Reina"
            width={130}
            height={130}
            className="h-auto"
          />
        </div>

        <h1 className="text-2xl font-black text-gray-900 text-center">
          Administración
        </h1>

        <p className="text-gray-600 font-medium text-center mt-1 mb-6">
          Verdulería La Reina 👑
        </p>

        <label className="block text-sm font-bold text-gray-900 mb-1">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full bg-white text-gray-900 placeholder:text-gray-500 border border-gray-400 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
        />

        <label className="block text-sm font-bold text-gray-900 mb-1">
          Contraseña
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") iniciarSesion();
          }}
          placeholder="••••••••"
          className="w-full bg-white text-gray-900 placeholder:text-gray-500 border border-gray-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
        />

        {error && (
          <p className="text-red-700 font-semibold text-sm mt-3">
            {error}
          </p>
        )}

        <button
          onClick={iniciarSesion}
          disabled={cargando}
          className="mt-6 w-full bg-green-800 hover:bg-green-900 text-white rounded-xl py-3 font-bold disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

      </div>
    </main>
  );
}