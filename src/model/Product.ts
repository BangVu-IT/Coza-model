
export interface Product {
    productItemId: string;
    productId: string;
    image: string;
    colorId: string;
    color: string;
    sizeId: string;
    size: string;
    price: number;
    quantity: number;
}

export interface Brand {
    brandId: string;
    brand: string;
}

export interface ProductLine {
    id: string;
    imageProduct: string;
    name: string;
    brandId: string;
    brand: string;
    gender: string;
    createdAt: string;
    updatedAt: string;
    sold: number;
}

export interface ProductWithDetail extends ProductLine {
    productItem: Product[];
}

