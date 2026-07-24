import DistributorForm from "../DistributorForm";

export const dynamic = "force-dynamic";

export default function NewDistributorPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Add distributor</h1>
      <DistributorForm
        initial={{
          name: "",
          area: "",
          city: "",
          lat: "",
          lng: "",
          service_radius_km: 15,
          subaccount_code: "",
          phone: "",
          email: "",
          active: true,
        }}
      />
    </div>
  );
}
