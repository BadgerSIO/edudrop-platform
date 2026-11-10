"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreVertical,
  ExternalLink,
  Edit3,
  Power,
  Trash2,
  Package,
} from "lucide-react";
import { ICategory, IProduct } from "@/app/types/Product";
import { SERVERURL, SERVERURLAPI } from "@/lib/constants";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import { getCookie } from "@/app/utility/handleCookie";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";

const StatusCell = ({ product }: { product: IProduct }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(
    product.status === "active" || (product.active && product.status !== "draft" && product.status !== "archived")
  );

  const toggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    const previousState = isActive;
    setIsActive(!previousState);
    setLoading(true);

    try {
      const jwt = await getCookie("jwt");
      const res = await axios.patch(
        `${SERVERURLAPI}/product/status/${product.slug}`,
        {},
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (res.status === 200) {
        toast.success(`Product ${!previousState ? "activated" : "paused"}`);
        await handleRevalidation("productsCollection");
        router.refresh();
      } else {
        setIsActive(previousState);
        toast.error("Failed to change status");
      }
    } catch (error) {
      setIsActive(previousState);
      toast.error("Failed to change product status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleStatus}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-[0.98] motion-reduce:active:scale-100 ${
        isActive
          ? "border border-surface-forest/20 bg-surface-forest/10 text-surface-forest hover:bg-surface-forest/20"
          : "border border-border-subtle bg-surface-bento/60 text-text-muted hover:bg-surface-bento"
      }`}
      title="Click to toggle status"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-surface-forest" : "bg-gray-400"
        }`}
      />
      <span>{isActive ? "Active" : "Draft / Paused"}</span>
    </button>
  );
};

const ActionsCell = ({ product }: { product: IProduct }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const jwt = await getCookie("jwt");
      const res = await axios.delete(
        `${SERVERURLAPI}/product/${product._id}`,
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (res.status === 200) {
        toast.success("Product moved to archive");
        await handleRevalidation("productsCollection");
        router.refresh();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete product";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-text-muted hover:text-text-ink hover:bg-surface-bento/50 rounded-lg"
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-border-subtle shadow-bento rounded-xl p-1">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-text-muted px-2 py-1.5">
            Product Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border-subtle/80 my-1" />

          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/product-list/${product.slug}`}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-text-ink hover:bg-surface-bento/50 rounded-lg cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-surface-forest" />
              <span>Edit Details</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a
              href={`/products/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-text-ink hover:bg-surface-bento/50 rounded-lg cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
              <span>View in Store</span>
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border-subtle/80 my-1" />

          <DropdownMenuItem asChild>
            <div>
              <CustomAlertDialouge
                triggerText="Archive Product"
                triggerClass="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer text-left"
                alertDescription="Are you sure you want to archive this product? It will be removed from the public catalog."
                onConfirm={handleDelete}
              />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const columns: ColumnDef<IProduct>[] = [
  {
    accessorKey: "productImage",
    header: "Asset",
    cell: ({ row }) => {
      const productImage = row.original.productImage;
      let buildUrl = "/placeholder90.webp";
      if (productImage) {
        buildUrl = productImage.startsWith("http")
          ? productImage
          : `${SERVERURL}${productImage}`;
      }
      return (
        <div className="relative h-11 w-11 rounded-xl border border-border-subtle bg-surface-bento/20 p-1 overflow-hidden flex items-center justify-center">
          <Image
            src={buildUrl}
            alt={row.original.title}
            width={80}
            height={80}
            className="h-full w-full object-contain rounded-lg"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Product Title",
    cell: ({ row }) => (
      <div>
        <p className="text-xs sm:text-sm font-bold text-text-ink line-clamp-1">
          {row.original.title}
        </p>
        <span className="text-[11px] font-mono text-text-muted block mt-0.5">
          /{row.original.slug}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.category as ICategory;
      const catName = typeof cat === "object" && cat !== null ? cat.title : "Uncategorized";
      return (
        <span className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-bento/30 px-2 py-0.5 text-xs font-medium text-text-body">
          {catName}
        </span>
      );
    },
  },
  {
    accessorKey: "packagingType",
    header: "Packaging",
    cell: ({ row }) => (
      <div className="text-xs font-medium text-text-body">
        <span>{row.original.packagingType || "Single"}</span>
        {row.original.packagingType === "Case" && row.original.quantityPerCase ? (
          <span className="text-[11px] text-text-muted block">
            ({row.original.quantityPerCase} units/case)
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Pricing",
    cell: ({ row }) => {
      const price = row.original.price || 0;
      const sale = row.original.sale;
      const salePrice = row.original.salePrice || 0;

      const formatUSD = (val: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(val);

      return (
        <div className="text-xs">
          {sale && salePrice > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-surface-forest">
                {formatUSD(salePrice)}
              </span>
              <span className="text-text-muted line-through text-[11px]">
                {formatUSD(price)}
              </span>
            </div>
          ) : (
            <span className="font-bold text-text-ink">{formatUSD(price)}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Visibility",
    cell: ({ row }) => <StatusCell product={row.original} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
];
