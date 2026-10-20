"use client";

import {
FormEvent,
useState,
} from "react";

import {
Loader2,
} from "lucide-react";

import {
toast,
} from "sonner";

import {
createGear,
updateGear,
} from "@/services/gear.service";

import type {
CreateGearPayload,
Gear,
} from "@/types/gear";

interface Category {
id: string;
name: string;
}

interface GearFormProps {
mode: "add" | "edit";
gear?: Gear;
categories: Category[];
onSuccess?: () => void;
}

export default function GearForm({
mode,
gear,
categories,
onSuccess,
}: GearFormProps) {
const [title, setTitle] = useState(
gear?.title ?? ""
);

const [brand, setBrand] = useState(
gear?.brand ?? ""
);

const [description, setDescription] =
useState(
gear?.description ?? ""
);

const [condition, setCondition] =
useState(
gear?.condition ?? ""
);

const [pricePerDay, setPricePerDay] =
useState(
gear?.pricePerDay?.toString() ?? ""
);

const [stock, setStock] =
useState(
gear?.stock?.toString() ?? ""
);

const [image, setImage] =
useState(
gear?.image ?? ""
);

const [categoryId, setCategoryId] =
useState(
gear?.categoryId ??
gear?.category?.id ??
""
);

const [loading, setLoading] =
useState(false);

const handleSubmit = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault();


if (!title.trim()) {
  toast.error("Gear title is required.");
  return;
}

if (!categoryId) {
  toast.error("Please select a category.");
  return;
}

if (!pricePerDay || Number(pricePerDay) <= 0) {
  toast.error(
    "Please enter a valid daily price."
  );
  return;
}

if (!stock || Number(stock) < 0) {
  toast.error(
    "Please enter a valid stock quantity."
  );
  return;
}

try {
  setLoading(true);

  const payload: CreateGearPayload = {
    title: title.trim(),
    brand: brand.trim(),
    description: description.trim(),
    condition: condition.trim(),
    pricePerDay: Number(pricePerDay),
    stock: Number(stock),
    image: image.trim(),
    categoryId,
  };

  if (mode === "edit") {
    if (!gear?.id) {
      throw new Error(
        "Gear ID is missing."
      );
    }

    await updateGear(
      gear.id,
      payload
    );

    toast.success(
      "Gear updated successfully."
    );
  } else {
    await createGear(payload);

    toast.success(
      "Gear created successfully."
    );
  }

  onSuccess?.();
} catch (error: any) {
  console.error(
    "Gear form error:",
    error
  );

  toast.error(
    error?.response?.data?.message ||
      error?.message ||
      `Failed to ${
        mode === "edit"
          ? "update"
          : "create"
      } gear.`
  );
} finally {
  setLoading(false);
}


};

return ( <form
   onSubmit={handleSubmit}
   className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
 > <div className="grid gap-6 md:grid-cols-2">


    {/* Title */}
    <div className="md:col-span-2">
      <label
        htmlFor="title"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Gear Title
      </label>

      <input
        id="title"
        type="text"
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="e.g. Mountain Bike"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
        required
      />
    </div>

    {/* Brand */}
    <div>
      <label
        htmlFor="brand"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Brand
      </label>

      <input
        id="brand"
        type="text"
        value={brand}
        onChange={(event) =>
          setBrand(event.target.value)
        }
        placeholder="e.g. Trek"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
      />
    </div>

    {/* Condition */}
    <div>
      <label
        htmlFor="condition"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Condition
      </label>

      <input
        id="condition"
        type="text"
        value={condition}
        onChange={(event) =>
          setCondition(
            event.target.value
          )
        }
        placeholder="e.g. Excellent"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
      />
    </div>

    {/* Category */}
    <div>
      <label
        htmlFor="category"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Category
      </label>

      <select
        id="category"
        value={categoryId}
        onChange={(event) =>
          setCategoryId(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
        required
      >
        <option value="">
          Select category
        </option>

        {categories.map(
          (category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          )
        )}
      </select>
    </div>

    {/* Price */}
    <div>
      <label
        htmlFor="pricePerDay"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Price Per Day
      </label>

      <input
        id="pricePerDay"
        type="number"
        min="0"
        step="0.01"
        value={pricePerDay}
        onChange={(event) =>
          setPricePerDay(
            event.target.value
          )
        }
        placeholder="e.g. 25"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
        required
      />
    </div>

    {/* Stock */}
    <div>
      <label
        htmlFor="stock"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Stock
      </label>

      <input
        id="stock"
        type="number"
        min="0"
        step="1"
        value={stock}
        onChange={(event) =>
          setStock(event.target.value)
        }
        placeholder="e.g. 5"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
        required
      />
    </div>

    {/* Image */}
    <div className="md:col-span-2">
      <label
        htmlFor="image"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Image URL
      </label>

      <input
        id="image"
        type="url"
        value={image}
        onChange={(event) =>
          setImage(event.target.value)
        }
        placeholder="https://example.com/image.jpg"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
      />
    </div>

    {/* Description */}
    <div className="md:col-span-2">
      <label
        htmlFor="description"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Description
      </label>

      <textarea
        id="description"
        rows={5}
        value={description}
        onChange={(event) =>
          setDescription(
            event.target.value
          )
        }
        placeholder="Describe the gear..."
        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
      />
    </div>
  </div>

  {/* Submit */}
  <div className="mt-8 flex justify-end">
    <button
      type="submit"
      disabled={loading}
      className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}

      {loading
        ? mode === "edit"
          ? "Updating..."
          : "Creating..."
        : mode === "edit"
          ? "Update Gear"
          : "Create Gear"}
    </button>
  </div>
</form>
);
}
