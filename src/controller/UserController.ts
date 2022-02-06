import express, { Request, Response } from 'express';
import { userService } from '../service/UserService';

const jwt = require("jsonwebtoken");

class UserController {

    userLogin = async (req: Request, res: Response) => {
        return res.json(await userService.userLoginService(req, res));
    }

    getMe = async (req: Request, res: Response) => {
        const token = req.header('Authorization');    
        if (!token) return res.status(401).json("Please login to use this function!");
        try {
            const id = jwt.verify(token, process.env.SECRET_TOKEN);
            return res.json(await userService.getMeService(id.user_id));
        } catch (error) {

        }
    }

}

export const userController = new UserController();