import { OrderProduct } from "./OrderProduct";
import { User } from "./User";

export default interface Order {
    orderId: string;
    userId: string;
    createdAt: string;
    isTemporary: boolean;
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    postCode: string;
    orderStatus: string;
}
export interface OrderWithDetail extends Order {
    orderProducts: OrderProduct[];
}