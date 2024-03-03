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
        .isAfter(new Date().toISOString())
        .withMessage('startDate cannot be in the past'),
    check('endDate')
        .exists({ checkFalsy: true })
        .custom((value, { req }) => {
            return new Date(value) > new Date(req.body.startDate);
        })
        .withMessage('endDate cannot be on or before startDate'),
    handleValidationErrors
];


router.get('/current', requireAuth,handleValidationErrors, async (req, res) => {
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
        
    }
});

router.put("/:bookingId", requireAuth, validateDates, async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.body;
    const { bookingId } = req.params;
    const today = new Date();

    const userBooking = await Booking.findByPk(bookingId);
    if (!userBooking)
        return res.status(404).json({ message: "Booking couldn't be found" });

    if (userBooking.userId !== userId)
        return res.status(403).json({ message: "Forbidden" });

    if (today > userBooking.endDate)
        return res.status(403).json({ message: "Past bookings can't be modified" });

    if (startDate && endDate) {
        const conflictingBookings = await Booking.findOne({
        where: {
            spotId: userBooking.spotId,
            [Op.or]: [
            // Finding booking dates with startDate between old Booking booking timeline
            {
                startDate: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
            // Finding booking dates with endDate between old Booking booking timeline
            {
                endDate: { [Op.between]: [new Date(startDate), new Date(endDate)] },
            },
            {
                [Op.and]: [
                // Finding startDate before AND endDate after
                { startDate: { [Op.lte]: new Date(startDate) } },
                { endDate: { [Op.gte]: new Date(endDate) } },
                ],
            },
            ],
            id: { [Op.not]: bookingId },
        },
        });

    if (conflictingBookings) {
        return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
            errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking",
            },
        });
        }
    }

    if (startDate)
        userBooking.startDate = new Date(startDate).toLocaleDateString();
    if (endDate) userBooking.endDate = new Date(endDate).toLocaleDateString();
    userBooking.updatedAt = new Date().toLocaleString();
    userBooking.createdAt = new Date().toLocaleString();

    await userBooking.save();
    return res.status(200).json(userBooking);
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
        
    }
});

module.exports = router