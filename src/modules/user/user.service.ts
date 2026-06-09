import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (payload: IUser) => {

  const { name, age, email, password } = payload;

  const hashPass = await bcrypt.hash(password,10)
  const result = await pool.query(
    `
       INSERT INTO users(name,age,email,password) VALUES($1,$2,$3,$4)
       RETURNING *
 
     `,
    [name, age, email, hashPass],
  );

  delete result.rows[0].password
  return result;
};

const getAllUserFromDB = async () => {
  const result = await pool.query(`
 
          SELECT * FROM users
  `);
   result.rows.forEach((user) => delete user.password);
  return result;
};

const getSinglUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM users WHERE id=$1
        `,
    [id],
  );
  delete result.rows[0].password;
  return result;
};
const updateUserIntoDB = async (id: string, payload : IUser) => {

    const {name, age, email, password,} = payload

    const result = await pool.query(
    `
               UPDATE users
               SET
               name = COALESCE($1, name),
               age = COALESCE($2, age),
               email = COALESCE($3, email),
               password = COALESCE($4, password),
               updated_at = NOW()
                
                 WHERE id = $5 RETURNING *
        `,
    [name, age, email, password, id],
  );
  delete result.rows[0].password; 
  return result;
};

 const deleteUserFromDB = async (id: string) => {

    const result = await pool.query(
        `
            DELETE FROM users WHERE id = $1
        `,
        [id]
    );
    return result;
};

const userService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSinglUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB
};

export default userService;
