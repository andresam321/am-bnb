const express = require('express')
const { check } = require('express-validator');
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
];


router.get("/current", requireAuth, async (req, res) => {
    const userId = req.user.id;
    let allUserBookings = [];

    const allBookings = await Booking.findAll({
        where: {
        userId,
    },
    include: {
        model: Spot,
        attributes: ["id","ownerId","address","city","state","country",
        "lat","lng","name","price"],
        include: [
        {
            model: SpotImage,
            attributes: ["url"],
        },
        ],
    },
    });
    for (let eachBooking of allBookings) {
    let previewImage;
    if (!eachBooking.Spot.SpotImages.length) {
        previewImage = "No Preview Images";
    } else {
        previewImage = eachBooking.Spot.SpotImages[0].url;
    }

    allUserBookings.push({
        id: eachBooking.id,
        spotId: eachBooking.spotId,
        Spot: {
            id: eachBooking.Spot.id,
        ownerId: eachBooking.Spot.ownerId,
        address: eachBooking.Spot.address,
        city: eachBooking.Spot.city,
        state: eachBooking.Spot.state,
        country: eachBooking.Spot.country,
        lat: parseFloat(eachBooking.Spot.lat),
        lng: parseFloat(eachBooking.Spot.lng),
        name: eachBooking.Spot.name,
        price: parseFloat(eachBooking.Spot.price),
        previewImage,
        },
        userId,
        startDate: new Date(eachBooking.startDate).toLocaleDateString(),
        endDate: new Date(eachBooking.endDate).toLocaleDateString(),
        createdAt: new Date(eachBooking.createdAt).toLocaleString(),
        updatedAt: new Date(eachBooking.updatedAt).toLocaleString(),
    });
    }
    if (!allUserBookings.length)
    allUserBookings.push("You do not have any bookings yet");
    return res.status(200).json({ Bookings: allUserBookings });
});

router.put("/:bookingId", requireAuth, validateDates, async (req, res) => {
    const { user } = req
    const { bookingId } = req.params
    const { startDate, endDate } = req.body
    const currentDate = new Date()

    let editBooking = await Booking.findOne({
        where: { id: bookingId }
    })
    if (!editBooking) return res.status(404).json({ message: "Booking couldn't be found" })
    if (user.id != editBooking.userId) return res.status(403).json({ message: 'Forbidden' })

    if (new Date(startDate) < currentDate || new Date(endDate) < currentDate) {
        return res.status(403).json({
            message: "Past bookings can't be modified"
        })
    }

    // Booking Conflict
    const existBooking = await Booking.findOne({
        where: {
            id: { [Op.ne]: bookingId },
            spotId: editBooking.spotId,
            [Op.and]: [
                { startDate: { [Op.lte]: new Date(endDate) } },
                { endDate: { [Op.gte]: new Date(startDate) } }
            ]
        }
    })

    if (existBooking) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            error: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End Date conflicts with an existing booking"
            }
        })
    }

    startDate ? editBooking.startDate = startDate : editBooking.startDate
    endDate ? editBooking.endDate = endDate : editBooking.endDate

    await editBooking.save()

    return res.json(editBooking)
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