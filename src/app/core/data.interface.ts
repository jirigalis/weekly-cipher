export interface User {
    id: number;
    name: string;
}

export interface LoggedUser {
    name: string;
    token: string;
    id?: number;
}

export interface Cipher {
    id?: number;
    number: number;
    name: string;
    active: number;
    created: Date;
    realSolution: string;
    image: string;
}

export interface Solution {
    id: number;
    userId: number;
    cipherId: number;
    solution: string;
}

export interface Result {
    name: string;
    count: number;
    position: number;
}
