import { useState, useEffect } from "react";

export default function DataDebug() {
  const [courts, setCourts] = useState(null);
  const [members, setMembers] = useState(null);
  const [coaches, setCoaches] = useState(null);
  const [products, setProducts] = useState(null);
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const endpoints = [
      { url: "/api/courts", setter: setCourts, name: "Courts" },
      { url: "/api/members", setter: setMembers, name: "Members" },
      { url: "/api/coaches", setter: setCoaches, name: "Coaches" },
      { url: "/api/products", setter: setProducts, name: "Products" },
      { url: "/api/assets", setter: setAssets, name: "Assets" },
    ];

    Promise.all(
      endpoints.map(({ url, setter }) =>
        fetch(`${url}`)
          .then(r => r.json())
          .then(setter)
          .catch(e => console.error(`Error loading ${url}:`, e))
      )
    ).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Debug Info</h1>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Courts" data={courts} />
        <Section title="Members" data={members} />
        <Section title="Coaches" data={coaches} />
        <Section title="Products" data={products} />
        <Section title="Assets" data={assets} />
      </div>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-bold text-lg mb-2">{title}</h2>
      {!data ? (
        <div className="text-red-500 text-sm">⚠️ Failed to load</div>
      ) : Array.isArray(data) && data.length === 0 ? (
        <div className="text-amber-600 text-sm">⚠️ No data in table</div>
      ) : (
        <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
          ✓ {Array.isArray(data) ? data.length : "Error"} records
        </div>
      )}
      {Array.isArray(data) && data.length > 0 && (
        <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(data[0], null, 2)}
        </pre>
      )}
    </div>
  );
}

