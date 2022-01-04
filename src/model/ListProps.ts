import Order from "./Order";

export interface ListProps {
    page: number;
    search: string;
    pagesize: number;      
    image: string;
    name: string;
    brand: string;
    price: number;
    dataOrder: Order;
}