import Order from "./Order";

export interface ListProps {
    userId: string;
    imageProduct: string;
    name: string;
    brand: string;
    brandId: string;
    gender: string;
    colorId: string;
    color: string;
    sizeId: string;
    size: string;
    image: string;
    price: number;
    quantity: number;
    dataOrder: Order;
    userName: string;
    passWord: string;
    page: number;
    rowsPerPage: number;
    orderId: string;
    orderStatus: string;
}

export interface ProductLineBody {    
    imageProduct: string;
    name: string;    
    brandId: string;
    gender: string;
    sold: number;
}

export interface ProductList {
    page: number;
    inputSearch: string;
    rowsPerPage: number;
    category: string;
    priceValue1: number;
    priceValue2: number;
    gender: string;
    sortPrice: string;
}

export interface OrderProductCart {
    orderId: string;
    idProductItem: string;
    image: string;
    name: string;
    brand: string;
    gender: string;
    colorId: string;
    sizeId: string;      
    price: number;
    quantity: number;
}

export interface UserOrderInfo {
    orderId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    postCode: string;
    orderStatus: string;
}