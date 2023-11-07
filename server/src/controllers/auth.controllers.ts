import argon2 from "argon2";
import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../db/prisma";
import { AuthInput } from "../types/types";
import authSchema from "../utils/validation";

declare module "express-session" {
	export interface SessionData {
		userId: number;
	}
}

/**
 * @description Employee login
 * @method POST
 * @access public
 * @returns {name, employeeId, message}
 */
export const authLogin: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { employeeId, password }: AuthInput =
			await authSchema.validateAsync(req.body);
		const user = await prisma.user.findUnique({
			where: {
				employeeId,
			},
		});
		if (!user) {
			return next(createHttpError.Unauthorized("User does not exist."));
		}
		const validPassword = await argon2.verify(user.password, password);

		if (!validPassword) {
			return next(createHttpError.Unauthorized("Invalid credentials."));
		}
		req.session.userId = employeeId;
		res.status(200).json({
			name: user.name,
			employeeId: user.employeeId,
			image: user.image,
			role: user.role,
		});
	} catch (error) {
		if (error.isJoi === true) {
			return next(
				createHttpError.BadRequest(`Invalid ${error.details[0].path}`)
			);
		}
		return next(createHttpError.Unauthorized("Invalid credentials."));
	} finally {
		prisma.$disconnect();
	}
};

/**
 * @description Employee Logout
 * @method POST
 * @access public
 * @returns {message}
 */
export const authLogout: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	req.session.destroy((err: any) => {
		if (err) {
			return next(
				createHttpError.InternalServerError(
					"Something went wrong. Please try again."
				)
			);
		} else {
			res.clearCookie("sid");
			res.status(200).json({ message: "Log out successful." });
		}
	});
};

/**
 * @description change password
 * @method POST
 * @access private
 * @returns {message}
 */
export const changePassword: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { oldPassword, newPassword } = req.body;
		const adminId = req.session.userId;

		const admin = await prisma.user.findUnique({
			where: {
				employeeId: adminId,
			},
		});
		if (!admin) {
			return next(createHttpError.Unauthorized("User does not exist."));
		}
		const verifyOldPassword = await argon2.verify(
			admin.password,
			oldPassword
		);
		if (!verifyOldPassword) {
			return next(createHttpError.Unauthorized("Invalid old password."));
		}
		const hashedPassword = await argon2.hash(newPassword);
		const updatedAdmin = await prisma.user.update({
			where: {
				employeeId: adminId,
			},
			data: {
				password: hashedPassword,
			},
		});
		res.status(200).json(updatedAdmin);
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	} finally {
		prisma.$disconnect();
	}
};

/**
 * @description acess employee
 * @method GET
 * @access private
 * @returns {id, name, employeeId}
 */
export const getUser: RequestHandler = async (
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const users = await prisma.user.findMany({});
		if (!users) {
			return next(createHttpError.NotFound("User not found."));
		}

		res.status(200).json(users);
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	} finally {
		prisma.$disconnect();
	}
};

/**
 * @description Employee register
 * @method POST
 * @access public
 * @returns {id, image, name, employeeId, password}
 */
export const authRegister: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { image, name, employeeId, password, role }: AuthInput =
			await authSchema.validateAsync(req.body);
		const userExists = await prisma.user.findUnique({
			where: {
				employeeId,
			},
		});
		if (userExists) {
			return next(createHttpError.Conflict("User already exists."));
		}
		const hashedPassword = await argon2.hash(password);

		const user = await prisma.user.create({
			data: {
				image,
				name: name,
				employeeId: employeeId,
				password: hashedPassword,
				role: role,
			},
		});
		return res.status(200).json(user);
	} catch (error) {
		console.error(error);
		if (error.isJoi === true)
			return next(createHttpError.BadRequest(error.message));
		next(error);
	} finally {
		prisma.$disconnect();
	}
};

export const createGroup: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { name } = req.body;
		const group = await prisma.group.create({
			data: {
				name,
			},
		});
		if (!group) {
			return next(createHttpError.BadRequest("Group not created."));
		}
		res.status(201).json(group);
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	} finally {
		prisma.$disconnect();
	}
};

export const addGroupDirector: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { groupId, groupDirectorId } = req.body;
		const group = await prisma.groupDirector.create({
			data: {
				userId: groupDirectorId,
				groupId,
			},
		});
		if (!group) {
			return next(createHttpError.BadRequest("Group not created."));
		}
		res.status(201).json(group);
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	} finally {
		prisma.$disconnect();
	}
};
