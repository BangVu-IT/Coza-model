export interface Cart {
    id: string;
    image: string;
    name: string;    
    price: number;
    quantily: number;
}

export interface Order {
    idOrder: string;
    createdAt: number;
    fullname: string;
    phonenumber: number;
    email: string;
    address: string;
    postcode: string;
    cart: Cart;
}