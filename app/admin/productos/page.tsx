"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  categoria: string;
  disponible: boolean;
  destacado: boolean;
};

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("ERROR SUPABASE:", error);
      alert("Error cargando productos: " + error.message);
      setCargando(false);
      return;
    }

    setProductos(data ?? []);
    setCargando(false);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const actualizarProducto = (
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean
  ) => {
    setProductos((actuales) =>
      actuales.map((producto) =>
        producto.id === id
          ? { ...producto, [campo]: valor }
          : producto
      )
    );
  };

  const guardarProducto = async (producto: Producto) => {
    setGuardando(producto.id);

    const { error } = await supabase
      .from("productos")
      .update({
        nombre: producto.nombre,
        precio: producto.precio,
        tipo: producto.tipo,
        categoria: producto.categoria,
        disponible: producto.disponible,
        destacado: producto.destacado,
      })
      .eq("id", producto.id);

    setGuardando(null);

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    alert("Producto guardado ✅");
  };

  const eliminarProducto = async (producto: Producto) => {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    setEliminando(producto.id);

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", producto.id);

    setEliminando(null);

    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }

    setProductos((actuales) =>
      actuales.filter((item) => item.id !== producto.id)
    );

    alert(`${producto.nombre} eliminado ✅`);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
        <p className="font-semibold">Cargando productos... 👑</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-5xl mx-auto p-4">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Productos
            </h1>

            <p className="text-gray-600 font-medium">
              Administración · La Reina 👑
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                (window.location.href = "/admin/productos/nuevo")
              }
              className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-xl font-bold"
            >
              + Nuevo producto
            </button>

            <button
              onClick={cerrarSesion}
              className="border border-gray-400 bg-white text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="space-y-4">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl border border-gray-300 p-4 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-4">

                {/* NOMBRE */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Producto
                  </label>

                  <input
                    value={producto.nombre}
                    onChange={(e) =>
                      actualizarProducto(
                        producto.id,
                        "nombre",
                        e.target.value
                      )
                    }
                    className="w-full bg-white text-gray-900 border border-gray-400 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
                  />
                </div>

                {/* PRECIO */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">
                    Precio
                  </label>

                  <input
                    type="number"
                    value={producto.precio}
                    onChange={(e) =>
                      actualizarProducto(
                        producto.id,
                        "precio",
                        Number(e.target.value)
                      )
                    }
                    className="w-full bg-white text-gray-900 border border-gray-400 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
                  />
                </div>

              </div>

              {/* INFORMACIÓN */}
              <div className="mt-3 text-sm text-gray-700 font-medium">
                {producto.categoria} · Venta por {producto.tipo}
              </div>

              {/* CHECKBOX */}
              <div className="mt-4 flex flex-wrap gap-5 bg-gray-50 border border-gray-200 rounded-xl p-3">

                <label className="flex items-center gap-2 text-gray-900 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={producto.disponible}
                    onChange={(e) =>
                      actualizarProducto(
                        producto.id,
                        "disponible",
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 accent-green-700"
                  />

                  Disponible
                </label>

                <label className="flex items-center gap-2 text-gray-900 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={producto.destacado}
                    onChange={(e) =>
                      actualizarProducto(
                        producto.id,
                        "destacado",
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 accent-green-700"
                  />

                  ⭐ Destacado
                </label>

              </div>

              {/* BOTONES */}
              <div className="mt-4 flex gap-2">

                <button
                  onClick={() => guardarProducto(producto)}
                  disabled={guardando === producto.id}
                  className="flex-1 bg-green-800 hover:bg-green-900 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {guardando === producto.id
                    ? "Guardando..."
                    : "💾 Guardar"}
                </button>

                <button
                  onClick={() => eliminarProducto(producto)}
                  disabled={eliminando === producto.id}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50"
                >
                  {eliminando === producto.id
                    ? "Eliminando..."
                    : "🗑️ Eliminar"}
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}