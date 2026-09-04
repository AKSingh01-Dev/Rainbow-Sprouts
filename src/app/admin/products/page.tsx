"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
};

const emptyForm = { name: "", description: "", price: "", stock: "0", imageUrl: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price / 100),
      stock: String(p.stock),
      imageUrl: p.imageUrl || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save() {
    setLoading(true);
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      price: Math.round(Number(form.price) * 100), // rupees -> paise
      stock: Number(form.stock),
      imageUrl: form.imageUrl || undefined,
    };
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save product. Check the fields and try again.");
      return;
    }
    resetForm();
    load();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this product? This can't be undone.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid sm:grid-cols-3 gap-8">
      <div className="sm:col-span-1">
        <h2 className="text-lg mb-4">{editingId ? "Edit product" : "Add product"}</h2>
        <div className="card space-y-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input" placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input className="input" placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          {error && <p className="text-rust text-sm">{error}</p>}
          <div className="flex gap-2">
            <button className="btn-primary flex-1" disabled={loading || !form.name || !form.price} onClick={save}>
              {loading ? "Saving…" : editingId ? "Save changes" : "Add product"}
            </button>
            {editingId && (
              <button className="btn-secondary" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <h2 className="text-lg mb-4">All products</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="status-pill bg-line" onClick={() => toggleActive(p)}>
                    {p.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="whitespace-nowrap">
                  <button className="text-brass text-sm mr-3" onClick={() => startEdit(p)}>Edit</button>
                  <button className="text-rust text-sm" onClick={() => remove(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
