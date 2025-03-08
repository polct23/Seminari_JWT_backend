import { Request, Response } from "express";
import { registerNewUser, loginUser } from "../auth/auth_service.js";

const registerCtrl = async ({body}: Request, res: Response) => {
    try{
        const responseUser = await registerNewUser(body);
        res.json(responseUser);
    } catch (error: any){
        res.status(500).json({ message: error.message });
    }
};



const loginCtrl = async ({body}: Request, res: Response) => {
    try{
        const {email, password} = body;
        const responseUser = await loginUser({email, password});

        if(responseUser === 'INCORRECT_PASSWORD'){
            res.status(403);
            res.json(responseUser);
        } else {
            res.json(responseUser);
        }
    } catch (error: any){
        res.status(500).json({ message: error.message });
    }
};

export { registerCtrl, loginCtrl };