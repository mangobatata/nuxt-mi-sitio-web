export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  tags: string[];
  status: "draft" | "active" | "archived";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProductChange {
  id: number;
  productId: number | null;
  productName: string;
  action: "created" | "updated" | "deleted";
  changes: Record<string, unknown>;
  createdAt: string | Date;
}
