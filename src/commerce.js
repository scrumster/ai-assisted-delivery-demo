export const MAX_QUANTITY = 10;

export const ERROR_CODES = {
  UNKNOWN_PRODUCT: "ERR_UNKNOWN_PRODUCT",
  INVALID_QUANTITY: "ERR_INVALID_QUANTITY",
  INSUFFICIENT_STOCK: "ERR_INSUFFICIENT_STOCK",
  EMPTY_CART: "ERR_EMPTY_CART",
  ORDER_REFERENCE: "ERR_ORDER_REFERENCE",
};

export function parseQuantity(value) {
  const text = String(value ?? "").trim();

  if (!/^[1-9][0-9]*$/.test(text)) {
    throw new Error(ERROR_CODES.INVALID_QUANTITY);
  }

  const quantity = Number(text);

  if (!Number.isSafeInteger(quantity)) {
    throw new Error(ERROR_CODES.INVALID_QUANTITY);
  }

  if (quantity > MAX_QUANTITY) {
    throw new Error(ERROR_CODES.INVALID_QUANTITY);
  }

  return quantity;
}

export const PRODUCTS = [
  { id: "mouse", name: "Wireless Mouse", category: "Home Office", priceCents: 2995, stock: 25 },
  { id: "lamp", name: "Desk Lamp", category: "Home Office", priceCents: 4950, stock: 10 },
  { id: "stand", name: "Laptop Stand", category: "Home Office", priceCents: 6900, stock: 2 },
  { id: "mug", name: "Ceramic Mug", category: "Kitchen", priceCents: 1450, stock: 40 },
  { id: "knife", name: "Chef's Knife", category: "Kitchen", priceCents: 8995, stock: 5 },
  { id: "pan", name: "Cast Iron Pan", category: "Kitchen", priceCents: 5500, stock: 0 },
  { id: "bottle", name: "Insulated Bottle", category: "Outdoors", priceCents: 3495, stock: 18 },
  { id: "headlamp", name: "Camping Headlamp", category: "Outdoors", priceCents: 2250, stock: 3 },
  { id: "blanket", name: "Picnic Blanket", category: "Outdoors", priceCents: 3999, stock: 12 },
];

export function getProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}


export function addToCart(cart, productId, quantity) {
  const product = getProduct(productId);

  if (!product) {
    throw new Error(ERROR_CODES.UNKNOWN_PRODUCT);
  }

  const parsedQuantity = parseQuantity(quantity);
  const existingQuantity = cart[productId] ?? 0;
  const newQuantity = existingQuantity + parsedQuantity;

  if (newQuantity > Math.min(MAX_QUANTITY, product.stock)) {
    throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
  }

  return {
    ...cart,
    [productId]: newQuantity,
  };
}

export function updateCartQuantity(cart, productId, quantity) {
  const product = getProduct(productId);

  if (!product) {
    throw new Error(ERROR_CODES.UNKNOWN_PRODUCT);
  }

  const parsedQuantity = parseQuantity(quantity);

  if (parsedQuantity > Math.min(MAX_QUANTITY, product.stock)) {
    throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
  }

  return {
    ...cart,
    [productId]: parsedQuantity,
  };
}

export function removeFromCart(cart, productId) {
  const updatedCart = { ...cart };
  delete updatedCart[productId];
  return updatedCart;
}

export function calculateCart(cart) {
  const items = [];
  let totalCents = 0;

  for (const [productId, quantity] of Object.entries(cart)) {
    const product = getProduct(productId);

    if (!product) {
      throw new Error(ERROR_CODES.UNKNOWN_PRODUCT);
    }

    const parsedQuantity = parseQuantity(quantity);

    if (parsedQuantity > Math.min(MAX_QUANTITY, product.stock)) {
      throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
    }

    const lineTotalCents = product.priceCents * parsedQuantity;
    totalCents += lineTotalCents;

    items.push({
      productId,
      name: product.name,
      quantity: parsedQuantity,
      unitPriceCents: product.priceCents,
      lineTotalCents,
    });
  }

  return { items, totalCents };
}

const REFERENCE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateOrderReference(existingReferences, randomBytes) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = randomBytes(8);

    if (
      !bytes ||
      bytes.length !== 8 ||
      Array.from(bytes).some(
        (byte) => !Number.isInteger(byte) || byte < 0 || byte > 255,
      )
    ) {
      throw new Error(ERROR_CODES.ORDER_REFERENCE);
    }

    const suffix = Array.from(
      bytes,
      (byte) => REFERENCE_ALPHABET[byte & 31],
    ).join("");

    const reference = `CF-${suffix}`;

    if (!existingReferences.has(reference)) {
      return reference;
    }
  }

  throw new Error(ERROR_CODES.ORDER_REFERENCE);
}

export function checkout(cart, inventory, options = {}) {
  if (!cart || Object.keys(cart).length === 0) {
    throw new Error(ERROR_CODES.EMPTY_CART);
  }

  const { items, totalCents } = calculateCart(cart);

  // Validate every item before changing inventory.
  for (const item of items) {
    const available = inventory[item.productId];

    if (!Number.isSafeInteger(available) || available < item.quantity) {
      throw new Error(ERROR_CODES.INSUFFICIENT_STOCK);
    }
  }

  const existingReferences = options.existingReferences ?? new Set();
  const randomBytes =
    options.randomBytes ??
    ((length) => {
      const bytes = new Uint8Array(length);

      if (!globalThis.crypto?.getRandomValues) {
        throw new Error(ERROR_CODES.ORDER_REFERENCE);
      }

      globalThis.crypto.getRandomValues(bytes);
      return bytes;
    });

  const reference = generateOrderReference(
    existingReferences,
    randomBytes,
  );

  const updatedInventory = { ...inventory };

  for (const item of items) {
    updatedInventory[item.productId] -= item.quantity;
  }

  return {
    order: {
      reference,
      status: "Confirmed",
      items,
      totalCents,
    },
    inventory: updatedInventory,
  };
}

export function formatAUD(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new TypeError("Invalid money amount");
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function saveCart(storage, cart) {
  const safeCart = {};

  for (const [productId, quantity] of Object.entries(cart)) {
    if (!getProduct(productId)) {
      throw new Error(ERROR_CODES.UNKNOWN_PRODUCT);
    }

    safeCart[productId] = parseQuantity(quantity);
  }

  storage.setItem(
    "commerceflow-cart",
    JSON.stringify({ version: 1, items: safeCart }),
  );
}

export function loadCart(storage) {
  const raw = storage.getItem("commerceflow-cart");

  if (!raw) {
    return { cart: {}, notice: "empty" };
  }

  try {
    const saved = JSON.parse(raw);

    if (
      saved?.version !== 1 ||
      !saved.items ||
      typeof saved.items !== "object" ||
      Array.isArray(saved.items)
    ) {
      throw new Error("Invalid saved cart");
    }

    const cart = {};
    let changed = false;

    for (const [productId, quantity] of Object.entries(saved.items)) {
      const product = getProduct(productId);

      if (!product) {
        changed = true;
        continue;
      }

      try {
        const parsedQuantity = parseQuantity(quantity);
        const limit = Math.min(MAX_QUANTITY, product.stock);

        if (limit === 0) {
          changed = true;
          continue;
        }

        cart[productId] = Math.min(parsedQuantity, limit);

        if (cart[productId] !== parsedQuantity) changed = true;
      } catch {
        changed = true;
      }
    }

    return {
      cart,
      notice: changed ? "adjusted" : "restored",
    };
  } catch {
    return { cart: {}, notice: "invalid" };
  }
}