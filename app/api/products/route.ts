
import { NextResponse } from "next/server";
import db from "@/lib/db";

function validAmount(value: unknown): number | null {
  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : null;
}

type ModelRow = {
  id: number;
  code: string;
  name: string;
};

function generateModelCode(): string {
  const rows = db
    .prepare("SELECT code FROM product_models WHERE code LIKE 'S-%'")
    .all() as { code: string }[];

  let maxNumber = 0;

  for (const row of rows) {
    const match = /^S-(\d+)$/.exec(row.code);

    if (match) {
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }
  }

  let nextNumber = maxNumber + 1;
  let code = `S-${String(nextNumber).padStart(3, "0")}`;

  while (
    db.prepare("SELECT 1 FROM product_models WHERE code = ?").get(code)
  ) {
    nextNumber += 1;
    code = `S-${String(nextNumber).padStart(3, "0")}`;
  }

  return code;
}

export async function GET() {
  try {
    const products = db
      .prepare(`
        SELECT
          pm.id AS model_id,
          pm.code,
          pm.name,
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

    const name = String(body.name ?? "").trim();
    const color = String(body.color ?? "").trim();
    const size = String(body.size ?? "").trim();

    const purchasePrice = validAmount(body.purchasePrice);
    const salePrice = validAmount(body.salePrice);
    const stock = validAmount(body.stock);

    if (!name) {
      return NextResponse.json(
        { success: false, message: "نام مدل الزامی است." },
        { status: 400 },
      );
    }

    if (
      purchasePrice === null ||
      salePrice === null ||
      stock === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "قیمت‌ها و تعداد باید عدد صحیح و غیرمنفی باشند.",
        },
        { status: 400 },
      );
    }

    const saveProduct = db.transaction(() => {
      const code = generateModelCode();

      const result = db
        .prepare(`
          INSERT INTO product_models (code, name, fabric)
          VALUES (?, ?, NULL)
        `)
        .run(code, name);

      const modelId = Number(result.lastInsertRowid);

      db.prepare(`
        INSERT INTO product_variants
          (model_id, color, size, purchase_price, sale_price, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        modelId,
        color,
        size,
        purchasePrice,
        salePrice,
        stock,
      );

      return { modelId, code };
    });

    const saved = saveProduct.immediate();

    return NextResponse.json(
      {
        success: true,
        message: "کالا با موفقیت ثبت شد.",
        modelId: saved.modelId,
        code: saved.code,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Product creation failed:", error);

    return NextResponse.json(
      { success: false, message: "ثبت کالا انجام نشد." },
      { status: 500 },
    );
  }
}
