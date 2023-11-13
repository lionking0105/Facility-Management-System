import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../db/prisma";

/**
 * @description Get all facilities
 * @method GET
 * @access private
 * @returns [{name, employeeId, role}, [facilities]]
 */
export const getFacilities: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const facilities = await prisma.facility.findMany({
			where: {
				isActive: true,
			},
			include: {
				facilityManager: {
					select: {
						user: {
							select: {
								name: true,
								employeeId: true,
							},
						},
					},
				},
			},
		});
		if (!facilities) {
			return next(
				createHttpError.NotFound(
					"Something went wrong. Please try again."
				)
			);
		}
		res.status(200).json({ facilities });
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	}
};

export const getCount: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let count = null;
		const employeeId = parseInt(req.params.employeeId);
		const user = await prisma.user.findUnique({
			where: {
				employeeId,
			},
		});

		if (!user) {
			return next(createHttpError.NotFound("User does not exist."));
		}

		if (user?.role === "GROUP_DIRECTOR") {
			count = await prisma.booking.count({
				where: {
					AND: [
						{
							groupId: user.groupId!,
						},
						{
							status: "PENDING",
						},
					],
				},
			});
		}

		if (user?.role === "FACILITY_MANAGER") {
			const facility = await prisma.facilityManager.findUnique({
				where: {
					userId: user.id,
				},
				select: {
					facilityId: true,
				},
			});

			count = await prisma.booking.count({
				where: {
					AND: [
						{
							facilityId: facility?.facilityId,
						},
						{
							status: "APPROVED_BY_GD",
						},
					],
				},
			});
		}

		res.status(200).json({ count });
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	}
};
