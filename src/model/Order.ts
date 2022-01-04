import { OrderProduct } from "./OrderProduct";
import { User } from "./User";


export default interface Order {
    id: string;
    userId: string;
    createdAt: string;
    isTemporary: boolean;
}
export interface OrderWithDetail extends Order {
    orderProducts: OrderProduct[];
    user: User;
}