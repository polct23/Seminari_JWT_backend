import mongoose from "mongoose";
import { Auth } from "../auth/auth_model.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            required: true,
            type: String
        },
        password: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            default: '0'
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        googleId: { 
            type: String 
        },
        refreshToken: { 
            type: String // Nuevo campo para almacenar el refresh token
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

export interface IUser extends Auth {
    name: string;
    age: number;
    password: string;
    email: string;
    googleId: string;
    refreshToken?: string; // Nuevo campo en la interfaz
}

const User = mongoose.model('User', userSchema);
export default User;