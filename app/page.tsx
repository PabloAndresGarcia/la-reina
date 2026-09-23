"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] text-gray-900">

      {/* CABECERA */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          <Image
            src="/logo-la-reina.jpg.jpeg"
            alt="Verdulería La Reina"
            width={150}
            height={150}
            priority
            className="w-28 md:w-36 h-auto"
          />

          <div className="text-right">
            <p className="text-sm text-gray-500">Frutas y verduras</p>
            <p className="font-semibold text-green-800">
              Fresco todos los días
            </p>
          </div>

        </div>
      </header>

      {/* PRESENTACIÓN */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <p className="text-green-700 font-semibold mb-2">
          VERDULERÍA LA REINA
        </p>

        <h1 className="text-4xl md:text-5xl font-bold max-w-2xl">
          Lo fresco que buscás, en un solo lugar.
        </h1>

        <p className="mt-4 text-gray-600 max-w-xl">
          Elegí tus productos, armá tu pedido y envialo directamente
          por WhatsApp.
        </p>
      </section>

      {/* ENTREGA */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="text-2xl mb-2">🏪</div>
            <p className="font-bold">Retiro</p>
            <p className="text-green-700 font-semibold">GRATIS</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="text-2xl mb-2">🚚</div>
            <p className="font-bold">Envío</p>
            <p className="text-green-700 font-semibold">+$2.000</p>
          </div>

        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-sm text-green-700 font-semibold">
              NUESTROS PRODUCTOS
            </p>
            <h2 className="text-2xl font-bold">Frutas y verduras</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          <Producto nombre="Papa" precio="$2.000 / kg" emoji="🥔" />
          <Producto nombre="Tomate perita" precio="$3.500 / kg" emoji="🍅" />
          <Producto nombre="Banana Bolivia" precio="$3.400 / kg" emoji="🍌" />
          <Producto nombre="Manzana Red" precio="$3.300 / kg" emoji="🍎" />
          <Producto nombre="Frutilla" precio="$8.400 / kg" emoji="🍓" />
          <Producto nombre="Kiwi" precio="$7.600 / kg" emoji="🥝" />
          <Producto nombre="Berenjena" precio="$2.700 / kg" emoji="🍆" />
          <Producto nombre="Brócoli" precio="$2.300" emoji="🥦" />

        </div>

      </section>

      {/* CARRITO */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96">
        <button className="w-full bg-green-800 hover:bg-green-900 text-white rounded-2xl px-5 py-4 shadow-xl flex justify-between items-center">
          <span className="font-semibold">
            🛒 Ver pedido
          </span>

          <span className="font-bold">
            $0
          </span>
        </button>
      </div>

      <div className="h-24" />

    </main>
  );
}

function Producto({
  nombre,
  precio,
  emoji,
}: {
  nombre: string;
  precio: string;
  emoji: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

      <div className="h-32 bg-green-50 flex items-center justify-center text-6xl">
        {emoji}
      </div>

      <div className="p-4">
        <h3 className="font-bold">{nombre}</h3>

        <p className="text-green-800 font-bold mt-1">
          {precio}
        </p>

        <button className="mt-4 w-full bg-green-100 text-green-900 font-semibold py-2 rounded-xl hover:bg-green-200">
          + Agregar
        </button>
      </div>

    </div>
  );
}