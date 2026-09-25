import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseKey || !adminEmail || !adminPassword) {
  console.error("❌ Faltan variables en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ======================================================
// IMÁGENES COMPARTIDAS
// Una sola foto puede utilizarse en varios productos.
// ======================================================

const imagenesCompartidas = {
  banana: [
    "Banana Bolivia",
    "Banana Ecuador",
  ],

  ciruela: [
    "Ciruela",
    "Ciruela amarilla",
    "Ciruela gotita miel",
  ],

  mandarina: [
    "Mandarina Criolla",
    "Mandarina Elendale",
    "Mandarina Nova",
  ],

  "manzana-roja": [
    "Manzana Jaula",
    "Manzana Pink Lady",
    "Manzana Red",
    "Manzana Red Delicious",
  ],

  palta: [
    "Palta",
    "Palta Argentina",
  ],

  pelon: [
    "Pelón blanco",
    "Pelón MGV",
  ],

  naranja: [
    "Naranja jugo",
    "Naranja Ombligo",
  ],

  uva: [
    "Uva Blanca",
    "Uva Red",
  ],

  tomate: [
    "Tomate Perita",
    "Tomate Redondo",
  ],

  pimiento: [
    "Pimiento Rojo",
    "Pimiento Verde",
  ],
};

// ======================================================
// NORMALIZAR NOMBRES
// Brócoli -> brocoli
// Cebolla de verdeo -> cebolla-de-verdeo
// ======================================================

function convertirNombre(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function obtenerContentType(extension) {
  const ext = extension.toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";

  return "application/octet-stream";
}

// ======================================================
// PROCESO PRINCIPAL
// ======================================================

async function subirFotos() {
  console.log("");
  console.log("👑 LA REINA - CARGA AUTOMÁTICA DE FOTOS");
  console.log("---------------------------------------");
  console.log("🔐 Iniciando sesión...");

  const { error: errorLogin } =
    await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

  if (errorLogin) {
    console.error("❌ Error iniciando sesión:");
    console.error(errorLogin.message);
    return;
  }

  console.log("✅ Sesión iniciada.");

  // Traemos todos los productos
  const { data: productos, error: errorProductos } =
    await supabase
      .from("productos")
      .select("id, nombre, imagen");

  if (errorProductos) {
    console.error("❌ Error cargando productos:");
    console.error(errorProductos.message);
    return;
  }

  const carpetaFotos = path.join(
    process.cwd(),
    "fotos-productos"
  );

  if (!fs.existsSync(carpetaFotos)) {
    console.error("❌ No existe la carpeta fotos-productos.");
    return;
  }

  const archivos = fs
    .readdirSync(carpetaFotos)
    .filter((archivo) =>
      /\.(png|jpg|jpeg|webp)$/i.test(archivo)
    );

  console.log(`📁 Encontradas ${archivos.length} imágenes.`);
  console.log("");

  let productosActualizados = 0;
  let imagenesProcesadas = 0;
  let sinCoincidencia = 0;
  let errores = 0;

  for (const archivo of archivos) {
    const extension = path.extname(archivo);

    const nombreBase = convertirNombre(
      path.basename(archivo, extension)
    );

    // --------------------------------------------------
    // 1. ¿Existe un producto con exactamente ese nombre?
    // --------------------------------------------------

    const productoExacto = productos.find(
      (producto) =>
        convertirNombre(producto.nombre) === nombreBase
    );

    let productosDestino = [];

    if (productoExacto) {
      // La foto específica tiene prioridad.
      productosDestino = [productoExacto];
    } else if (imagenesCompartidas[nombreBase]) {
      // Si no existe producto exacto, buscamos el grupo.
      const nombresGrupo = imagenesCompartidas[nombreBase];

      productosDestino = productos.filter((producto) =>
        nombresGrupo.includes(producto.nombre)
      );
    }

    if (productosDestino.length === 0) {
      console.log(
        `⚠️ ${archivo} → No encontré ningún producto.`
      );

      sinCoincidencia++;
      continue;
    }

    console.log(`🖼️ Procesando ${archivo}`);

    const rutaLocal = path.join(
      carpetaFotos,
      archivo
    );

    const contenido = fs.readFileSync(rutaLocal);

    const extensionLimpia =
      extension.replace(".", "").toLowerCase();

    const nombreStorage =
      `catalogo/${nombreBase}-${Date.now()}.${extensionLimpia}`;

    // --------------------------------------------------
    // SUBIR UNA SOLA VEZ A STORAGE
    // --------------------------------------------------

    const { error: errorSubida } =
      await supabase.storage
        .from("productos")
        .upload(nombreStorage, contenido, {
          contentType: obtenerContentType(extension),
          upsert: false,
        });

    if (errorSubida) {
      console.log(
        `   ❌ Error subiendo: ${errorSubida.message}`
      );

      errores++;
      continue;
    }

    const { data: urlData } =
      supabase.storage
        .from("productos")
        .getPublicUrl(nombreStorage);

    const urlImagen = urlData.publicUrl;

    // --------------------------------------------------
    // ASOCIAR LA MISMA FOTO A TODOS LOS PRODUCTOS
    // --------------------------------------------------

    for (const producto of productosDestino) {
      const { error: errorActualizar } =
        await supabase
          .from("productos")
          .update({
            imagen: urlImagen,
          })
          .eq("id", producto.id);

      if (errorActualizar) {
        console.log(
          `   ❌ ${producto.nombre}: ${errorActualizar.message}`
        );

        errores++;
        continue;
      }

      console.log(`   ✅ ${producto.nombre}`);

      productosActualizados++;
    }

    imagenesProcesadas++;

    console.log("");
  }

  console.log("---------------------------------------");
  console.log("👑 PROCESO TERMINADO");
  console.log(`🖼️ Imágenes procesadas: ${imagenesProcesadas}`);
  console.log(`✅ Productos actualizados: ${productosActualizados}`);
  console.log(`⚠️ Imágenes sin coincidencia: ${sinCoincidencia}`);
  console.log(`❌ Errores: ${errores}`);
  console.log("---------------------------------------");
  console.log("");
}

subirFotos();