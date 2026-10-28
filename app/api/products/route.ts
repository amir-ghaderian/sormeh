
import { NextResponse } from "next/server";
import db from "@/lib/db";

function validAmount(value: unknown): number | null {
  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : null;
}

export async function GET() {
  try {
    const products = db
      .prepare(`
        SELECT
          pm.id AS model_id,
          pm.code,
          pm.name,
          pm.fabric,
          pv.id AS variant_id,
          pv.color,
          pv.size,
          pv.purchase_price,
          pv.sale_price,
          pv.stock
        FROM product_models pm
        LEFT JOIN product_variants pv ON pv.model_id = pm.id
        ORDER BY pm.id DESC, pv.id DESC
      `)
      .all();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Products fetch failed:", error);

    return NextResponse.json(
      { success: false, message: "دریافت کالاها ناموفق بود." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = String(body.code ?? "").trim();
    const name = String(body.name ?? "").trim();
    const fabric = String(body.fabric ?? "").trim();
    const color = String(body.color ?? "").trim();
    const size = String(body.size ?? "").trim();

    const purchasePrice = validAmount(body.purchasePrice);
    const salePrice = validAmount(body.salePrice);
    const stock = validAmount(body.stock);

    if (!code || !name || !color || !size) {
      return NextResponse.json(
        { success: false, message: "کد، نام، رنگ و سایز الزامی هستند." },
        { status: 400 },
      );
    }

    if (
      purchasePrice === null ||
      salePrice === null ||
      stock === null
    ) {
      return NextResponse.json(
        { success: false, message: "قیمت‌ها و تعداد باید عدد صحیح و غیرمنفی باشند." },
        { status: 400 },
      );
    }

    const saveProduct = db.transaction(() => {
      let model = db
        .prepare("SELECT id, name, fabric FROM product_models WHERE code = ?")
        .get(code) as
        | { id: number; name: string; fabric: string | null }
        | undefined;

      if (!model) {
        const result = db
          .prepare(`
            INSERT INTO product_models (code, name, fabric)
            VALUES (?, ?, ?)
          `)
          .run(code, name, fabric || null);

        model = {
          id: Number(result.lastInsertRowid),
          name,
          fabric: fabric || null,
        };
      } else if (
        model.name !== name ||
        (model.fabric ?? "") !== fabric
      ) {
        throw new Error("MODEL_DETAILS_MISMATCH");
      }

      db.prepare(`
        INSERT INTO product_variants
          (model_id, color, size, purchase_price, sale_price, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        model.id,
        color,
        size,
        purchasePrice,
        salePrice,
        stock,
      );

      return model.id;
    });

    const modelId = saveProduct();

    return NextResponse.json(
      {
        success: true,
        message: "کالا با موفقیت ثبت شد.",
        modelId,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "MODEL_DETAILS_MISMATCH") {
      return NextResponse.json(
        {
          success: false,
          message: "این کد قبلاً برای مدلی با نام یا پارچهٔ متفاوت ثبت شده است.",
        },
        { status: 409 },
      );
    }

    if (message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        {
          success: false,
          message: "این ترکیب رنگ و سایز قبلاً برای این مدل ثبت شده است.",
        },
        { status: 409 },
      );
    }

    console.error("Product creation failed:", error);

    return NextResponse.json(
      { success: false, message: "ثبت کالا انجام نشد." },
      { status: 500 },
    );
  }
}
