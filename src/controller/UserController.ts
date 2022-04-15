import express, { Request, Response } from 'express';
import { UserItem } from '../model/UserItem';
import { userService } from '../service/UserService';

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

class UserController {

    getListUser = async (req: Request, res: Response) => {
        return res.json(await userService.getUserListService());
    }

    addUser = async (req: Request, res: Response) => {
        const { full_name, user_name, pass_word, phone_number, email, address, post_code, role } = req.body.user
        const newUser: UserItem = {
            user_id: uuidv4(),
            full_name: full_name,
            user_name: user_name,
            pass_word: pass_word,
            phone_number: phone_number,
            email: email,
            address: address,
            post_code: post_code,
            role: role,
        }        
        
        return res.json(await userService.addUserService(newUser));
    }

    updateUser = async (req: Request, res: Response) => {
        const { user_id, full_name, user_name, pass_word, phone_number, email, address, post_code, role } = req.body.user
        const newUser: UserItem = {
            user_id: user_id,
            full_name: full_name,
            user_name: user_name,
            pass_word: pass_word,
            phone_number: phone_number,
            email: email,
            address: address,
            post_code: post_code,
            role: role,
        }
        
        return res.json(await userService.updateUserService(newUser));
    }

    deleteUser = async (req: Request, res: Response) => {
        return res.json(await userService.deleteUserService(req.params.id));
    }

    userLogin = async (req: Request, res: Response) => {
        return res.json(await userService.userLoginService(req, res));
    }

    register = async (req: Request, res: Response) => {
        return res.json(await userService.registerService(req, res));
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