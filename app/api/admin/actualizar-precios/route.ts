import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    console.log("Header recibido:", apiKey ? "SI" : "NO");
console.log(
  "Variable PRECIOS_API_KEY cargada:",
  process.env.PRECIOS_API_KEY ? "SI" : "NO"
);
console.log(
  "Coinciden:",
  apiKey === process.env.PRECIOS_API_KEY
);

    if (!apiKey || apiKey !== process.env.PRECIOS_API_KEY) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { nombre, precio } = body;

    if (!nombre || typeof precio !== "number" || precio < 0) {
      return NextResponse.json(
        { error: "Nombre o precio inválido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("productos")
      .update({ precio })
      .eq("nombre", nombre)
      .select("id, nombre, precio");

    if (error) {
      console.error("Error actualizando precio:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `No se encontró el producto "${nombre}"` },
        { status: 404 }
      );
    }

    if (data.length > 1) {
      return NextResponse.json(
        {
          error: `Hay más de un producto llamado "${nombre}". No se realizó una actualización segura.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      producto: data[0],
    });
  } catch (error) {
    console.error("Error API actualizar-precios:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}