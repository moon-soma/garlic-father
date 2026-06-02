import { useState } from 'react';
import { addItem } from '../lib/cart';

type Flavor = 'original' | 'spicy' | 'tangy';

interface Props {
  id: string;
  name: string;
  flavor: Flavor;
  flavorLabel: string;
  tagline: string;
  image: string;
  price: number; // cents
  size: string;  // e.g. "12 oz pouch"
}

export default function ProductCard({ id, name, flavor, flavorLabel, tagline, image, price, size }: Props) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ id, name: `${name} · ${size}`, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="product-card">
      <div className="product-card-img">
        <img src={image} alt={name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <span className={`flavor-tab ${flavor}`} style={{ alignSelf: 'flex-start' }}>{flavorLabel}</span>
        <div className="product-name">{name}</div>
        <div className="product-tagline">{tagline}</div>
        <div className="product-size">{size}</div>
        <div className="product-price">${(price / 100).toFixed(2)}</div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleAdd}
          aria-live="polite"
        >
          {added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Added
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
