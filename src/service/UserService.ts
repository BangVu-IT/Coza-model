import express, { Request, Response } from "express";
import { pool } from "../connect-db/Client";
import { ListProps } from "../model/ListProps";
import { UserItem } from "../model/UserItem";

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

class UserService {
  getUserListService = async () => {
    const data = await pool.query(`select * from "user" u`);
    return data.rows;
  };

  addUserService = async (user: UserItem) => {
    await pool.query(`INSERT INTO public."user"
        (user_id, full_name, user_name, pass_word, phone_number, email, address, post_code, "role")
        VALUES('${user.user_id}', '${user.full_name}', '${user.user_name}', '${user.pass_word}', '${user.phone_number}', '${user.email}', '${user.address}', '${user.post_code}', '${user.role}');`);
  };

  updateUserService = async (user: UserItem) => {
    await pool.query(`UPDATE public."user"
        SET full_name='${user.full_name}', user_name='${user.user_name}', pass_word='${user.pass_word}', phone_number='${user.phone_number}', email='${user.email}', address='${user.address}', post_code='${user.post_code}', "role"='${user.role}'
        WHERE user_id='${user.user_id}'`);
  };

  deleteUserService = async (id: string) => {
    await pool.query(`DELETE FROM public."user" WHERE user_id='${id}'`);
  };

  getMeService = async (userId: string) => {
    const userInfo = await pool.query(
      `select * from "user" where user_id = '${userId}'`
    );
    return userInfo.rows[0];
  };

  userLoginService = async (req: Request, res: Response) => {
    const listProps: ListProps = req.body;
    const { userName, passWord } = listProps;
    const checkAccount = await pool.query(
      `select u.user_id, u."role" from "user" u where "user_name" = '${userName}' and "pass_word" = '${passWord}'`
    );

    if (checkAccount.rows[0] !== undefined) {
      const token = jwt.sign(checkAccount.rows[0], process.env.SECRET_TOKEN, {
        expiresIn: "2h",
      });
      res.header("Authorization", token).send(token);
    } else {
      res.status(401).send("Wrong input information!");
    }
  };

  registerService = async (req: Request, res: Response) => {
    const listProps: ListProps = req.body;
    const { fullName, userName, passWord, role } = listProps;

    const userId = uuidv4();

    await pool.query(`INSERT INTO public."user"
    (user_id, full_name, user_name, pass_word, phone_number, email, address, post_code, "role")
    VALUES('${userId}', '${fullName}', '${userName}', '${passWord}', '', '', '', '', '${role}')`);

    const token = jwt.sign({user_id: userId, role: role}, process.env.SECRET_TOKEN, {
      expiresIn: "2h",
    });
    res.header("Authorization", token).send(token);
  };
}

export const userService = new UserService();
