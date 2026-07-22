/* ============================================================
   STORE DATA LAYER (Cart Management only)
   ============================================================ */

const CART_KEY = 'omnitrade_cart';

export function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();

  const existing = cart.find(item => item.productId === product.id);
  
  if (existing) {
    if (existing.quantity + quantity > product.stock) {
      throw new Error(`Only ${product.stock} items left in stock`);
    }
    existing.quantity += quantity;
  } else {
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} items left in stock`);
    }
    cart.push({ 
      productId: product.id, 
      quantity, 
      price: product.price, 
      name: product.name, 
      image: product.image 
    });
  }
  saveCart(cart);
}

export function removeFromCart(productId) {
  const cart = getCart();
  saveCart(cart.filter(item => item.productId !== productId));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
