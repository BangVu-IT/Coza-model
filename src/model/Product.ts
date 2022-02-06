
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
export interface ProductLine {
    id: string;
    imageProduct: string;
    name: string;
    brandId: string;
    brand: string;
    gender: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductWithDetail extends ProductLine {
    productItem: Product[];
}

