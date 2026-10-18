import {
  ERROR_CODES,
  parseQuantity,
  PRODUCTS,
  getProduct,
  addToCart,
  checkout,
  updateCartQuantity,
  removeFromCart,
  calculateCart,
  formatAUD,
  saveCart,
  loadCart
} from "../src/commerce.js";
import { describe, expect, it } from "vitest";
import { parseQuantity, ERROR_CODES } from "../src/commerce.js";

describe("parseQuantity", () => {
  it.each([
    ["1", 1],
    ["5", 5],
    ["10", 10],
    [" 2 ", 2],
  ])("accepts valid quantity %s", (input, expected) => {
    expect(parseQuantity(input)).toBe(expected);
  });

  it.each([
    "0",
    "-1",
    "1.5",
    "",
    "abc",
    "01",
    "1e2",
    "0x10",
    "+2",
    "11",
    "999999999999999999999999",
  ])("rejects invalid quantity %s", (input) => {
    expect(() => parseQuantity(input)).toThrow(
      ERROR_CODES.INVALID_QUANTITY,
    );
  });

  it("rejects a missing quantity", () => {
    expect(() => parseQuantity(undefined)).toThrow(
      ERROR_CODES.INVALID_QUANTITY,
    );
  });
});


import { PRODUCTS, getProduct } from "../src/commerce.js";

describe("product catalogue", () => {
  it("contains at least eight products across three categories", () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(PRODUCTS.map((p) => p.category)).size).toBe(3);
  });

  it("includes an out-of-stock product", () => {
    expect(PRODUCTS.some((p) => p.stock === 0)).toBe(true);
  });

  it("includes products with stock between one and three", () => {
    expect(PRODUCTS.some((p) => p.stock >= 1 && p.stock <= 3)).toBe(true);
  });

  it("returns a product by ID", () => {
    expect(getProduct("mouse").priceCents).toBe(2995);
  });

  it("returns null for an unknown product", () => {
    expect(getProduct("unknown")).toBeNull();
  });

  it("uses valid prices and stock values", () => {
    for (const product of PRODUCTS) {
      expect(Number.isInteger(product.priceCents)).toBe(true);
      expect(product.priceCents).toBeGreaterThan(0);
      expect(Number.isInteger(product.stock)).toBe(true);
      expect(product.stock).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("cart operations", () => {
  it("adds a product to an empty cart", () => {
    expect(addToCart({}, "mouse", "2")).toEqual({ mouse: 2 });
  });

  it("merges quantities when adding the same product", () => {
    expect(addToCart({ mouse: 2 }, "mouse", "3")).toEqual({ mouse: 5 });
  });

  it("rejects an unknown product", () => {
    expect(() => addToCart({}, "unknown", "1")).toThrow(
      ERROR_CODES.UNKNOWN_PRODUCT,
    );
  });

  it("rejects quantities exceeding available stock", () => {
    expect(() => addToCart({}, "stand", "3")).toThrow(
      ERROR_CODES.INSUFFICIENT_STOCK,
    );
  });

  it("rejects adding an out-of-stock product", () => {
    expect(() => addToCart({}, "pan", "1")).toThrow(
      ERROR_CODES.INSUFFICIENT_STOCK,
    );
  });

  it("updates a cart quantity", () => {
    expect(updateCartQuantity({ mouse: 2 }, "mouse", "4")).toEqual({
      mouse: 4,
    });
  });

  it("removes a product from the cart", () => {
    expect(removeFromCart({ mouse: 2, mug: 1 }, "mouse")).toEqual({
      mug: 1,
    });
  });

  it("calculates totals using catalogue prices", () => {
    const result = calculateCart({ mouse: 2, mug: 1 });

    expect(result.totalCents).toBe(7440);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].unitPriceCents).toBe(2995);
    expect(result.items[0].lineTotalCents).toBe(5990);
  });

  it("rejects unknown products when calculating totals", () => {
    expect(() => calculateCart({ unknown: 1 })).toThrow(
      ERROR_CODES.UNKNOWN_PRODUCT,
    );
  });

  it("does not mutate the original cart when adding an item", () => {
    const original = { mouse: 2 };

    addToCart(original, "mouse", "1");

    expect(original).toEqual({ mouse: 2 });
  });
});

describe("formatAUD", () => {
  it("formats Australian dollar amounts", () => {
    expect(formatAUD(2995)).toBe("$29.95");
    expect(formatAUD(0)).toBe("$0.00");
    expect(formatAUD(100000)).toBe("$1,000.00");
  });

  it("rejects invalid money amounts", () => {
    expect(() => formatAUD(-1)).toThrow(TypeError);
    expect(() => formatAUD(1.5)).toThrow(TypeError);
  });
});

describe("cart persistence", () => {
  function createStorage() {
    const data = new Map();

    return {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
    };
  }

  it("saves and restores a cart", () => {
    const storage = createStorage();

    saveCart(storage, { mouse: 2 });

    expect(loadCart(storage)).toEqual({
      cart: { mouse: 2 },
      notice: "restored",
    });
  });

  it("returns an empty cart when nothing is saved", () => {
    expect(loadCart(createStorage())).toEqual({
      cart: {},
      notice: "empty",
    });
  });

  it("removes unknown products from saved carts", () => {
    const storage = createStorage();

    storage.setItem(
      "commerceflow-cart",
      JSON.stringify({
        version: 1,
        items: { unknown: 2, mouse: 1 },
      }),
    );

    expect(loadCart(storage)).toEqual({
      cart: { mouse: 1 },
      notice: "adjusted",
    });
  });

  it("reduces restored quantities to the product stock limit", () => {
    const storage = createStorage();

    storage.setItem(
      "commerceflow-cart",
      JSON.stringify({
        version: 1,
        items: { stand: 8 },
      }),
    );

    expect(loadCart(storage)).toEqual({
      cart: { stand: 2 },
      notice: "adjusted",
    });
  });

  it("handles invalid saved JSON safely", () => {
    const storage = createStorage();
    storage.setItem("commerceflow-cart", "{invalid");

    expect(loadCart(storage)).toEqual({
      cart: {},
      notice: "invalid",
    });
  });
});