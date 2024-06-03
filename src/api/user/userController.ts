import { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import userSchema from "./userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { STATUS } from "@prisma/client";
import { SECRET } from "../../config/secrets.js";
import { generatePassword } from "../../util/generateor.js"
import { sendEmail } from "../../util/emailSender.js";

const userController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    const data = userSchema.register.parse(req.body);
    //check if the email  exist
    const isUserExist = await prisma.users.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (isUserExist) {
      return res.status(404).json({
        success: false,
        message: "email is used before",
      });
    }
    const password = bcrypt.genSaltSync(10, req.body.password);

    const newUser = await prisma.users.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        password: password,
        activeStatus: STATUS.ACTIVE,
      },
    });

    return res.status(200).json({
      success: true,
      message: "user created successfully",
      data: newUser,
    });
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    const data = userSchema.login.parse(req.body);
    const user = await prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (!bcrypt.compareSync(data.password, user.password)) {
      return res.status(404).json({
        success: false,
        message: "password is incorrect",
      });
    }
    if (user.activeStatus != STATUS.ACTIVE) {
      return res.status(404).json({
        success: false,
        message: "user is not active",
      });
    }
    const payload = {
      id: user.id,
      firstName: user.firstName,
    };
    const token = await jwt.sign(payload, SECRET!);

    return res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: user,
      token: token,
    });
  },
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    const data = userSchema.changePassword.parse(req.body);
    if (data.password != data.cpassword) {
      return res.status(404).json({
        success: false,
        message: "password not match",
      });
    }

    const password = bcrypt.genSaltSync(10, req.body.password);
    const updateUser = await prisma.users.update({
      where: {
        id: req.user!.id,
      },
      data: {
        password: password,
      },
    });

    return res.status(200).json({
      success: true,
      message: "password updated successfully",
      data: updateUser,
    });
  },
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = await prisma.users.findFirst({
      where: {
        id: +id,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    req.body.password = generatePassword();
    const password = bcrypt.genSaltSync(10, req.body.password);

    const updateUser = await prisma.users.update({
      where: {
        id: +id,
      },
      data: {
        password: password,
      },
    });
    await sendEmail(user.email, req.body.password);
    return res.status(200).json({
      success: true,
      message: "password updated successfully",
    });
  },
  changeStatus: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = await prisma.users.findFirst({
      where: {
        id: +id,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    const updateUser = await prisma.users.update({
      where: {
        id: +id,
      },
      data: {
        activeStatus: req.body.activeStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: "status updated successfully",
      data: updateUser,
    });
  },
};
export default userController;
