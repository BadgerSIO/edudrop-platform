"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { IProductWithQuantity } from "../types/Product";
import axios from "axios";
import { SERVERURLAPI } from "@/lib/constants";

interface NavbarContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isScrolling: boolean;
  setIsScrolling: React.Dispatch<React.SetStateAction<boolean>>;
  distinctProductCount: number;
  setDistinctProductCount: React.Dispatch<React.SetStateAction<number>>;
  cartProducts: IProductWithQuantity[]; // Use the new interface for cart products
  setCartProducts: React.Dispatch<React.SetStateAction<IProductWithQuantity[]>>;
  subtotal: number;
  setSubtotal: React.Dispatch<React.SetStateAction<number>>;
  captureCount: boolean;
  setCaptureCount: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavbarContext = createContext<NavbarContextProps | undefined>(
  undefined,
);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [distinctProductCount, setDistinctProductCount] = useState(0);
  const [cartProducts, setCartProducts] = useState<any[]>([]); // Use correct type for products
  const [subtotal, setSubtotal] = useState<number>(0);
  const [captureCount, setCaptureCount] = useState(false);
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (!storedCart) {
      setDistinctProductCount(0);
      setCartProducts([]);
      setSubtotal(0);
      return;
    }
    const cartItems = JSON.parse(storedCart);
    if (Object.keys(cartItems).length === 0) {
      setDistinctProductCount(0);
      setCartProducts([]);
      setSubtotal(0);
      return;
    }
    const productSlugs = Object.keys(cartItems);
    const fetchAllProducts = async () => {
      try {
        const allProducts = await fetchProductsBySlugs(productSlugs);
        const productsWithQuantity = allProducts.map((product: any) => ({
          ...product,
          quantity: cartItems[product.slug],
        }));

        setCartProducts(productsWithQuantity);

        const total = productsWithQuantity.reduce(
          (
            acc: number,
            product: {
              price: number;
              sale: boolean;
              salePrice: number;
              quantity: number;
            },
          ) => {
            const priceToUse = product.sale ? product.salePrice : product.price;
            return acc + priceToUse * product.quantity;
          },
          0,
        );
        setSubtotal(total);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAllProducts();
  }, [isCartOpen, captureCount]);

  const fetchProductsBySlugs = async (slugs: string[]) => {
    try {
      const response = await axios.post(
        `${SERVERURLAPI}/product/productsBySlugs`,
        slugs,
      );
      if (response.status === 200) {
        return response?.data?.data;
      }
    } catch (error) {
      return console.error(error);
    }
  };
  return (
    <NavbarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isCartOpen,
        setIsCartOpen,
        isScrolling,
        setIsScrolling,
        distinctProductCount,
        setDistinctProductCount,
        cartProducts,
        setCartProducts,
        subtotal,
        setSubtotal,
        captureCount,
        setCaptureCount,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbarContext = (): NavbarContextProps => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbarContext must be used within a NavbarProvider");
  }
  return context;
};
