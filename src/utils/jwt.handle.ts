import pkg from "jsonwebtoken";
const { sign, verify } = pkg; // Importamos las funciones sign y verify de la librería jsonwebtoken
const JWT_SECRET = process.env.JWT_SECRET || "token.010101010101";

// Generar un token JWT con datos adicionales
const generateToken = (id: string, additionalData: Record<string, any> = {}) => {
    const jwt = sign(
        { id, ...additionalData }, // Incluimos el ID y los datos adicionales en el payload
        JWT_SECRET,
        { expiresIn: '20s' } // Tiempo de expiración del token
    );
    return jwt;
};

// Verificar un token JWT
const verifyToken = (jwt: string) => {
    try {
        const isOk = verify(jwt, JWT_SECRET);
        return isOk;
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return null; // Retorna null si el token no es válido
    }
};

export { generateToken, verifyToken };