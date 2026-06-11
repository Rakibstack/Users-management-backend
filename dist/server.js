import { createRequire } from "module";
    const require = createRequire(import.meta.url);

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connecting_string: process.env.CONNECTING_STRING,
  port: process.env.PORT,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  jwt_refresh_secret_key: process.env.JWT_REFRESH_SECRET_KEY,
  expire_time: process.env.EXPIRE_TIME
};
var env_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: env_default.connecting_string
});
var initDB = async () => {
  try {
    await pool.query(
      `
        CREATE TABLE IF NOT EXISTS  users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_Active BOOLEAN DEFAULT true,
        role VARCHAR(10) DEFAULT 'user',
        age INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()  
        )
        `
    );
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles(
      id SERIAL PRIMARY KEY,
      user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      address TEXT,
      phone VARCHAR(15),
      gender VARCHAR(10),

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Table created successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
var createUserIntoDB = async (payload) => {
  const { name, age, email, password, role } = payload;
  const hashPass = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
       INSERT INTO users(name,age,email,password,role) VALUES($1,$2,$3,$4,COALESCE($5,'user'))
       RETURNING *
 
     `,
    [name, age, email, hashPass, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUserFromDB = async () => {
  const result = await pool.query(`
 
          SELECT * FROM users
  `);
  result.rows.forEach((user) => delete user.password);
  return result;
};
var getSinglUserFromDB = async (id) => {
  const result = await pool.query(
    `
        SELECT * FROM users WHERE id=$1
        `,
    [id]
  );
  const user = result.rows[0];
  delete user.password;
  return user;
};
var updateUserIntoDB = async (id, payload) => {
  const { name, age, email, password, role } = payload;
  const result = await pool.query(
    `
               UPDATE users
               SET
               name = COALESCE($1, name),
               age = COALESCE($2, age),
               email = COALESCE($3, email),
               password = COALESCE($4, password),
               role = COALESCE($5, role),
               updated_at = NOW()
                
                 WHERE id = $6 RETURNING *
        `,
    [name, age, email, password, role, id]
  );
  const user = result.rows[0];
  delete user.password;
  return user;
};
var deleteUserFromDB = async (id) => {
  const result = await pool.query(
    `
            DELETE FROM users WHERE id = $1
        `,
    [id]
  );
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSinglUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB
};
var user_service_default = userService;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await user_service_default.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User Created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUser = async (req, res) => {
  try {
    const result = await user_service_default.getAllUserFromDB();
    res.status(200).json({
      success: true,
      message: "user retrive successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await user_service_default.getSinglUserFromDB(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "user retrive successfully",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await user_service_default.updateUserIntoDB(id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await user_service_default.deleteUserFromDB(id);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser
};
var user_controller_default = userController;

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "unauthorized access!"
        });
        return;
      }
      const decoded = jwt.verify(
        token,
        env_default.jwt_secret_key
      );
      const userData = await pool.query(
        `
       SELECT * FROM users WHERE email = $1 
        `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User Not Found"
        });
        return;
      }
      const user = userData.rows[0];
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden Access!"
        });
        return;
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden Access!"
        });
        return;
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var user_Role = {
  admin: "admin",
  agent: "agent"
};

// src/modules/user/user.route.ts
var route = Router();
route.post("/", user_controller_default.createUser);
route.get(
  "/",
  auth_default(user_Role.admin, user_Role.agent),
  user_controller_default.getAllUser
);
route.get("/:id", user_controller_default.getSingleUser);
route.put("/:id", user_controller_default.updateUser);
route.delete("/:id", user_controller_default.deleteUser);
var userRoute = route;

// src/modules/profile/profile.route.ts
import { Router as Router2 } from "express";

// src/modules/profile/profile.service.ts
var createProfileIntoDB = async (payload) => {
  const { user_id, bio, address, phone, gender } = payload;
  const User = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
        `,
    [user_id]
  );
  if (User.rows.length === 0) {
    throw new Error("user not found!");
  }
  const result = await pool.query(
    `
       INSERT INTO profiles(user_id, bio, address, phone, gender) VALUES($1,$2,$3,$4,$5) RETURNING *
        `,
    [user_id, bio, address, phone, gender]
  );
  return result;
};
var profileService = {
  createProfileIntoDB
};

// src/modules/profile/profile.controller.ts
var createProfile = async (req, res) => {
  try {
    const result = await profileService.createProfileIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var profileController = {
  createProfile
};

// src/modules/profile/profile.route.ts
var route2 = Router2();
route2.post("/", profileController.createProfile);
var profileRoute = route2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var logginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userExist = await pool.query(
    `   
        SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (userExist.rows.length === 0) {
    throw new Error("User Not Found");
  }
  const user = userExist.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("invalid credentials");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, env_default.jwt_secret_key, {
    expiresIn: env_default.expire_time
  });
  const refreshToken2 = jwt2.sign(jwtPayload, env_default.jwt_refresh_secret_key, {
    expiresIn: env_default.expire_time
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("unauthorized access!");
  }
  const decoded = jwt2.verify(
    token,
    env_default.jwt_refresh_secret_key
  );
  const userData = await pool.query(
    `
       SELECT * FROM users WHERE email = $1 
        `,
    [decoded.email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User Not Found");
  }
  const user = userData.rows[0];
  if (!user.is_active) {
    throw new Error("Forbidden Access!");
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active
  };
  const accessToken = jwt2.sign(jwtPayload, env_default.jwt_secret_key, {
    expiresIn: env_default.expire_time
  });
  return { accessToken };
};
var authService = {
  logginUserIntoDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var logginUser = async (req, res) => {
  try {
    const result = await authService.logginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      httpOnly: true,
      secure: false,
      // Set to true in production
      sameSite: "lax"
      // Adjust as needed (e.g., "strict" or "none")
    });
    res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken
    );
    res.status(200).json({
      success: true,
      message: "Refresh token generated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  logginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router = Router3();
router.post("/login", authController.logginUser);
router.post("/refresh-token", authController.refreshToken);
var authRoute = router;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `
method ->${req.method}  Uri -> ${req.url} Time -> ${Date.now()}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(logger_default);
app.get("/", (req, res) => {
  res.send("Hello World!!");
});
app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(env_default.port, () => {
    console.log(`express server connected on  ${env_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map