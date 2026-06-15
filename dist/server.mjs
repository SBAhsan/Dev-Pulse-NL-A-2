

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  access_key: process.env.ACCESS_KEY,
  access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refresh_key: process.env.REFRESH_KEY,
  refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(50),
      email VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'contributor',

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      ) 
      `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        reporter_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM users
        `);
  for (let i = 0; i < result.rows.length; i++) {
    delete result.rows[i].password;
  }
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(
    `
        SELECT * FROM users WHERE id=$1
        `,
    [id]
  );
  delete result.rows[0].password;
  return result;
};
var updateUserInDB = async (id, payload) => {
  const { email, password } = payload;
  const result = await pool.query(
    `
        UPDATE users
        SET email=$1, password=$2
        WHERE id=$3
        RETURNING *
        `,
    [email, password, id]
  );
  delete result.rows[0].password;
  return result;
};
var deleteUserFromDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM users
        WHERE id=$1
        `, [id]);
  return result;
};
var userService = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  deleteUserFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDB();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.getSingleUserFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUserInDB(id, req.body);
    if (result.rows[0].length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: {}
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUserFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var userController = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
var authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access!"
        });
      }
      const decodeToken = jwt.verify(
        token,
        config_default.access_key
      );
      const userData = await pool.query(
        `
        SELECT * FROM users
        WHERE email=$1
        `,
        [decodeToken.email]
      );
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      const user = userData.rows[0];
      req.user = user;
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You do not have permission."
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var authMiddleware_default = authMiddleware;

// src/modules/user/user.route.ts
var router = Router();
router.get("/", authMiddleware_default(), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssueInDB = async (reporter_id, payload) => {
  const { title, description, type } = payload;
  const reporterCheck = await pool.query(
    `
        SELECT id FROM users
        WHERE id=$1
        `,
    [reporter_id]
  );
  if (reporterCheck.rows.length === 0) {
    throw new Error("Reporter Does Not Exist");
  }
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, type, reporter_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssuesFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM issues
        `);
  return result;
};
var getSingleIssueFromDB = async (id) => {
  const issueDetails = await pool.query(
    `
        SELECT * FROM issues
        WHERE id=$1
        `,
    [id]
  );
  if (issueDetails.rows.length === 0) {
    throw new Error("Issue not found.");
  }
  const issue = issueDetails.rows[0];
  const reporterDetails = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [issue.reporter_id]
  );
  const reporter = reporterDetails.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssueInDB = async (id, payload) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        UPDATE issues
        SET title=$1, description=$2, type=$3
        WHERE id=$4
        RETURNING *
        `,
    [title, description, type, id]
  );
  return result;
};
var updateIssueStatusInDB = async (id, status) => {
  const allStatus = ["open", "in_progress", "resolved"];
  if (!allStatus.includes(status)) {
    throw new Error("Invalid status");
  }
  const updateStatus = await pool.query(
    `
        UPDATE issues
        SET status=$1
        WHERE id=$2
        RETURNING *
        `,
    [status, id]
  );
  if (updateStatus.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const result = updateStatus.rows[0];
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues
        WHERE id=$1
        `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  updateIssueStatusInDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const result = await issueService.createIssueInDB(
      reporter_id,
      req.body
    );
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issue created successfully",
        data: result.rows
      });
    } else {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Failed creating issue",
        data: {}
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssuesFromDB();
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issues retrieved successfully",
        data: result.rows
      });
    } else {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Failed retrieving issues",
        data: {}
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(id);
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issue retrieved successfully",
        data: result
      });
    } else {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Failed retrieving issue",
        data: {}
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.role === "contributor") {
      const issue = await pool.query(
        `
            SELECT * FROM issues WHERE id=$1
            `,
        [id]
      );
      if (issue.rows[0].status !== "open") {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "This issue is not open"
        });
      }
      if (issue.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "Issue not found"
        });
      }
      if (issue.rows[0].reporter_id !== user.id) {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "You can only update your own issues"
        });
      }
    }
    const result = await issueService.updateIssueInDB(id, req.body);
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issue updated successfully",
        data: result.rows
      });
    } else {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Failed updating issue",
        data: {}
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.updateIssueStatusInDB(
      id,
      req.body.status
    );
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issue status updated successfully",
        data: result
      });
    } else {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Failed updating issue status",
        data: {}
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.deleteIssueFromDB(id);
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issue deleted successfully"
      });
    } else {
      sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Failed deleting issue"
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  updateIssueStatus,
  deleteIssue
};

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", authMiddleware_default("contributor", "maintainer"), issueController.createIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", authMiddleware_default("contributor", "maintainer"), issueController.updateIssue);
router2.patch("/:id/status", authMiddleware_default("maintainer"), issueController.updateIssueStatus);
router2.delete("/:id", authMiddleware_default("maintainer"), issueController.deleteIssue);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";
var createUserInDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserInDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.access_key, {
    expiresIn: config_default.access_token_expires_in
  });
  const refreshToken2 = jwt2.sign(jwtPayload, config_default.refresh_key, {
    expiresIn: config_default.refresh_token_expires_in
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access!");
  }
  const decodeToken = jwt2.verify(
    token,
    config_default.refresh_key
  );
  const userData = await pool.query(
    `
        SELECT * FROM users
        WHERE email=$1
        `,
    [decodeToken.email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found.");
  }
  const user = userData.rows[0];
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.access_key, {
    expiresIn: config_default.access_token_expires_in
  });
  return { accessToken };
};
var authService = {
  createUserInDB,
  loginUserInDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserInDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserInDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Access token generated",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error.detail
    });
  }
};
var authController = {
  createUser,
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/register", authController.createUser);
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
var authRoute = router3;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const log = `Method: ${req.method} | URL: ${req.url} | Time: ${Date.now()}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";

// src/globalErrorHandler/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger_default);
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Everything is okay!"
  });
});
app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  const port = config_default.port;
  initDB();
  app_default.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.mjs.map