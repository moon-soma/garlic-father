import { useEffect, useState } from 'react';
import {
  getCart,
  setQuantity,
  removeItem,
  subscribe,
  cartSubtotal,
  type CartItem,
} from '../lib/cart';
import { shippingFor, FREE_SHIPPING_THRESHOLD } from '../lib/shipping';

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(getCart());
    setHydrated(true);
    return subscribe(() => setItems(getCart()));
  }, []);

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  async function checkout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch {
      setError('Something went wrong starting checkout. Please try again.');
      setLoading(false);
    }
  }

  // Avoid a flash of "empty cart" before localStorage is read.
  if (!hydrated) return <div className="cart-empty"><p>Loading your cart…</p></div>;

  if (!items.length) {
    return (
      <div className="cart-empty">
        <div className="check-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some garlickin' good pouches to get started.</p>
        <a href="/#products" className="btn btn-primary">Shop Pouches</a>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-items">
        {items.map((i) => (
          <div className="cart-item" key={i.id}>
            <div className="cart-item-img">
              <img src={i.image} alt={i.name} loading="lazy" />
            </div>
            <div className="cart-item-info">
              <div className="cart-item-name">{i.name}</div>
              <div className="cart-item-price">{fmt(i.price)} each</div>
              <button className="cart-item-remove" onClick={() => removeItem(i.id)}>Remove</button>
            </div>
            <div className="cart-item-controls">
              <div className="qty-stepper">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(i.id, i.quantity - 1)}>−</button>
                <span>{i.quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity(i.id, i.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-subtotal">{fmt(i.price * i.quantity)}</div>
            </div>
          </div>
        ))}
      </div>

      <aside className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
        </div>
        {remaining > 0 && (
          <div className="summary-note">Add {fmt(remaining)} more for free shipping 🧄</div>
        )}
        <div className="summary-row summary-total">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
        <button className="btn btn-primary btn-full" onClick={checkout} disabled={loading}>
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity=".3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Processing…
            </>
          ) : 'Checkout'}
        </button>
        {error && <div className="summary-error">{error}</div>}
        <a href="/#products" className="cart-continue">← Continue shopping</a>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </aside>
    </div>
  );
}
