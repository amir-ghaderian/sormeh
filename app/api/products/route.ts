
import { NextResponse } from "next/server";
import db from "@/lib/db";

function validAmount(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : null;
}

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const modelId = Number(body.modelId);
    const variantId = Number(body.variantId);
    const name = String(body.name ?? "").trim();
    const color = String(body.color ?? "").trim();
    const size = String(body.size ?? "").trim();

    const purchasePrice = validAmount(body.purchasePrice);
    const salePrice = validAmount(body.salePrice);
    const stock = validAmount(body.stock);

    if (
      !Number.isSafeInteger(modelId) ||
      modelId <= 0 ||
      !Number.isSafeInteger(variantId) ||
      variantId <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "شناسهٔ کالا معتبر نیست." },
        { status: 400 },
      );
    }

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

    const updateProduct = db.transaction(() => {
      const model = db
        .prepare("SELECT id FROM product_models WHERE id = ?")
        .get(modelId);

      const variant = db
        .prepare(`
          SELECT id
          FROM product_variants
          WHERE id = ? AND model_id = ?
        `)
        .get(variantId, modelId);

      if (!model || !variant) {
        return false;
      }

      db.prepare(`
        UPDATE product_models
        SET name = ?
        WHERE id = ?
      `).run(name, modelId);

      db.prepare(`
        UPDATE product_variants
        SET
          color = ?,
          size = ?,
          purchase_price = ?,
          sale_price = ?,
          stock = ?
        WHERE id = ? AND model_id = ?
      `).run(
        color,
        size,
        purchasePrice,
        salePrice,
        stock,
        variantId,
        modelId,
      );

      return true;
    });

    const updated = updateProduct.immediate();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "کالای موردنظر پیدا نشد." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "اطلاعات کالا با موفقیت اصلاح شد.",
    });
  } catch (error) {
    console.error("Product update failed:", error);

    return NextResponse.json(
      { success: false, message: "اصلاح اطلاعات کالا انجام نشد." },
      { status: 500 },
    );
  }
}
