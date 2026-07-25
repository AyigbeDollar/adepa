import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
      <ProductForm
        initial={{
          id: "",
          editing: false,
          name: "",
          brand: "",
          category: "",
          unit: "",
          price_ghs: "",
          emoji: "",
          image_url: "",
          active: true,
        }}
      />
    </div>
  );
}
