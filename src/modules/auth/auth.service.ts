import { pool } from "../../db";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import config from "../../config/env";

const logginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userExist = await pool.query(
    `   
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  if(userExist.rows.length === 0){
    throw new Error('User Not Found')
  }
  const user = userExist.rows[0]

    const matchPassword =await bcrypt.compare(password,user.password)

    if(!matchPassword){
        throw new Error('invalid credentials')
    }

    const jwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        is_active: user.is_active
    }

      const accessToken = jwt.sign(jwtPayload,config.jwt_secret_key,{expiresIn : '1d'})

      return { accessToken }
};

export const authService = {
  logginUserIntoDB,
};
