"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Categoria = "Frutas" | "Verduras" | "Otros";
type TipoVenta = "kg" | "unidad" | "atado" | "bandeja" | "rama" | "manojo" | "bolsa";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  tipo: TipoVenta;
  categoria: Categoria;
  emoji: string;
};

type ItemCarrito = {
  cantidad: number;
};

const productos: Producto[] = [
  { id: 1, nombre: "Acelga", precio: 1600, tipo: "atado", categoria: "Verduras", emoji: "🥬" },
  { id: 2, nombre: "Achicoria", precio: 1800, tipo: "atado", categoria: "Verduras", emoji: "🥬" },
  { id: 3, nombre: "Ajo", precio: 800, tipo: "unidad", categoria: "Verduras", emoji: "🧄" },
  { id: 4, nombre: "Ananá", precio: 4900, tipo: "unidad", categoria: "Frutas", emoji: "🍍" },
  { id: 5, nombre: "Anco Coquena", precio: 4200, tipo: "kg", categoria: "Verduras", emoji: "🎃" },
  { id: 6, nombre: "Apio", precio: 5300, tipo: "rama", categoria: "Verduras", emoji: "🥬" },
  { id: 7, nombre: "Arándanos", precio: 4200, tipo: "bandeja", categoria: "Frutas", emoji: "🫐" },
  { id: 8, nombre: "Banana Bolivia", precio: 3400, tipo: "kg", categoria: "Frutas", emoji: "🍌" },
  { id: 9, nombre: "Banana Ecuador", precio: 4400, tipo: "kg", categoria: "Frutas", emoji: "🍌" },
  { id: 10, nombre: "Batata", precio: 3200, tipo: "kg", categoria: "Verduras", emoji: "🍠" },
  { id: 11, nombre: "Berenjena", precio: 2700, tipo: "kg", categoria: "Verduras", emoji: "🍆" },
  { id: 12, nombre: "Boniato", precio: 3800, tipo: "kg", categoria: "Verduras", emoji: "🍠" },
  { id: 13, nombre: "Brócoli", precio: 2300, tipo: "unidad", categoria: "Verduras", emoji: "🥦" },
  { id: 14, nombre: "Carbón", precio: 3600, tipo: "bolsa", categoria: "Otros", emoji: "🔥" },
  { id: 15, nombre: "Cebolla", precio: 4500, tipo: "kg", categoria: "Verduras", emoji: "🧅" },
  { id: 16, nombre: "Cebolla de verdeo", precio: 4200, tipo: "unidad", categoria: "Verduras", emoji: "🌿" },
  { id: 17, nombre: "Cebolla morada", precio: 2800, tipo: "kg", categoria: "Verduras", emoji: "🧅" },
  { id: 18, nombre: "Cebollín", precio: 900, tipo: "atado", categoria: "Verduras", emoji: "🌿" },
  { id: 19, nombre: "Cherry", precio: 7600, tipo: "kg", categoria: "Verduras", emoji: "🍅" },
  { id: 20, nombre: "Choclo", precio: 2300, tipo: "unidad", categoria: "Verduras", emoji: "🌽" },
  { id: 21, nombre: "Ciruela", precio: 4600, tipo: "kg", categoria: "Frutas", emoji: "🟣" },
  { id: 22, nombre: "Ciruela amarilla", precio: 6200, tipo: "kg", categoria: "Frutas", emoji: "🟡" },
  { id: 23, nombre: "Ciruela gotita miel", precio: 4200, tipo: "kg", categoria: "Frutas", emoji: "🟡" },
  { id: 24, nombre: "Durazno", precio: 6300, tipo: "kg", categoria: "Frutas", emoji: "🍑" },
  { id: 25, nombre: "Espinaca", precio: 1500, tipo: "atado", categoria: "Verduras", emoji: "🥬" },
  { id: 26, nombre: "Frutilla", precio: 8400, tipo: "kg", categoria: "Frutas", emoji: "🍓" },
  { id: 27, nombre: "Higo", precio: 6900, tipo: "kg", categoria: "Frutas", emoji: "🟣" },
  { id: 28, nombre: "Jengibre", precio: 7000, tipo: "kg", categoria: "Verduras", emoji: "🫚" },
  { id: 29, nombre: "Kiwi", precio: 7600, tipo: "kg", categoria: "Frutas", emoji: "🥝" },
  { id: 30, nombre: "Lechuga crespa", precio: 7700, tipo: "kg", categoria: "Verduras", emoji: "🥬" },
  { id: 31, nombre: "Lechuga mantecosa", precio: 4200, tipo: "kg", categoria: "Verduras", emoji: "🥬" },
  { id: 32, nombre: "Lechuga repollada", precio: 2200, tipo: "kg", categoria: "Verduras", emoji: "🥬" },
  { id: 33, nombre: "Leña", precio: 5700, tipo: "bolsa", categoria: "Otros", emoji: "🪵" },
  { id: 34, nombre: "Lima", precio: 8400, tipo: "kg", categoria: "Frutas", emoji: "🍋" },
  { id: 35, nombre: "Limón", precio: 1400, tipo: "kg", categoria: "Frutas", emoji: "🍋" },
  { id: 36, nombre: "Mandarina Criolla", precio: 1200, tipo: "kg", categoria: "Frutas", emoji: "🍊" },
  { id: 37, nombre: "Mandarina Elendale", precio: 1100, tipo: "kg", categoria: "Frutas", emoji: "🍊" },
  { id: 38, nombre: "Mandarina Nova", precio: 1500, tipo: "kg", categoria: "Frutas", emoji: "🍊" },
  { id: 39, nombre: "Mango", precio: 2600, tipo: "kg", categoria: "Frutas", emoji: "🥭" },
  { id: 40, nombre: "Maní", precio: 1000, tipo: "unidad", categoria: "Otros", emoji: "🥜" },
  { id: 41, nombre: "Manzana Jaula", precio: 5000, tipo: "kg", categoria: "Frutas", emoji: "🍎" },
  { id: 42, nombre: "Manzana Pink Lady", precio: 5300, tipo: "kg", categoria: "Frutas", emoji: "🍎" },
  { id: 43, nombre: "Manzana Red", precio: 3300, tipo: "kg", categoria: "Frutas", emoji: "🍎" },
  { id: 44, nombre: "Manzana Red Delicious", precio: 4700, tipo: "kg", categoria: "Frutas", emoji: "🍎" },
  { id: 45, nombre: "Manzana Verde", precio: 3600, tipo: "kg", categoria: "Frutas", emoji: "🍏" },
  { id: 46, nombre: "Melón Santiago", precio: 6700, tipo: "kg", categoria: "Frutas", emoji: "🍈" },
  { id: 47, nombre: "Naranja jugo", precio: 1400, tipo: "kg", categoria: "Frutas", emoji: "🍊" },
  { id: 48, nombre: "Naranja Ombligo", precio: 1600, tipo: "kg", categoria: "Frutas", emoji: "🍊" },
  { id: 49, nombre: "Palta", precio: 6600, tipo: "kg", categoria: "Frutas", emoji: "🥑" },
  { id: 50, nombre: "Palta Argentina", precio: 3800, tipo: "kg", categoria: "Frutas", emoji: "🥑" },
  { id: 51, nombre: "Papa", precio: 2000, tipo: "kg", categoria: "Verduras", emoji: "🥔" },
  { id: 52, nombre: "Pelón blanco", precio: 5100, tipo: "kg", categoria: "Frutas", emoji: "🍑" },
  { id: 53, nombre: "Pelón MGV", precio: 3400, tipo: "kg", categoria: "Frutas", emoji: "🍑" },
  { id: 54, nombre: "Pepino", precio: 1300, tipo: "kg", categoria: "Verduras", emoji: "🥒" },
  { id: 55, nombre: "Pera Jaula", precio: 3300, tipo: "kg", categoria: "Frutas", emoji: "🍐" },
  { id: 56, nombre: "Perejil", precio: 300, tipo: "manojo", categoria: "Verduras", emoji: "🌿" },
  { id: 57, nombre: "Pimiento Rojo", precio: 10500, tipo: "kg", categoria: "Verduras", emoji: "🫑" },
  { id: 58, nombre: "Pimiento Verde", precio: 6300, tipo: "kg", categoria: "Verduras", emoji: "🫑" },
  { id: 59, nombre: "Pomelo", precio: 1700, tipo: "kg", categoria: "Frutas", emoji: "🍊" },
  { id: 60, nombre: "Puerro", precio: 500, tipo: "unidad", categoria: "Verduras", emoji: "🌿" },
  { id: 61, nombre: "Remolacha", precio: 2400, tipo: "kg", categoria: "Verduras", emoji: "🫜" },
  { id: 62, nombre: "Repollo", precio: 900, tipo: "kg", categoria: "Verduras", emoji: "🥬" },
  { id: 63, nombre: "Rúcula", precio: 1900, tipo: "atado", categoria: "Verduras", emoji: "🌿" },
  { id: 64, nombre: "Sandía", precio: 2000, tipo: "kg", categoria: "Frutas", emoji: "🍉" },
  { id: 65, nombre: "Tomate Perita", precio: 3500, tipo: "kg", categoria: "Verduras", emoji: "🍅" },
  { id: 66, nombre: "Tomate Redondo", precio: 3100, tipo: "kg", categoria: "Verduras", emoji: "🍅" },
  { id: 67, nombre: "Uva Blanca", precio: 6600, tipo: "kg", categoria: "Frutas", emoji: "🍇" },
  { id: 68, nombre: "Uva Red", precio: 8400, tipo: "kg", categoria: "Frutas", emoji: "🍇" },
  { id: 69, nombre: "Zanahoria", precio: 2600, tipo: "kg", categoria: "Verduras", emoji: "🥕" },
  { id: 70, nombre: "Zapallito", precio: 4400, tipo: "kg", categoria: "Verduras", emoji: "🥒" },
  { id: 71, nombre: "Zapallo", precio: 1500, tipo: "kg", categoria: "Verduras", emoji: "🎃" },
  { id: 72, nombre: "Zucchini", precio: 2800, tipo: "kg", categoria: "Verduras", emoji: "🥒" },
];

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
                  {producto.emoji}
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