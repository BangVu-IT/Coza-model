import express, { Request, Response } from 'express';
import { pool } from '../connect-db/Client';
import { ListProps } from '../model/ListProps';

const jwt = require("jsonwebtoken");

class UserService {

    getMeService = async (userId: string) => {
        const userInfo = await pool.query(`select * from "user" where user_id = '${userId}'`);
        return userInfo.rows[0];
    }

    userLoginService = async (req: Request, res: Response) => {
        const listProps: ListProps = req.body;
        const { userName, passWord } = listProps
        const checkAccount = await pool.query(`select user_id from "user" where "user_name" = '${userName}' and "pass_word" = '${passWord}'`);

        if (checkAccount.rows[0] !== undefined) {
            const token = jwt.sign(checkAccount.rows[0], process.env.SECRET_TOKEN, { expiresIn: '2h' });
            res.header("Authorization", token).send(token);
        } else {
            res.status(401).send("Wrong input information!");
        }
    }

}

export const userService = new UserService();