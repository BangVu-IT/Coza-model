import { OrderWithDetail } from "./Order";
import { Product } from "./Product";
import { User } from "./User";

export interface OrderProduct {
    id: string;
    orderId: string;
    idProduct: string;
    quantity: number;
    price: number;
    product?: Product;
    user?: User;
}

export const order: OrderWithDetail = {
    id: "1",
    userId: "1",
    createdAt: "2022-01-02",
    isTemporary: false,
    orderProducts: [
        {
            id: "123",
            orderId: "1",
            idProduct: "1",
            quantity: 1,
            price: 1,
            product: {
                id: "1",
                image: "anh-1",
                name: "Casio 1",
                brand: "casio",
                price: 1,
            }
        }
    ],
    user: {
        id: "1",
        fullName: "bv",
        phoneNumber: 113,
        email: "bv.com",
        address: "bmt",
        postcode: "123qwe"
    }
}