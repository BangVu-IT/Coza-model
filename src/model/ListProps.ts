import { Cart, Order } from "./Order";

export interface ListProps {
    page: number;
    search: string;
    pagesize: number;
    idProduct: string;
    image: string;
    name: string;
    brance: string;
    price: number;
    // idOrder: string;
    // fullname: string;
    // phonenumber: number;
    // email: string;
    // address: string;
    // postcode: string;
    // cart: Cart[];
    dataOrder: Order;
}