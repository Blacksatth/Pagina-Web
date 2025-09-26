import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// GET /api/products
export async function GET() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
    const [rows] = await connection.execute("SELECT * FROM products");
    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Error en /api/products:", error);
    return NextResponse.json({ error: "Error cargando productos" }, { status: 500 });
  }
}
