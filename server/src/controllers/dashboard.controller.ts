import { CancellationStatus } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../db/prisma";

declare module "express-session" {
	export interface SessionData {
		userId: number;
	}
}

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
		const employeeId = parseInt(req.params.employeeId);

		const user = await prisma.user.findUnique({
			where: {
				employeeId,
			},
			select: {
				name: true,
				employeeId: true,
				role: true,
				image: true,
			},
		});

		if (!user) {
			return next(createHttpError.NotFound("User does not exist."));
		}

		req.session.userId = user.employeeId;

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
		res.status(200).json({ user, facilities });
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
		let count = {};
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
			const approvalCount = await prisma.booking.count({
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
			const cancellationCount = await prisma.booking.count({
				where: {
					AND: [
						{
							groupId: user.groupId!,
						},
						{
							cancellationStatus: CancellationStatus.PENDING,
						},
					],
				},
			});

			count = {
				approvalCount,
				cancellationCount,
			};
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

			const approvalCount = await prisma.booking.count({
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
			const cancellationCount = await prisma.booking.count({
				where: {
					AND: [
						{
							facilityId: facility?.facilityId,
						},
						{
							cancellationStatus:
								CancellationStatus.APPROVED_BY_GD,
						},
					],
				},
			});

			count = {
				approvalCount,
				cancellationCount,
			};
		}

		res.status(200).json(count);
	} catch (error) {
		console.error(error);
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	}
};
