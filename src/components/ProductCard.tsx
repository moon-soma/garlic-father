import { useState } from 'react';

interface Variant {
  label: string;
  className: string;
}

interface Size {
  label: string;
  price: number;
  priceId: string;
}

interface Props {
  name: string;
  tagline: string;
  image: string;
  variants: Variant[];
  sizes: Size[];
}

export default function ProductCard({ name, tagline, image, variants, sizes }: Props) {
  const [flavor, setFlavor] = useState(0);
  const [size, setSize] = useState(0);
  const [loading, setLoading] = useState(false);

  const selected = sizes[size];

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: `${name} — ${variants[flavor].label}`,
          size: selected.label,
          price: selected.price,
          image,
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="product-card">
      <div className="product-card-img">
        <img src={image} alt={`${name} ${variants[flavor].label}`} loading="lazy" />
      </div>
      <div className="product-card-body">
        <div className="product-name">{name}</div>
        <div className="product-tagline">{tagline}</div>

        <div className="flavor-tabs">
          {variants.map((v, i) => (
            <button
              key={v.label}
              className={`flavor-tab ${i === flavor ? v.className : 'inactive'}`}
              onClick={() => setFlavor(i)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="size-pills">
          {sizes.map((s, i) => (
            <button
              key={s.label}
              className={`size-pill${i === size ? ' active' : ''}`}
              onClick={() => setSize(i)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="product-price">${(selected.price / 100).toFixed(2)}</div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleBuy}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity=".3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Processing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Buy Now
            </>
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
