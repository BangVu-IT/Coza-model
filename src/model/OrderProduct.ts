import { Product } from "./Product";

export interface OrderProduct {
    cartId: string;
    orderId: string;
    idProductItem: string;
    image: string;
    name: string;
    brand: string;
    gender: string;
    colorId: string;
    sizeId: string;
    quantity: number;
    price: number;
    product?: Product;
}