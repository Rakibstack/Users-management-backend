import type { Request, Response } from "express";
import userService from "./user.service";

const createUser = async (req: Request, res: Response) => {
  //   const { name, age, email, password } = req.body;

  try {
    const result = await userService.createUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User Created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    // console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUserFromDB();
    res.status(200).json({
      success: true,
      message: "user retrive successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

  const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await userService.getSinglUserFromDB(id as string)

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

  const updateUser =  async (req: Request, res: Response) => {
  const { id } = req.params;

  try {

     const result = await userService.updateUserIntoDB(id as string,req.body)
  
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}

  const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await userService.deleteUserFromDB(id as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const userController = {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser
};

export default userController;
