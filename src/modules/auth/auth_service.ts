import { encrypt, verified } from "../../utils/bcrypt.handle.js";
import { generateToken } from "../../utils/jwt.handle.js";
import User, { IUser } from "../users/user_models.js";
import { Auth } from "./auth_model.js";

const registerNewUser = async ({ email, password, name, age }: IUser) => {
    const checkIs = await User.findOne({ email });
    if(checkIs) return "ALREADY_USER";
    const passHash = await encrypt(password);
    const registerNewUser = await User.create({ 
        email, 
        password: passHash, 
        name, 
        age });
    return registerNewUser;
};

const loginUser = async ({ email, password }: Auth) => {
    const checkIs = await User.findOne({ email });
    if(!checkIs) return "NOT_FOUND_USER";

    const passwordHash = checkIs.password; //El encriptado que viene de la bbdd
    const isCorrect = await verified(password, passwordHash);
    if(!isCorrect) return "INCORRECT_PASSWORD";

    const token = generateToken(checkIs.email);
    const data = {
        token,
        user: checkIs
    }
    return data;
};

export { registerNewUser, loginUser };