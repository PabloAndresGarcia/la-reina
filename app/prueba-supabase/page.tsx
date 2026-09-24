import { supabase } from "@/lib/supabase";

export default async function PruebaSupabase() {
  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Error conectando con Supabase
        </h1>

        <p className="mt-4">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        👑 Productos desde Supabase
      </h1>

      <p className="mt-2 mb-6">
        Encontrados: {productos?.length ?? 0}
      </p>

      <div className="space-y-2">
        {productos?.map((producto) => (
          <div key={producto.id} className="border p-3 rounded-xl">
            {producto.emoji} <strong>{producto.nombre}</strong>
            {" — "}
            ${producto.precio}
            {" / "}
            {producto.tipo}
          </div>
        ))}
      </div>
    </main>
  );
}