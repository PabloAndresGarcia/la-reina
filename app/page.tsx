"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Categoria = "Frutas" | "Verduras" | "Otros";
type TipoVenta = "kg" | "unidad" | "atado" | "bandeja" | "rama" | "manojo" | "bolsa";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  tipo: TipoVenta;
  categoria: Categoria;
  emoji: string | null;
  imagen: string | null;
  disponible: boolean;
  orden: number | null;
};

type ItemCarrito = {
  cantidad: number;
};



const huevos = [
  { id: "huevos-media", nombre: "½ docena", precio: 1500 },
  { id: "huevos-docena", nombre: "1 docena", precio: 2500 },
  { id: "huevos-maple", nombre: "1 maple", precio: 5500 },
];

const formatoPrecio = (precio: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);

export default function Home() {
const [productos, setProductos] = useState<Producto[]>([]);
const [cargandoProductos, setCargandoProductos] = useState(true);

  const [carrito, setCarrito] = useState<Record<number, ItemCarrito>>({});
  const [carritoHuevos, setCarritoHuevos] = useState<Record<string, number>>({});
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [entrega, setEntrega] = useState<"retiro" | "envio">("retiro");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("disponible", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error cargando productos:", error);
      setCargandoProductos(false);
      return;
    }

    setProductos((data ?? []) as Producto[]);
    setCargandoProductos(false);
  };

  cargarProductos();
}, []);
  
  const pasoProducto = (producto: Producto) => {
    return producto.tipo === "kg" ? 0.5 : 1;
  };

  const agregar = (producto: Producto) => {
    const paso = pasoProducto(producto);

    setCarrito((actual) => ({
      ...actual,
      [producto.id]: {
        cantidad: (actual[producto.id]?.cantidad || 0) + paso,
      },
    }));
  };

  const quitar = (producto: Producto) => {
    const paso = pasoProducto(producto);

    setCarrito((actual) => {
      const nuevaCantidad =
        (actual[producto.id]?.cantidad || 0) - paso;

      const nuevo = { ...actual };

      if (nuevaCantidad <= 0) {
        delete nuevo[producto.id];
      } else {
        nuevo[producto.id] = { cantidad: nuevaCantidad };
      }

      return nuevo;
    });
  };

  const agregarHuevo = (id: string) => {
    setCarritoHuevos((actual) => ({
      ...actual,
      [id]: (actual[id] || 0) + 1,
    }));
  };

  const quitarHuevo = (id: string) => {
    setCarritoHuevos((actual) => {
      const nuevaCantidad = (actual[id] || 0) - 1;
      const nuevo = { ...actual };

      if (nuevaCantidad <= 0) {
        delete nuevo[id];
      } else {
        nuevo[id] = nuevaCantidad;
      }

      return nuevo;
    });
  };

  const productosVisibles = productos.filter((producto) => {
    const coincideCategoria =
      categoria === "Todos" || producto.categoria === categoria;

    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });

  const mostrarHuevos =
    (categoria === "Todos" || categoria === "Otros") &&
    "huevos".includes(busqueda.toLowerCase());

  const subtotalProductos = useMemo(() => {
    return productos.reduce((total, producto) => {
      const cantidad = carrito[producto.id]?.cantidad || 0;
      return total + producto.precio * cantidad;
    }, 0);
  }, [carrito]);

  const subtotalHuevos = useMemo(() => {
    return huevos.reduce((total, opcion) => {
      return total + opcion.precio * (carritoHuevos[opcion.id] || 0);
    }, 0);
  }, [carritoHuevos]);

  const subtotal = subtotalProductos + subtotalHuevos;
  const costoEnvio = entrega === "envio" ? 2000 : 0;
  const total = subtotal + costoEnvio;

  const cantidadItems =
    Object.keys(carrito).length +
    Object.keys(carritoHuevos).length;

  const textoCantidad = (producto: Producto, cantidad: number) => {
    if (producto.tipo === "kg") {
      if (cantidad < 1) return `${cantidad * 1000} g`;
      return `${cantidad.toString().replace(".", ",")} kg`;
    }

    return `${cantidad} ${producto.tipo}${cantidad !== 1 ? "s" : ""}`;
  };

  const enviarWhatsApp = () => {
  if (!nombre.trim()) {
    alert("Ingresá tu nombre para continuar.");
    return;
  }

  if (entrega === "envio" && !direccion.trim()) {
    alert("Ingresá la dirección de entrega.");
    return;
  }

  const lineasProductos = productos
    .filter((producto) => carrito[producto.id]?.cantidad)
    .map((producto) => {
      const cantidad = carrito[producto.id].cantidad;
      const importe = producto.precio * cantidad;

      return `• ${producto.nombre} — ${textoCantidad(
        producto,
        cantidad
      )} — ${formatoPrecio(importe)}`;
    });

  const lineasHuevos = huevos
    .filter((opcion) => carritoHuevos[opcion.id])
    .map((opcion) => {
      const cantidad = carritoHuevos[opcion.id];

      return `• Huevos — ${cantidad} × ${opcion.nombre} — ${formatoPrecio(
        opcion.precio * cantidad
      )}`;
    });

  const lineasPedido = [...lineasProductos, ...lineasHuevos].join("\n");

  const datosEntrega =
    entrega === "envio"
      ? `🚚 Envío a domicilio
📍 Dirección: ${direccion.trim()}
${referencia.trim() ? `📌 Referencia: ${referencia.trim()}` : ""}`
      : `🏪 Retiro en el local`;

  const mensaje = `👑 *NUEVO PEDIDO - LA REINA*

👤 *Cliente:* ${nombre.trim()}
${datosEntrega}

🛒 *PEDIDO*
${lineasPedido}

💰 *Subtotal:* ${formatoPrecio(subtotal)}
🚚 *Envío:* ${costoEnvio === 0 ? "GRATIS" : formatoPrecio(costoEnvio)}
💵 *TOTAL: ${formatoPrecio(total)}*
${
  observaciones.trim()
    ? `\n📝 *Observaciones:* ${observaciones.trim()}`
    : ""
}

¡Hola! Quisiera realizar este pedido.`;

  const telefono = "5493424288676";

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
};

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-gray-900">

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Image
            src="/logo-la-reina.jpg.jpeg"
            alt="Verdulería La Reina"
            width={140}
            height={140}
            priority
            className="w-24 md:w-32 h-auto"
          />

          <div className="text-right">
            <p className="text-xs text-gray-500">Pedidos online</p>
            <p className="font-bold text-green-800">La Reina 👑</p>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-8 pb-5">
        <p className="text-green-700 font-bold text-sm">
          VERDULERÍA LA REINA
        </p>

        <h1 className="text-3xl md:text-5xl font-bold">
          Armá tu pedido
        </h1>

        <p className="text-gray-600 mt-2">
          Elegí tus productos y nosotros los preparamos.
        </p>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔎 Buscar productos..."
          className="mt-6 w-full bg-white border rounded-2xl px-5 py-4 outline-none focus:border-green-700"
        />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-5 flex gap-2 overflow-x-auto">
        {["Todos", "Frutas", "Verduras", "Otros"].map((item) => (
          <button
            key={item}
            onClick={() => setCategoria(item)}
            className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap ${
              categoria === item
                ? "bg-green-800 text-white"
                : "bg-white border"
            }`}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-28">
        {cargandoProductos && (
  <div className="text-center py-10">
    <p className="text-gray-500 font-semibold">
      Cargando productos... 👑
    </p>
  </div>
)}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">

          {mostrarHuevos && (
            <article className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="h-28 bg-yellow-50 flex items-center justify-center text-5xl">
                🥚
              </div>

              <div className="p-3">
                <h2 className="font-bold">Huevos</h2>

                <div className="mt-3 space-y-2">
                  {huevos.map((opcion) => {
                    const cantidad = carritoHuevos[opcion.id] || 0;

                    return (
                      <div key={opcion.id} className="border rounded-xl p-2">
                        <div className="flex justify-between text-sm">
                          <span>{opcion.nombre}</span>
                          <strong>{formatoPrecio(opcion.precio)}</strong>
                        </div>

                        {cantidad === 0 ? (
                          <button
                            onClick={() => agregarHuevo(opcion.id)}
                            className="mt-2 w-full bg-green-100 text-green-900 rounded-lg py-1 font-bold"
                          >
                            + Agregar
                          </button>
                        ) : (
                          <div className="mt-2 flex justify-between items-center bg-green-800 text-white rounded-lg">
                            <button
                              onClick={() => quitarHuevo(opcion.id)}
                              className="px-3 py-1"
                            >
                              −
                            </button>

                            <strong>{cantidad}</strong>

                            <button
                              onClick={() => agregarHuevo(opcion.id)}
                              className="px-3 py-1"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          )}

          {productosVisibles.map((producto) => {
            const cantidad = carrito[producto.id]?.cantidad || 0;

            return (
              <article
                key={producto.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
              >
                <div className="h-28 md:h-36 bg-green-50 flex items-center justify-center text-5xl">
                  {producto.emoji || "🥬"}
                </div>

                <div className="p-3 md:p-4">
                  <h2 className="font-bold min-h-10">
                    {producto.nombre}
                  </h2>

                  <p className="text-green-800 font-bold">
                    {formatoPrecio(producto.precio)}
                  </p>

                  <p className="text-xs text-gray-500">
                    por {producto.tipo}
                  </p>

                  {cantidad === 0 ? (
                    <button
                      onClick={() => agregar(producto)}
                      className="mt-3 w-full bg-green-100 text-green-900 font-bold py-2 rounded-xl"
                    >
                      + Agregar
                    </button>
                  ) : (
                    <div className="mt-3">
                      <div className="flex justify-between items-center bg-green-800 text-white rounded-xl">
                        <button
                          onClick={() => quitar(producto)}
                          className="px-4 py-2 text-xl"
                        >
                          −
                        </button>

                        <strong>
                          {textoCantidad(producto, cantidad)}
                        </strong>

                        <button
                          onClick={() => agregar(producto)}
                          className="px-4 py-2 text-xl"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-center text-xs text-gray-500 mt-2">
                        {formatoPrecio(producto.precio * cantidad)}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {cantidadItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 md:left-auto md:right-6 md:w-96">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="w-full bg-green-800 text-white rounded-2xl px-5 py-4 shadow-xl flex justify-between"
          >
            <span className="font-bold">
              🛒 Ver pedido
            </span>

            <span className="font-bold">
              {formatoPrecio(subtotal)}
            </span>
          </button>
        </div>
      )}

      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/50 z-40 flex justify-end">

          <div className="bg-white w-full md:w-[450px] h-full overflow-y-auto p-5">

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Tu pedido 👑
              </h2>

              <button
                onClick={() => setCarritoAbierto(false)}
                className="text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">

              {productos.map((producto) => {
                const cantidad = carrito[producto.id]?.cantidad || 0;

                if (!cantidad) return null;

                return (
                  <div
                    key={producto.id}
                    className="flex justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-bold">
                        {producto.emoji} {producto.nombre}
                      </p>

                      <p className="text-sm text-gray-500">
                        {textoCantidad(producto, cantidad)}
                      </p>
                    </div>

                    <strong>
                      {formatoPrecio(producto.precio * cantidad)}
                    </strong>
                  </div>
                );
              })}

              {huevos.map((opcion) => {
                const cantidad = carritoHuevos[opcion.id] || 0;

                if (!cantidad) return null;

                return (
                  <div
                    key={opcion.id}
                    className="flex justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-bold">🥚 Huevos</p>
                      <p className="text-sm text-gray-500">
                        {cantidad} × {opcion.nombre}
                      </p>
                    </div>

                    <strong>
                      {formatoPrecio(opcion.precio * cantidad)}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-lg">
                ¿Cómo querés recibirlo?
              </h3>

              <button
                onClick={() => setEntrega("retiro")}
                className={`mt-3 w-full border-2 rounded-xl p-4 text-left ${
                  entrega === "retiro"
                    ? "border-green-700 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <strong>🏪 Retiro en el local</strong>
                <p className="text-sm text-green-700">
                  GRATIS
                </p>
              </button>

              <button
                onClick={() => setEntrega("envio")}
                className={`mt-3 w-full border-2 rounded-xl p-4 text-left ${
                  entrega === "envio"
                    ? "border-green-700 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <strong>🚚 Envío a domicilio</strong>
                <p className="text-sm text-green-700">
                  + {formatoPrecio(2000)}
                </p>
              </button>
            </div>

            <div className="mt-8 bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatoPrecio(subtotal)}</span>
              </div>

              <div className="flex justify-between mt-2">
                <span>Envío</span>
                <span>
                  {costoEnvio === 0
                    ? "GRATIS"
                    : formatoPrecio(costoEnvio)}
                </span>
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatoPrecio(total)}</span>
              </div>
              <div className="mt-8">
  <h3 className="font-bold text-lg mb-3">
    Tus datos
  </h3>

  <label className="text-sm font-semibold">
    Nombre *
  </label>

  <input
    type="text"
    value={nombre}
    onChange={(e) => setNombre(e.target.value)}
    placeholder="Tu nombre"
    className="mt-1 mb-4 w-full border rounded-xl px-4 py-3 outline-none focus:border-green-700"
  />

  {entrega === "envio" && (
    <>
      <label className="text-sm font-semibold">
        Dirección *
      </label>

      <input
        type="text"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        placeholder="Ej: Av. Luján 2450"
        className="mt-1 mb-4 w-full border rounded-xl px-4 py-3 outline-none focus:border-green-700"
      />

      <label className="text-sm font-semibold">
        Entre calles / referencia
      </label>

      <input
        type="text"
        value={referencia}
        onChange={(e) => setReferencia(e.target.value)}
        placeholder="Ej: entre Belgrano y Sarmiento"
        className="mt-1 mb-4 w-full border rounded-xl px-4 py-3 outline-none focus:border-green-700"
      />
    </>
  )}

  <label className="text-sm font-semibold">
    Observaciones
  </label>

  <textarea
    value={observaciones}
    onChange={(e) => setObservaciones(e.target.value)}
    placeholder="Ej: tomates maduros, bananas verdes..."
    rows={3}
    className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:border-green-700 resize-none"
  />
</div>
            </div>

            <button
  onClick={enviarWhatsApp}
  className="mt-6 w-full bg-green-800 text-white py-4 rounded-2xl font-bold text-lg"
>
  📲 Enviar pedido por WhatsApp
</button>

          </div>
        </div>
      )}

    </main>
  );
}