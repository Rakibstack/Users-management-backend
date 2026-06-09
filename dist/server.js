import express, {} from "express";
import { Pool } from "pg";
import config from "./config/env";
const app = express();
const port = config.port;
const pool = new Pool({
    connectionString: config.connecting_string
});
const initDB = async () => {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(20) NOT NULL,
        is_Active BOOLEAN DEFAULT true,
        age INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()  
        )
        `);
        console.log("Table created successfully");
    }
    catch (error) {
        console.log(error);
    }
};
initDB();
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Hello World!!");
});
app.post("/api/users", async (req, res) => {
    const { name, age, email, password } = req.body;
    try {
        const result = await pool.query(`
      INSERT INTO users(name,age,email,password) VALUES($1,$2,$3,$4)
      RETURNING *

    `, [name, age, email, password]);
        res.status(201).json({
            success: true,
            message: "User Created successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        // console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query(`

          SELECT * FROM users
        `);
        res.status(200).json({
            success: true,
            message: "user retrive successfully",
            data: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.get("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "user retrive successfully",
            data: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, age, email, password } = req.body;
    try {
        const result = await pool.query(`
               UPDATE users
               SET
               name = COALESCE($1, name),
               age = COALESCE($2, age),
               email = COALESCE($3, email),
               password = COALESCE($4, password),
                updated_at = NOW()
                
                 WHERE id = $5 RETURNING *
        `, [name, age, email, password, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=server.js.map