"use client";
import Image from "next/image";
import React, { useState } from "react";
import { IProduct } from "../types/Product";
import { handleBuildImage } from "../utility/handleBuildImage";
import { Trash2 } from "lucide-react";
import { useNavbarContext } from "../context/NavContext";

export const CartProductCard = ({
  product,
  removeFromCart,
}: {
  product: IProduct;
  removeFromCart: (slug: string) => void;
}) => {
  const initialCount = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const cartItems = JSON.parse(storedCart);
      if (cartItems[product.slug]) {
        return cartItems[product.slug];
      }
    }
    return 1;
  };

  const { captureCount, setCaptureCount } = useNavbarContext();
  const [count, setCount] = useState<number>(initialCount);

  const handleCountChange = (operation: "increment" | "decrement") => {
    setCount((prevCount) => {
      let newCount = prevCount;
      if (operation === "increment") {
        newCount = prevCount + 1;
      } else if (operation === "decrement" && prevCount > 1) {
        newCount = prevCount - 1;
      }

      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        if (cartItems[product.slug]) {
          cartItems[product.slug] = newCount;
          localStorage.setItem("cart", JSON.stringify(cartItems));
        }
      }
      return newCount;
    });
    setCaptureCount(!captureCount);
  };

  const price = product.salePrice || product.price;
  const totalPrice = price * count;

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-white p-3.5 shadow-sm">
      {/* Product Image Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-bento/60 p-2">
        <Image
          src={handleBuildImage(
            product?.productImage,
            "/products/edudrop-bottle.webp"
          )}
          alt={product.title}
          fill
          sizes="80px"
          className="object-contain p-1"
        />
      </div>

      {/* Info & Counter */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-text-ink line-clamp-2">
            {product.title}
          </h4>
          <button
            type="button"
            onClick={() => removeFromCart(product.slug)}
            aria-label="Remove item"
            className="text-text-body transition-colors hover:text-red-500 shrink-0 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center rounded-full border border-border-subtle bg-surface-bento px-2 py-1 text-xs font-bold text-text-ink">
            <button
              type="button"
              onClick={() => handleCountChange("decrement")}
              className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-white text-text-ink"
            >
              -
            </button>
            <span className="w-7 text-center">{count}</span>
            <button
              type="button"
              onClick={() => handleCountChange("increment")}
              className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-white text-text-ink"
            >
              +
            </button>
          </div>

          {/* Line Total */}
          <span className="font-display text-base font-bold text-text-ink">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </li>
  );
};

export default CartProductCard;
