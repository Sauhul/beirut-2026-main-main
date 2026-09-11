import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@data/supabase/client";
import { formatCOP } from "@shared/utils/format";
import {
  UNIT_OPTIONS,
  formatPresentation,
  isStandardUnit,
  normalizeProductName,
  normalizeUnit,
} from "@shared/utils/product-format";
import { inputClass } from "@shared/utils/input-class";
import { slugify } from "@shared/utils/slugify";
import type { CategoryRow, ProductRow } from "./admin.types";

const emptyProduct: Omit<ProductRow, "id"> = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  unit: "unidad",
  image_url: null,
  featured: false,
  in_stock: true,
  category_id: null,
};

/* ── Productos ─────────────────────────────────────────────── */

export function ProductsManager() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [editing, setEditing] = useState<(Partial<ProductRow> & { id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setProducts((prods as ProductRow[]) ?? []);
    setCategories((cats as CategoryRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(imageFile?: File | null) {
    if (!supabase || !editing) return;
    const name = normalizeProductName(editing.name ?? "");
    let image_url = editing.image_url || null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${slugify(name) || "producto"}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile, { contentType: imageFile.type });
      if (uploadError) {
        toast.error(`No se pudo subir la imagen: ${uploadError.message}`);
        return;
      }
      image_url = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }

    const values = {
      ...editing,
      name,
      slug: editing.slug || slugify(name),
      unit: normalizeUnit(editing.unit),
      price: Number(editing.price),
      image_url,
      category_id: editing.category_id || null,
    };
    const query = editing.id
      ? supabase.from("products").update(values).eq("id", editing.id)
      : supabase.from("products").insert(values);
    const { error } = await query;
    if (error) {
      toast.error(`No se pudo guardar: ${error.message}`);
      return;
    }
    toast.success(editing.id ? "Producto actualizado" : "Producto creado");
    setEditing(null);
    void load();
  }

  async function remove(product: ProductRow) {
    if (!supabase || !product) return;
    setDeletingBusy(true);
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    setDeletingBusy(false);
    if (error) {
      toast.error(`No se pudo eliminar: ${error.message}`);
      return;
    }
    toast.success("Producto eliminado");
    setDeleting(null);
    void load();
  }

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setEditing({ ...emptyProduct })}
          className="btn-gold !py-2.5 !px-5"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${inputClass} max-w-xs`}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => (
                  <tr key={p.id} className="hover:bg-onyx/50">
                    <td className="px-4 py-3">
                      <span className="font-bold text-sand">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatPresentation(p.unit)}
                      </span>
                      {p.featured && <span className="ml-2 text-xs text-gold">★</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {categories.find((c) => c.id === p.category_id)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-display text-gold">{formatCOP(p.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${p.in_stock ? "text-gold" : "text-destructive"}`}
                      >
                        {p.in_stock ? "Disponible" : "Agotado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          aria-label="Editar"
                          className="text-muted-foreground hover:text-gold"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          aria-label="Eliminar"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {products
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    {products.length === 0 ? "No hay productos todavía." : "No se encontraron productos con esa búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductForm
          value={editing}
          categories={categories}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deletingBusy && setDeleting(null)}
        >
          <div
            className="w-full max-w-sm border border-border bg-card p-7 text-center shadow-[var(--shadow-lift)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="mt-4 font-display text-2xl text-sand">¿Eliminar producto?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vas a eliminar{" "}
              <span className="font-bold text-sand">"{deleting.name}"</span>. Los pedidos
              anteriores conservarán su historial.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deletingBusy}
                className="btn-outline-gold !px-5 !py-2 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void remove(deleting)}
                disabled={deletingBusy}
                className="btn-gold !bg-destructive !text-destructive-foreground !px-5 !py-2 text-xs"
              >
                {deletingBusy ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Reduce la imagen a máx. 1400 px y la comprime a JPEG (~100–300 KB). */
async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo comprimir la imagen"))),
      "image/jpeg",
      0.82,
    );
  });
  const name = file.name.replace(/\.[^.]+$/, "").replace(/\s+/g, "-");
  return new File([blob], `${name || "imagen"}.jpg`, { type: "image/jpeg" });
}

function ProductForm({
  value,
  categories,
  onChange,
  onCancel,
  onSave,
}: {
  value: Partial<ProductRow> & { id?: string };
  categories: CategoryRow[];
  onChange: (v: Partial<ProductRow> & { id?: string }) => void;
  onCancel: () => void;
  onSave: (imageFile?: File | null) => void;
}) {
  const set = <K extends keyof ProductRow>(key: K, v: ProductRow[K]) =>
    onChange({ ...value, [key]: v });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value.image_url ?? null);
  const [processingImage, setProcessingImage] = useState(false);

  async function selectImage(rawFile: File | undefined) {
    if (!rawFile) return;
    if (!rawFile.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen (JPG, PNG o WebP).");
      return;
    }
    if (rawFile.size > 25 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande (máx. 25 MB).");
      return;
    }
    setProcessingImage(true);
    try {
      const file = await compressImage(rawFile);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } catch {
      toast.error("No se pudo procesar la imagen. Intenta con otra.");
    } finally {
      setProcessingImage(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-card p-7 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-sand">
            {value.id ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button onClick={onCancel} aria-label="Cerrar" className="text-muted-foreground hover:text-gold">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(imageFile);
          }}
          className="mt-6 grid gap-4"
        >
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nombre
            <input
              required
              minLength={2}
              value={value.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Descripción
            <textarea
              rows={3}
              value={value.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Precio (COP)
              <input
                required
                type="number"
                min={1}
                value={value.price ?? 0}
                onChange={(e) => set("price", Number(e.target.value))}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Presentación
              <select
                value={isStandardUnit(value.unit) ? normalizeUnit(value.unit) : "otra"}
                onChange={(e) => set("unit", e.target.value === "otra" ? "" : e.target.value)}
                className={`mt-1 ${inputClass}`}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {formatPresentation(u)}
                  </option>
                ))}
                <option value="otra">Otra…</option>
              </select>
            </label>
          </div>
          {!isStandardUnit(value.unit) && (
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Presentación personalizada (se normaliza al guardar)
              <input
                placeholder='Ej. "750g", "libra", "1.5kg"…'
                value={value.unit ?? ""}
                onChange={(e) => set("unit", e.target.value)}
                onBlur={(e) => set("unit", normalizeUnit(e.target.value))}
                className={`mt-1 ${inputClass}`}
              />
            </label>
          )}
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Categoría
            <select
              value={value.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              className={`mt-1 ${inputClass}`}
            >
              <option value="">— Sin categoría —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Imagen del producto (opcional)
            <div className="mt-2 flex items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="h-20 w-20 border border-border bg-onyx object-contain p-1"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center border border-dashed border-border bg-onyx text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                  Sin foto
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="btn-outline-gold cursor-pointer !px-4 !py-2 text-xs">
                  {imageFile ? "Cambiar imagen" : "Elegir imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={processingImage}
                    onChange={(e) => void selectImage(e.target.files?.[0])}
                  />
                </label>
                <span className="text-[0.65rem] text-muted-foreground">
                  {processingImage
                    ? "Optimizando imagen…"
                    : "JPG, PNG o WebP · se comprime automáticamente"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.featured ?? false}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              Destacado
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value.in_stock ?? true}
                onChange={(e) => set("in_stock", e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              Disponible
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline-gold !px-5 !py-2 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={processingImage}
              className="btn-gold !px-5 !py-2 text-xs"
            >
              {processingImage ? "Procesando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}