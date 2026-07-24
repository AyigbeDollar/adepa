"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveDistributor, type DistributorFormState } from "./actions";

export interface DistributorValues {
  id?: string;
  name: string;
  area: string;
  city: string;
  lat: number | "";
  lng: number | "";
  service_radius_km: number | "";
  subaccount_code: string;
  phone: string;
  email: string;
  active: boolean;
}

export default function DistributorForm({
  initial,
}: {
  initial: DistributorValues;
}) {
  const [state, action, pending] = useActionState<DistributorFormState, FormData>(
    saveDistributor,
    {}
  );

  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <Field name="name" label="Store name" defaultValue={initial.name} placeholder="Makola Prime Distribution" />
      <div className="grid grid-cols-2 gap-3">
        <Field name="area" label="Area" defaultValue={initial.area} placeholder="Makola, Accra Central" />
        <Field name="city" label="City" defaultValue={initial.city} placeholder="Accra" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field name="lat" label="Latitude" defaultValue={String(initial.lat)} placeholder="5.5560" inputMode="decimal" />
        <Field name="lng" label="Longitude" defaultValue={String(initial.lng)} placeholder="-0.1969" inputMode="decimal" />
        <Field name="service_radius_km" label="Radius (km)" defaultValue={String(initial.service_radius_km)} placeholder="15" inputMode="decimal" />
      </div>
      <p className="-mt-2 text-[11px] text-muted">
        Tip: get lat/lng from Google Maps — right-click the store location → the
        first row copies the coordinates.
      </p>
      <Field name="subaccount_code" label="Paystack subaccount (optional)" defaultValue={initial.subaccount_code} placeholder="ACCT_xxxxxxxx" required={false} />
      <div className="grid grid-cols-2 gap-3">
        <Field name="phone" label="Phone (optional)" defaultValue={initial.phone} placeholder="0241234567" required={false} inputMode="tel" />
        <Field name="email" label="Email (optional)" defaultValue={initial.email} placeholder="store@example.com" type="email" required={false} />
      </div>

      <label className="flex items-center gap-2 pt-1">
        <input type="checkbox" name="active" defaultChecked={initial.active} className="h-4 w-4 rounded border-hairline text-accent" />
        <span className="text-[14px]">Active (visible to customers)</span>
      </label>

      {state.error && <p className="text-[13px] text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Saving…" : initial.id ? "Save changes" : "Add distributor"}
        </button>
        <Link href="/admin/distributors" className="text-[14px] font-medium text-muted hover:text-foreground">
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
  type = "text",
  inputMode,
  required = true,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
  type?: string;
  inputMode?: "tel" | "email" | "decimal" | "text";
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        required={required}
        defaultValue={defaultValue === "" ? undefined : defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-black/25 focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
