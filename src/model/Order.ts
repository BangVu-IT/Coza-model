// export interface Cart {
//     cart_id: string;
//     image: string;
//     name: string;    
//     price: number;
//     quantily: number;
// }
export interface Order {
    createat: number;
    fullname: string;
    phonenumber: number;
    email: string;
    address: string;
    postcode: string;
    cart_id: string;
    image: string;
    name: string;    
    price: number;
    quantity: number;
}