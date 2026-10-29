
"use client";

import { useCallback, useEffect, useState } from "react";

type Product = {
  model_id: number;
  code: string;
  name: string;
  variant_id: number | null;
  color: string | null;
  size: string | null;
  purchase_price: number | null;
  sale_price: number | null;
  stock: number | null;
};

const emptyForm = {
  name: "",
  color: "",
  size: "",
  purchasePrice: "",
  salePrice: "",
  stock: "0",
};

const money = (value: number | null | undefined) =>
  `${new Intl.NumberFormat("fa-IR").format(value ?? 0)} تومان`;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "دریافت کالاها ناموفق بود.");
      }

      setProducts(result.products);
      setError("");
    } catch {
      setError("دریافت فهرست کالاها ناموفق بود. اتصال برنامه را بررسی کن.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function startEditing(product: Product) {
    if (product.variant_id === null) {
      setError("برای این کالا تنوع قابل ویرایش وجود ندارد.");
      return;
    }

    setEditingProduct(product);
    setForm({
      name: product.name,
      color: product.color ?? "",
      size: product.size ?? "",
      purchasePrice: String(product.purchase_price ?? 0),
      salePrice: String(product.sale_price ?? 0),
      stock: String(product.stock ?? 0),
    });
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingProduct(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const isEditing = editingProduct !== null;

      const response = await fetch("/api/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing
            ? {
                modelId: editingProduct.model_id,
                variantId: editingProduct.variant_id,
              }
            : {}),
          name: form.name.trim(),
          color: form.color.trim(),
          size: form.size.trim(),
          purchasePrice: Number(form.purchasePrice),
          salePrice: Number(form.salePrice),
          stock: Number(form.stock),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "ذخیرهٔ اطلاعات ناموفق بود.");
      }

      if (isEditing) {
        setMessage(
          `اطلاعات «${form.name.trim()}» با موفقیت اصلاح شد.`,
        );
      } else {
        setMessage(
          `کالا با موفقیت ثبت شد. کد مدل جدید: ${result.code}`,
        );
      }

      setEditingProduct(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ذخیرهٔ اطلاعات ناموفق بود.",
      );
    } finally {
      setSaving(false);
    }
  }

  const modelCount = new Set(
    products.map((product) => product.model_id),
  ).size;

  return (
    <main className="products-page" dir="rtl">
      <header className="products-header">
        <div>
          <a className="back-link" href="/">
            ← بازگشت به داشبورد
          </a>
          <h1>کالاها و انبار</h1>
          <p>ثبت مدل‌های پوشاک، قیمت‌ها و موجودی انبار</p>
        </div>

        <div className="products-count">
          <span>تعداد مدل‌ها</span>
          <strong>
            {new Intl.NumberFormat("fa-IR").format(modelCount)}
          </strong>
        </div>
      </header>

      <section className="products-panel">
        <div className="products-panel-heading">
          <div>
            <h2>{editingProduct ? "ویرایش کالا" : "ثبت کالای جدید"}</h2>
            <p>
              {editingProduct
                ? `کد مدل ${editingProduct.code} حفظ می‌شود. تغییرات را ذخیره کن.`
                : "کد مدل به‌صورت خودکار تولید می‌شود. رنگ و سایز اختیاری هستند."}
            </p>
          </div>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          {editingProduct && (
            <label>
              کد مدل
              <input value={editingProduct.code} readOnly />
            </label>
          )}

          <label>
            نام مدل *
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="مثلاً مانتو لینن"
              required
              maxLength={150}
            />
          </label>

          <label>
            رنگ (اختیاری)
            <input
              value={form.color}
              onChange={(event) => updateField("color", event.target.value)}
              placeholder="مثلاً مشکی"
              maxLength={80}
            />
          </label>

          <label>
            سایز (اختیاری)
            <input
              value={form.size}
              onChange={(event) => updateField("size", event.target.value)}
              placeholder="مثلاً ۳۸ یا فری‌سایز"
              maxLength={50}
            />
          </label>

          <label>
            قیمت خرید (تومان) *
            <input
              type="number"
              min="0"
              step="1"
              value={form.purchasePrice}
              onChange={(event) =>
                updateField("purchasePrice", event.target.value)
              }
              required
            />
          </label>

          <label>
            قیمت فروش (تومان) *
            <input
              type="number"
              min="0"
              step="1"
              value={form.salePrice}
              onChange={(event) =>
                updateField("salePrice", event.target.value)
              }
              required
            />
          </label>

          <label>
            موجودی {editingProduct ? "فعلی" : "اولیه"} (عدد) *
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              required
            />
          </label>

          <div className="product-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "در حال ذخیره..."
                : editingProduct
                  ? "ذخیرهٔ تغییرات"
                  : "ثبت کالا"}
            </button>

            {editingProduct && (
              <button
                type="button"
                className="refresh-button"
                onClick={cancelEditing}
                disabled={saving}
              >
                انصراف
              </button>
            )}
          </div>
        </form>

        {message && <p className="product-message success">{message}</p>}
        {error && <p className="product-message error">{error}</p>}
      </section>

      <section className="products-panel">
        <div className="products-panel-heading">
          <div>
            <h2>فهرست کالاهای انبار</h2>
            <p>برای اصلاح مشخصات یا موجودی، روی «ویرایش» بزن.</p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={() => void loadProducts()}
            disabled={loading}
          >
            {loading ? "در حال دریافت..." : "به‌روزرسانی"}
          </button>
        </div>

        {loading ? (
          <p className="products-empty">در حال دریافت کالاها...</p>
        ) : products.length === 0 ? (
          <p className="products-empty">
            هنوز کالایی ثبت نشده است. از فرم بالا اولین کالای سورمه را ثبت کن.
          </p>
        ) : (
          <div className="products-table-wrap">
            <table className="products-table">
              <thead>
                <tr>
                  <th>کد مدل</th>
                  <th>نام مدل</th>
                  <th>رنگ</th>
                  <th>سایز</th>
                  <th>قیمت خرید</th>
                  <th>قیمت فروش</th>
                  <th>موجودی</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={`${product.model_id}-${product.variant_id ?? "none"}`}
                  >
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{product.color || "—"}</td>
                    <td>{product.size || "—"}</td>
                    <td>{money(product.purchase_price)}</td>
                    <td>{money(product.sale_price)}</td>
                    <td>
                      <span
                        className={
                          (product.stock ?? 0) <= 2
                            ? "stock-badge low"
                            : "stock-badge"
                        }
                      >
                        {new Intl.NumberFormat("fa-IR").format(
                          product.stock ?? 0,
                        )}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="refresh-button"
                        onClick={() => startEditing(product)}
                        disabled={product.variant_id === null || saving}
                      >
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
