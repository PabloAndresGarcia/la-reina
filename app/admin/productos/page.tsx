"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  categoria: string;
  disponible: boolean;
  destacado: boolean;
  descuento_cantidad: boolean;
  imagen: string | null;
};

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState<number | null>(null);

  // NUEVO: controla qué producto está desplegado.
  // null = todos cerrados. Solo puede haber uno abierto a la vez.
  const [productoAbierto, setProductoAbierto] = useState<number | null>(null);

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
    const verificarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin";
        return;
      }

      cargarProductos();
    };

    verificarSesion();
  }, []);

  const actualizarProducto = (
    id: number,
    campo: keyof Producto,
    valor: string | number | boolean | null
  ) => {
    setProductos((actuales) =>
      actuales.map((producto) =>
        producto.id === id ? { ...producto, [campo]: valor } : producto
      )
    );
  };

  const eliminarFotoDeStorage = async (url: string | null) => {
    if (!url) return;

    try {
      const marcador = "/storage/v1/object/public/productos/";
      const posicion = url.indexOf(marcador);

      if (posicion === -1) return;

      const rutaArchivo = decodeURIComponent(
        url.substring(posicion + marcador.length)
      );

      const { error } = await supabase.storage
        .from("productos")
        .remove([rutaArchivo]);

      if (error) {
        console.error("Error eliminando foto vieja:", error);
      }
    } catch (error) {
      console.error("Error procesando foto vieja:", error);
    }
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
        descuento_cantidad: producto.descuento_cantidad,
        imagen: producto.imagen,
      })
      .eq("id", producto.id);

    setGuardando(null);

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    alert("Producto guardado ✅");
  };

  const subirFoto = async (producto: Producto, archivo: File) => {
    setSubiendoFoto(producto.id);

    let archivoOptimizado: File;

    try {
      archivoOptimizado = await imageCompression(archivo, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      setSubiendoFoto(null);
      alert("No se pudo procesar la imagen.");
      return;
    }

    const extension = "webp";
    const nombreArchivo = `${producto.id}-${Date.now()}.${extension}`;
    const rutaArchivo = `productos/${nombreArchivo}`;

    const { error: errorSubida } = await supabase.storage
      .from("productos")
      .upload(rutaArchivo, archivoOptimizado);

    if (errorSubida) {
      setSubiendoFoto(null);
      alert("Error al subir la foto: " + errorSubida.message);
      return;
    }

    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(rutaArchivo);

    const nuevaUrl = data.publicUrl;

    const { error: errorGuardar } = await supabase
      .from("productos")
      .update({
        imagen: nuevaUrl,
      })
      .eq("id", producto.id);

    setSubiendoFoto(null);

    if (errorGuardar) {
      alert(
        "La foto se subió pero hubo un error al guardarla: " +
          errorGuardar.message
      );
      return;
    }

    if (producto.imagen && producto.imagen !== nuevaUrl) {
      await eliminarFotoDeStorage(producto.imagen);
    }

    actualizarProducto(producto.id, "imagen", nuevaUrl);

    alert("Foto actualizada 📷✅");
  };

  const quitarFoto = async (producto: Producto) => {
    const confirmar = window.confirm(
      `¿Querés quitar la foto de "${producto.nombre}"?`
    );

    if (!confirmar) return;

    setSubiendoFoto(producto.id);

    const fotoAnterior = producto.imagen;

    const { error } = await supabase
      .from("productos")
      .update({
        imagen: null,
      })
      .eq("id", producto.id);

    if (error) {
      setSubiendoFoto(null);
      alert("Error al quitar la foto: " + error.message);
      return;
    }

    if (fotoAnterior) {
      await eliminarFotoDeStorage(fotoAnterior);
    }

    actualizarProducto(producto.id, "imagen", null);

    setSubiendoFoto(null);

    alert("Foto quitada y eliminada ✅");
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

    if (productoAbierto === producto.id) {
      setProductoAbierto(null);
    }

    alert(`${producto.nombre} eliminado ✅`);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatoPrecio = (precio: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(precio);

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
            <h1 className="text-3xl font-black text-gray-900">Productos</h1>
            <p className="text-gray-600 font-medium">
              Administración · La Reina 👑
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => (window.location.href = "/admin/productos/nuevo")}
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

        {/* BUSCADOR */}
        <div className="mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔎 Buscar producto..."
            className="w-full bg-white text-gray-900 border border-gray-400 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700"
          />
        </div>

        <p className="text-sm text-gray-600 font-medium mb-4">
          {productosFiltrados.length} productos · Tocá uno para editarlo
        </p>

        {/* PRODUCTOS PLEGABLES */}
        <div className="space-y-2">
          {productosFiltrados.map((producto) => {
            const abierto = productoAbierto === producto.id;

            return (
              <div
                key={producto.id}
                className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden"
              >
                {/* CABECERA COMPACTA - SIEMPRE VISIBLE */}
                <button
                  type="button"
                  onClick={() =>
                    setProductoAbierto(abierto ? null : producto.id)
                  }
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 active:bg-gray-100"
                  aria-expanded={abierto}
                >
                  {/* Miniatura */}
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt=""
                      className="w-12 h-12 shrink-0 object-cover rounded-xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 shrink-0 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-xl">
                      🥬
                    </div>
                  )}

                  {/* Nombre + precio */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 truncate">
                        {producto.nombre}
                      </p>

                      {producto.destacado && (
                        <span
                          className="shrink-0 text-sm"
                          title="Producto destacado"
                        >
                          ⭐
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold text-green-800">
                        {formatoPrecio(producto.precio)}
                      </span>

                      <span className="text-sm text-gray-500">
                        · {producto.tipo}
                      </span>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          producto.disponible
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {producto.disponible ? "Disponible" : "No disponible"}
                      </span>
                    </div>
                  </div>

                  {/* Flecha */}
                  <div className="shrink-0 text-2xl font-bold text-gray-500">
                    {abierto ? "▲" : "▼"}
                  </div>
                </button>

                {/* CONTENIDO DESPLEGABLE */}
                {abierto && (
                  <div className="border-t border-gray-200 p-4">
                    {/* FOTO */}
                    <div className="mb-4">
                      <p className="text-sm font-bold text-gray-800 mb-2">
                        Foto del producto
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-xl border border-gray-300"
                          />
                        ) : (
                          <div className="w-full sm:w-32 h-32 bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 font-semibold">
                            Sin foto
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold cursor-pointer">
                            {subiendoFoto === producto.id
                              ? "Subiendo..."
                              : producto.imagen
                              ? "📷 Cambiar foto"
                              : "📷 Agregar foto"}

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={subiendoFoto === producto.id}
                              onChange={(e) => {
                                const archivo = e.target.files?.[0];

                                if (archivo) {
                                  subirFoto(producto, archivo);
                                }

                                e.target.value = "";
                              }}
                            />
                          </label>

                          {producto.imagen && (
                            <button
                              onClick={() => quitarFoto(producto)}
                              disabled={subiendoFoto === producto.id}
                              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50"
                            >
                              🖼️ Quitar foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

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
                          value={producto.precio === 0 ? "" : producto.precio}
                          onChange={(e) =>
                            actualizarProducto(
                              producto.id,
                              "precio",
                              e.target.value === "" ? 0 : Number(e.target.value)
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

                    {/* OPCIONES */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-5 bg-gray-50 border border-gray-200 rounded-xl p-3">
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

                      <label className="flex items-center gap-2 text-gray-900 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={producto.descuento_cantidad ?? false}
                          onChange={(e) =>
                            actualizarProducto(
                              producto.id,
                              "descuento_cantidad",
                              e.target.checked
                            )
                          }
                          className="w-5 h-5 accent-green-700"
                        />
                        💰 Descuento por cantidad
                      </label>
                    </div>

                    {/* BOTONES */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
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

                    {/* CERRAR TARJETA */}
                    <button
                      type="button"
                      onClick={() => setProductoAbierto(null)}
                      className="mt-3 w-full border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
                    >
                      ▲ Cerrar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="bg-white border border-gray-300 rounded-2xl p-6 text-center text-gray-600 font-semibold">
            No encontré productos con ese nombre.
          </div>
        )}
      </div>
    </main>
  );
}
