import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.handle.js";
import { JwtPayload } from "jsonwebtoken";

interface RequestExt extends Request {
    user?: string | JwtPayload;
}

const checkJwt = (req: RequestExt, res: Response, next: NextFunction) => {

    try{
        const jwtByUser = req.headers.authorization || null;
        const jwt = jwtByUser?.split(' ').pop(); // ['Bearer', '11111'] -> ['11111']
        const isUser = verifyToken(`${jwt}`);
        if(!isUser){
            res.status(401);
            res.send("NO_TIENES_UN_JWT_VALIDO")
        } else {
            req.user = isUser;
            next();
        }
        
    } catch(e) {
        console.log({ e });
        res.status(400);
        res.send("SESSION_NO_VALID");
    }
};

export { checkJwt };