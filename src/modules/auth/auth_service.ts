import { encrypt, verified } from "../../utils/bcrypt.handle.js";
import { generateToken } from "../../utils/jwt.handle.js";
import User, { IUser } from "../users/user_models.js";
import { Auth } from "./auth_model.js";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Para generar un refresh token único

const registerNewUser = async ({ email, password, name, age }: IUser) => {
    const checkIs = await User.findOne({ email });
    if (checkIs) return "ALREADY_USER";

    // Guardar la contraseña en texto plano (no recomendado)
    const registerNewUser = await User.create({ 
        email, 
        password, // Contraseña en texto plano
        name, 
        age 
    });
    return registerNewUser;
};

const loginUser = async ({ email, password }: Auth) => {
    const checkIs = await User.findOne({ email });
    if (!checkIs) return "NOT_FOUND_USER";

    const passwordHash = checkIs.password; // Contraseña almacenada en texto plano
    const isCorrect = password === passwordHash; // Comparación directa
    if (!isCorrect) return "INCORRECT_PASSWORD";

    const token = generateToken(checkIs.email, { name: checkIs.name }); // Generar el token JWT
    const refreshToken = uuidv4(); // Generar un refresh token único

    // Guardar el refresh token en la base de datos
    checkIs.refreshToken = refreshToken;
    await checkIs.save();

    const data = {
        token,
        refreshToken,
        user: checkIs
    };
    return data;
};
const refreshAccessToken = async (refreshToken: string) => {
    const user = await User.findOne({ refreshToken });
    if (!user) return "INVALID_REFRESH_TOKEN";

    // Generar un nuevo token JWT
    const newToken = generateToken(user.email, { name: user.name }); // Agregar datos adicionales al token
    return { token: newToken };
};

const googleAuth = async (code: string) => {
    try {
        console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
        console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
        console.log("Redirect URI:", process.env.GOOGLE_OAUTH_REDIRECT_URL);
    
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_OAUTH_REDIRECT_URL) {
            throw new Error("Variables de entorno faltantes");
        }

        interface TokenResponse {
            access_token: string;
            expires_in: number;
            scope: string;
            token_type: string;
            id_token?: string;
        }
        //axios --> librería que se utiliza para hacer peticiones HTTP
        const tokenResponse = await axios.post<TokenResponse>('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
            grant_type: 'authorization_code'
        });

        const access_token = tokenResponse.data.access_token;
        console.log("Access Token:", access_token); 
        // Obtiene el perfil del usuario
        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            params: { access_token },
            headers: { Accept: 'application/json' },
        });

        const profile = profileResponse.data as { name: string, email: string; id: string };
        console.log("Access profile:", profile); 
        // Busca o crea el perfil en la base de datos
        let user = await User.findOne({ 
            $or: [{ name: profile.name }, { email: profile.email }, { googleId: profile.id }] 
        });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const passHash = await encrypt(randomPassword);
            user = await User.create({
                name: profile.name,
                email: profile.email,
                googleId: profile.id,
                password: passHash,
            });
        }

        // Genera el token JWT
        const token = generateToken(user.email, { name: user.name });

        console.log(token);
        return { token, user };

    } catch (error: any) {
        console.error('Google Auth Error:', error.response?.data || error.message); // Log detallado
        throw new Error('Error en autenticación con Google');
    }
};

export { registerNewUser, loginUser, refreshAccessToken, googleAuth };