"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NuevoProducto() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("Verduras");
  const [tipo, setTipo] = useState("kg");
  const [emoji, setEmoji] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardarProducto = async () => {
    if (!nombre.trim()) {
      alert("Ingresá el nombre del producto.");
      return;
    }

    if (!precio || Number(precio) <= 0) {
      alert("Ingresá un precio válido.");
      return;
    }

    setGuardando(true);

    let imagenUrl: string | null = null;

    if (foto) {
      const extension = foto.name.split(".").pop();

      const nombreArchivo = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`;

      const { error: errorFoto } = await supabase.storage
        .from("productos")
        .upload(nombreArchivo, foto);

      if (errorFoto) {
        setGuardando(false);
        alert("Error al subir la foto: " + errorFoto.message);
        return;
      }

      const { data: imagenPublica } = supabase.storage
        .from("productos")
        .getPublicUrl(nombreArchivo);

      imagenUrl = imagenPublica.publicUrl;
    }

    const { error } = await supabase.from("productos").insert({
      nombre: nombre.trim(),
      precio: Number(precio),
      categoria,
      tipo,
      emoji: emoji.trim() || "🥬",
      imagen: imagenUrl,
      disponible,
      destacado,
    });

    setGuardando(false);

    if (error) {
      alert("Error al crear el producto: " + error.message);
      return;
    }

    alert("Producto creado ✅");
    window.location.href = "/admin/productos";
  };

  const estiloInput =
    "w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 mb-4 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700";

  const estiloLabel =
    "block font-semibold text-sm text-gray-800";

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto">

        <button
          onClick={() => (window.location.href = "/admin/productos")}
          className="mb-4 text-green-800 font-bold hover:underline"
        >
          ← Volver a productos
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <h1 className="text-2xl font-bold text-gray-900">
            Nuevo producto
          </h1>

          <p className="text-gray-600 mb-6">
            Verdulería La Reina 👑
          </p>

          {/* NOMBRE */}

          <label className={estiloLabel}>
            Nombre
          </label>

          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Coco"
            className={estiloInput}
          />

          {/* PRECIO */}

          <label className={estiloLabel}>
            Precio
          </label>

          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej: 3500"
            className={estiloInput}
          />

          {/* CATEGORÍA */}

          <label className={estiloLabel}>
            Categoría
          </label>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={estiloInput}
          >
            <option value="Frutas">Frutas</option>
            <option value="Verduras">Verduras</option>
            <option value="Otros">Otros</option>
          </select>

          {/* TIPO DE VENTA */}

          <label className={estiloLabel}>
            Venta por
          </label>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={estiloInput}
          >
            <option value="kg">Kilogramo</option>
            <option value="unidad">Unidad</option>
            <option value="atado">Atado</option>
            <option value="bandeja">Bandeja</option>
            <option value="rama">Rama</option>
            <option value="manojo">Manojo</option>
            <option value="bolsa">Bolsa</option>
          </select>

          {/* EMOJI */}

          <label className={estiloLabel}>
            Emoji
          </label>

          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Ej: 🥥"
            className={estiloInput}
          />

          {/* FOTO */}

          <label className={estiloLabel}>
            Foto del producto
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFoto(e.target.files?.[0] || null)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 mb-2 bg-white text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-green-100 file:px-4 file:py-2 file:font-semibold file:text-green-900"
          />

          {foto && (
            <p className="text-sm font-medium text-green-800 mb-4">
              📷 Foto seleccionada: {foto.name}
            </p>
          )}

          {/* OPCIONES */}

          <div className="border border-gray-300 rounded-xl p-4 space-y-4 mt-4 bg-gray-50">

            <label className="flex items-center gap-3 text-gray-900 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={disponible}
                onChange={(e) =>
                  setDisponible(e.target.checked)
                }
                className="w-5 h-5 accent-green-700"
              />

              Disponible en la tienda
            </label>

            <label className="flex items-center gap-3 text-gray-900 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={destacado}
                onChange={(e) =>
                  setDestacado(e.target.checked)
                }
                className="w-5 h-5 accent-green-700"
              />

              ⭐ Producto destacado
            </label>

          </div>

          {/* BOTÓN */}

          <button
            onClick={guardarProducto}
            disabled={guardando}
            className="mt-6 w-full bg-green-800 hover:bg-green-900 text-white rounded-xl py-3 font-bold disabled:opacity-50"
          >
            {guardando
              ? "Guardando..."
              : "Crear producto"}
          </button>

        </div>
      </div>
    </main>
  );
}