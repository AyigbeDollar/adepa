"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProduct, type ProductFormState } from "./actions";
import { CATEGORIES } from "@/lib/demo-data";

export interface ProductValues {
  id: string;
  editing: boolean;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price_ghs: string;
  emoji: string;
  image_url: string;
  active: boolean;
}

export default function ProductForm({ initial }: { initial: ProductValues }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(
    saveProduct,
    {}
  );

  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      {initial.editing && <input type="hidden" name="editing" value="1" />}

      <label className="block">
        <span className="text-[12px] font-medium text-muted">
          Product ID (slug)
        </span>
        <input
          name="id"
          required
          readOnly={initial.editing}
          defaultValue={initial.id}
          placeholder="p-milo-400"
          className={`mt-1 w-full rounded-xl border border-hairline px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-black/25 focus:ring-2 focus:ring-accent/40 ${
            initial.editing ? "bg-black/5 text-muted" : "bg-surface"
          }`}
        />
        {initial.editing && (
          <span className="text-[11px] text-muted">
            The ID can&apos;t change — it&apos;s referenced by orders &amp;
            inventory.
          </span>
        )}
      </label>

      <Field name="name" label="Name" defaultValue={initial.name} placeholder="Milo Activ-Go 400g" />
      <div className="grid grid-cols-2 gap-3">
        <Field name="brand" label="Brand" defaultValue={initial.brand} placeholder="Nestlé" />
        <label className="block">
          <span className="text-[12px] font-medium text-muted">Category</span>
          <select
            name="category"
            defaultValue={initial.category || CATEGORIES[0]}
            className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-accent/40"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field name="unit" label="Unit" defaultValue={initial.unit} placeholder="400 g tin" />
        <Field name="price_ghs" label="Price (GH₵)" defaultValue={initial.price_ghs} placeholder="42.00" inputMode="decimal" />
        <Field name="emoji" label="Emoji" defaultValue={initial.emoji} placeholder="🍫" required={false} />
      </div>
      <Field name="image_url" label="Image URL / path (optional)" defaultValue={initial.image_url} placeholder="/products/p-milo-400.jpg" required={false} />

      <label className="flex items-center gap-2 pt-1">
        <input type="checkbox" name="active" defaultChecked={initial.active} className="h-4 w-4 rounded border-hairline text-accent" />
        <span className="text-[14px]">Active (available to customers)</span>
      </label>

      {state.error && <p className="text-[13px] text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Saving…" : initial.editing ? "Save changes" : "Add product"}
        </button>
        <Link href="/admin/products" className="text-[14px] font-medium text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  inputMode,
  required = true,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  inputMode?: "tel" | "email" | "decimal" | "text";
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <input
        name={name}
        inputMode={inputMode}
        required={required}
        defaultValue={defaultValue === "" ? undefined : defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-black/25 focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
