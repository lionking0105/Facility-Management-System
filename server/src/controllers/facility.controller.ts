import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import { BookingInput } from "src/types/types";
import prisma from "../db/prisma";

/**
 * @description Get all approved bookings
 * @method GET
 * @access private
 * @returns [bookings]
 */
export const getBookings: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const facilitySlug = req.params.slug;
		const events = await prisma.booking.findMany({
			where: {
				facility: {
					slug: facilitySlug,
				},
				OR: [
					{ status: "APPROVED_BY_FM" },
					{ status: "APPROVED_BY_ADMIN" },
				],
			},
			orderBy: {
				startTime: "desc", // Or 'desc' for descending order
			},
			include: {
				requestedBy: {
					select: {
						name: true,
						employeeId: true,
					},
				},
			},
		});
		res.status(200).json(events);
	} catch (error) {
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	}
};

/**
 * @description Book a slot
 * @method POST
 * @access private
 * @returns {booking}
 */
export const addBookings: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			title,
			slug,
			purpose,
			color,
			date,
			startTime,
			endTime,
		}: BookingInput = req.body;
		const facilitySlug = req.params.slug;
		const employeeId = req.session.userId;
		const event = await prisma.booking.create({
			data: {
				title,
				slug,
				purpose,
				date,
				color,
				startTime,
				endTime,
				requestedBy: { connect: { employeeId } },
				facility: { connect: { slug: facilitySlug } },
			},
		});
		if (!event) {
			return next(
				createHttpError.InternalServerError(
					"Something went wrong. Please try again."
				)
			);
		}
		res.status(201).json(event);
	} catch (error) {
		console.error(error);
		if (error instanceof PrismaClientValidationError) {
			return next(createHttpError.BadRequest("Missing data fields."));
		}
		if (error.code === "P2002") {
			return next(
				createHttpError.Conflict(
					`Field ${error.meta.target} must be unique.`
				)
			);
		}
		return next(
			createHttpError.InternalServerError(
				"Something went wrong. Please try again."
			)
		);
	}
};
