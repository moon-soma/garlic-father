// Lightweight, zero-dependency shopping cart.
// State lives in localStorage so it survives reloads and navigation,
// and changes are broadcast via a window event so the nav badge, the
// product cards and the cart page all stay in sync.

export interface CartItem {
  id: string;        // stable key, e.g. "garlico-original"
  name: string;      // display name, e.g. "Garlico Original"
  price: number;     // unit price in cents
  image: string;     // product image path
  quantity: number;
}

const STORAGE_KEY = 'tgf-cart';
const EVENT = 'cart:change';

const hasWindow = typeof window !== 'undefined';

export function getCart(): CartItem[] {
  if (!hasWindow) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    return [];
  }
}

function isValidItem(i: any): i is CartItem {
  return (
    i &&
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    typeof i.price === 'number' &&
    typeof i.quantity === 'number' &&
    i.quantity > 0
  );
}

function save(items: CartItem[]) {
  if (!hasWindow) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
  const items = getCart();
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ ...item, quantity });
  }
  save(items);
}

export function setQuantity(id: string, quantity: number) {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter((i) => i.id !== id);
  } else {
    const item = items.find((i) => i.id === id);
    if (item) item.quantity = quantity;
  }
  save(items);
}

export function removeItem(id: string) {
  save(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  save([]);
}

export function cartCount(items: CartItem[] = getCart()): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[] = getCart()): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Subscribe to cart changes (also fires for changes in other tabs). Returns an unsubscribe fn. */
export function subscribe(cb: () => void): () => void {
  if (!hasWindow) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
