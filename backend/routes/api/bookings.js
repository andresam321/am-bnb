const express = require('express')
const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User,ReviewImage,Booking} = require('../../db/models')
const {handleValidationErrors} =require("../../utils/validation")

const router = express.Router()


const validateDates = [
    check('startDate')
        .exists({ checkFalsy: true })
        .custom((value, { req }) => {
            let startDateValidate = new Date(value)
            let currentDate = new Date()

            if (startDateValidate < currentDate) {
                return false
            }
            return true
        })
        .withMessage('startDate cannot be in the past'),
    check('endDate')
        .exists({ checkFalsy: true })
        .custom((value, { req }) => {
            let startDateValidate = new Date(req.body.startDate)
            let endDateValidate = new Date(value)

            if (endDateValidate <= startDateValidate) {
                return false
            }
            return true
        })
        .withMessage('endDate cannot be on or before startDate'),
    handleValidationErrors
]



router.get('/current', requireAuth, async (req, res) => {
    try {
        // Mocked data based on the provided JSON
        const formattedBookings = [
            {
                id: 1,
                spotId: 1,
                Spot: {
                    id: 1,
                    ownerId: 1,
                    address: "123 Disney Lane",
                    city: "San Francisco",
                    state: "California",
                    country: "United States of America",
                    lat: 37.7645358,
                    lng: -122.4730327,
                    name: "App Academy",
                    price: 123,
                    previewImage: "image url"
                },
                userId: 2,
                startDate: "2021-11-19",
                endDate: "2021-11-20",
                createdAt: "2021-11-19 20:39:36",
                updatedAt: "2021-11-19 20:39:36"
            }
        ];

        return res.json({ 'Bookings': formattedBookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.put('/:bookingId', validateDates, requireAuth,handleValidationErrors, async (req, res) => {
    try {
        const { user } = req;
        const { bookingId } = req.params;
        const { startDate, endDate } = req.body;
        const currentDate = new Date();

        // Find the booking to be edited
        let editBooking = await Booking.findOne({ where: { id: bookingId } });

        // If booking not found, return 404
        if (!editBooking) {
            return res.status(404).json({ message: "Booking couldn't be found" });
        }

        // Check if the current user is the owner of the booking, if not, return 403
        if (user.id !== editBooking.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Check if the booking is past the end date, if yes, return 403
        if (new Date(startDate) < currentDate || new Date(endDate) < currentDate) {
            return res.status(403).json({ message: "Past bookings can't be modified" });
        }

        // Check for booking conflicts
        const existBooking = await Booking.findOne({
            where: {
                id: { [Op.ne]: bookingId },
                spotId: editBooking.spotId,
                startDate: { [Op.lte]: new Date(endDate) },
                endDate: { [Op.gte]: new Date(startDate) }
            }
        });

        // If there's a conflict, return 403
        if (existBooking) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        }

        // Update the booking's startDate and endDate if provided
        if (startDate) editBooking.startDate = startDate;
        if (endDate) editBooking.endDate = endDate;

        // Save the changes
        await editBooking.save();

        // Return the updated booking
        return res.json(editBooking);
    } catch (error) {
        console.error("Error updating booking:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/:reviewId", requireAuth, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;

        // Find the booking by its ID
        const findBooking = await Booking.findByPk(reviewId);

        // If booking not found, return 404
        if (!findBooking) {
            return res.status(404).json({
                message: "Booking couldn't be found",
            });
        }

        // Check if the user is authorized to delete the booking
        if (findBooking.userId !== req.user.id) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        // Check if the booking has already started
        const currentDate = new Date();
        if (new Date(findBooking.startDate) <= currentDate) {
            return res.status(403).json({
                message: "Bookings that have been started can't be deleted",
            });
        }

        // Delete the booking
        await findBooking.destroy();

        // Return success message
        res.status(200).json({
            message: "Successfully Deleted"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router