const express = require('express')
const { check, query} = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User,ReviewImage,Booking} = require('../../db/models')
const {handleValidationErrors} =require("../../utils/validation")

const router = express.Router();


const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .isLength({ min: 2 })
        .withMessage('Street address is required'),
    check('state')
        .exists({ checkFalsy: true })
        .isLength({ min: 2 })
        .withMessage('Street address is required'),
    check('country')
        .exists({ checkFalsy: true })
        .isLength({ min: 3 })
        .withMessage('Street address is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .exists({ checkFalsy: true })
        .withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be within -180 and 180'),
    check('name')
        .exists({ checkFalsy: true })
        .withMessage('Name is required')
        .isLength({ max: 49 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .isLength({ min: 3 })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .isFloat({ gt: 0 })
        .withMessage('Price per day must be a positive number'),
];

const validateReview = [
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    check('review')
        .exists({ checkFalsy: true })
        .isLength({ min: 1 })
        .withMessage('Review text is required'),
];

const validateQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be greater than or equal to 1"),
    query('size')
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be greater than or equal to 1"),
    query('maxLat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Maximum latitude is invalid'),
    query('minLat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Minimum latitude is invalid'),
    query('minLng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Minimum longitude is invalid'),
    query('maxLng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Maximum longitude is invalid'),
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be greater than or equal to 0'),
    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be greater than or equal to 0'),
];




router.get('/', validateQuery,handleValidationErrors, async (req, res) => {
    try {

        let {page,size,minLat,maxLat,minLng,maxLng,minPrice,maxPrice} = req.query

        page = parseInt(page) || 1
        size = parseInt(size) || 20

        if (page > 10) page = 10
        if (size > 20) size = 20

        let pagObj = {
            limit: size,
            offset: size * (page - 1)
        }


        let searchObj = {
            where:{}
        }

    if (minLat && maxLat) {
        searchObj.where.lat = { [Op.between]: [minLat, maxLat] }
    } else if (minLat) {
        searchObj.where.lat = { [Op.gte]: minLat }
    } else if (maxLat) {
        queryObj.where.lat = { [Op.lte]: maxLat }
    }

    if (minLng && maxLng) {
        searchObj.where.lng = { [Op.between]: [minLng, maxLng] }
    } else if (minLng) {
        searchObj.where.lng = { [Op.gte]: minLng }
    } else if (maxLng) {
        searchObj.where.lng = { [Op.lte]: maxLng }
    }

    if (minPrice && maxPrice) {
        searchObj.where.price = { [Op.between]: [minPrice, maxPrice] }
    } else if (minPrice) {
        searchObj.where.price = { [Op.gte]: minPrice }
    } else if (maxPrice) {
        searchObj.where.price = { [Op.lte]: maxPrice }
    }


        const spots = await Spot.findAll({
            ...pagObj,
            ...searchObj
        });

        const listOfSpots = [];

    
        for (const spot of spots) {
            // Calculate the total stars and total reviews for the spot
            const totalStars = await Review.sum('stars', { where: { spotId: spot.id } });
            const totalReviews = await Review.count({ where: { spotId: spot.id } });

            // Calculate the average star rating for the spot
            let avgRating;
                if (totalReviews > 0) {
                    avgRating = totalStars / totalReviews;
                    } else {
                    avgRating = 0;
                }

            // Determine the preview image URL for the spot
            let previewImage = 'No image provided';
            if (spot.SpotImage && spot.SpotImage.PreviewImage) {
                previewImage = spot.SpotImage.PreviewImage.url;
            }

            // Create a new object representing the transformed spot
            const transformedSpot = {
                id: spot.id,
                ownerId: spot.ownerId,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: spot.lat,
                lng: spot.lng,
                name: spot.name,
                description: spot.description,
                price: spot.price,
                createdAt: spot.createdAt,
                updatedAt: spot.updatedAt,
                avgRating, // Include the average rating
                previewImage
            };

            // Add the transformed spot to the list of spots
            listOfSpots.push(transformedSpot);
        }

        // Send the list of transformed spots as a JSON response
        res.status(200).json({ Spots: listOfSpots, page:+page,
            size:+size  });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error fetching spots:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.get('/current', async (req, res) => {
    try {
        // Fetch all spots from the database
        const spots = await Spot.findAll({
            where: { ownerId: req.user.id }
        });

        // Initialize an array to store the transformed spots
        const listOfSpots = [];

        // Iterate through each spot
        for (const spot of spots) {
            // Calculate the total stars and total reviews for the spot
            const totalStars = await Review.sum('stars', { where: { spotId: spot.id } });
            const totalReviews = await Review.count({ where: { spotId: spot.id } });

            // Calculate the average star rating for the spot
            let avgRating;
                if (totalReviews > 0) {
                    avgRating = totalStars / totalReviews;
                    } else {
                    avgRating = 0;
                }

            // Determine the preview image URL for the spot
            let previewImage = 'No image provided';
            if (spot.SpotImage && spot.SpotImage.PreviewImage) {
                previewImage = spot.SpotImage.PreviewImage.url;
            }

            // Create a new object representing the transformed spot
            const transformedSpot = {
                id: spot.id,
                ownerId: spot.ownerId,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: spot.lat,
                lng: spot.lng,
                name: spot.name,
                description: spot.description,
                price: spot.price,
                createdAt: spot.createdAt,
                updatedAt: spot.updatedAt,
                avgRating, // Include the average rating
                previewImage
            };

            // Add the transformed spot to the list of spots
            listOfSpots.push(transformedSpot);
        }

        // Send the list of transformed spots as a JSON response
        res.status(200).json(
            { 
            Spots: listOfSpots,
            });
    
        } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error fetching spots:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get('/:spotId', async (req, res) => {


const getAvgRating = (reviews) => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, curr) => acc + curr.stars, 0);
        return sum / reviews.length;
    };

// const getAvgRating = (reviews) => {
//         if (reviews.length === 0) {
//             return 0;
//         } else {
//             let sum = 0;
//             for (let i = 0; i < reviews.length; i++) {
//                 sum += reviews[i].stars;
//             }
//             return sum / reviews.length;
//         }
//     }
    
const getReviewlength = (reviews) => {
        if (reviews.length) return 0
        return reviews.length
    }


    const spots = await Spot.findAll({
        where: {
            ownerId: req.params.spotId
        },
        include: [
            {
                model: Review
            },
            {
                attributes: ['id', 'url', 'preview'],
                model: SpotImage,
                as:"SpotImage"
            },
            {
                attributes: ['id', 'firstName', 'lastName'],
                model: User
            }
        ]
    })

    if(!spots.length){
        res.status(404)
        return res.json({message: "Spot couldn't be found"})
    } 

    const resSpot = spots.map(spot => ({
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        numReviews: getAvgRating(spot.Reviews),
        avgRating: getReviewlength(spot.Reviews),
        SpotImages: spot.SpotImages,
        Owner: spot.User
    }));

    return res.json(resSpot)
})

router.post('/', requireAuth, validateSpot,handleValidationErrors, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description } = req.body

    const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description
    })

    res.status(201)
    res.json(newSpot)
})

router.post("/:spotId/images",requireAuth, async (req, res) => {
    try {
        // Extract spotId from request parameters
        const spotId = req.params.spotId;
        
        // Extract image URL and preview flag from request body
        const { url, preview } = req.body;

        
        const spot = await Spot.findByPk(spotId);

        // Check if the spot exists
        if (!spot) {
            return res.status(404).json({
                message: "Spot not found",
            });
        }

        // Check if the logged-in user is the owner of the spot
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }

        // Create a new image for the spot
        const addedImage = await SpotImage.create({
            spotId,
            url,
            preview
        });

        // Respond with the newly added image, excluding createdAt and updatedAt
        res.status(200).json({
            id: addedImage.id,
            url: addedImage.url,
            preview: addedImage.preview
        });

    } catch (error) {
        // If an error occurs during the image addition process, respond with a 404 status code
        res.status(404).json({ message: "Spot couldn't be found" });
    }
});

router.put('/:spotId', requireAuth, validateSpot, handleValidationErrors, async (req, res) => {
    const spotId = req.params.spotId;
    const { address, city, state, country, lat, lng, name, description } = req.body;

    // Check if the spot exists
    let spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({ error: "Spot not found" });
    }

    // Check if the user is authorized to update the spot
    if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
    }

    // Update the spot
    await spot.update({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description
    });

    res.status(200).json(spot);
});


router.delete("/:spotId", requireAuth,handleValidationErrors, async(req,res) =>{
    const spotId = req.params.spotId

    let deleteSpot = await Spot.findByPk(spotId)

    if (!deleteSpot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
        });
    }

    if (deleteSpot.ownerId !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }


    await deleteSpot.destroy()

    res.status(200).json({
        message: "Successfully deleted",
    });

})

//Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId)
    if (!spot) {
        res.status(404)
        return res.json({ message: "Spot couldn't be found" })
    }

    const allreviews = await Review.findAll({
        where: { spotId: req.params.spotId },
        include: [
            { model: User },
            { model: ReviewImage, attributes: ["id", "url"] }
        ]
    })


    return res.json({ Reviews: allreviews })
});

router.post('/:spotId/reviews', requireAuth, validateReview,handleValidationErrors, async(req, res) => {
    try {
        const { review, stars } = req.body;
        const userId = req.user.id;
        const spotId = parseInt(req.params.spotId);

        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const existingReview = await Review.findOne({
            where: {
                spotId: spotId,
                userId: userId
            }
        });

        if (existingReview) {
            return res.status(400).json({ message: "User already has a review for this spot" });
        }

        const newReview = await Review.create({
            userId: userId,
            spotId: spotId,
            review: review,
            stars: stars
        });

        return res.status(201).json(newReview);
    } catch (error) {
        // Handle any unexpected errors
        console.error("Error creating review:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    try {
        const { user } = req;
        const spotId = parseInt(req.params.spotId);

        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: `Spot couldn't be found` });
        }

        let bookings = null;

        if (spot.ownerId === user.id) {
            // If the logged-in user is the owner of the spot
            bookings = await Booking.findAll({
                where: { spotId: spotId },
                include: {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            });

            // Rearrange the bookings array to include the User information at the top
            bookings = bookings.map(booking => ({
                User: {
                    id: booking.User.id,
                    firstName: booking.User.firstName,
                    lastName: booking.User.lastName
                },
                ...booking.toJSON() // Spread the remaining booking properties
            }));
        } else {
            // If the logged-in user is not the owner of the spot
            bookings = await Booking.findAll({
                where: { spotId: spotId },
                attributes: ['spotId', 'startDate', 'endDate']
            });
        }

        return res.status(200).json({ Bookings: bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/:spotId/bookings", requireAuth, async (req, res) => {
    try {
        const { user } = req;
        const spotId = req.params.spotId;
        const { startDate, endDate } = req.body;

        // Find the spot by its id
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Check if the spot belongs to the current user
        if (user.id === spot.ownerId) return res.status(403).json({ message: 'Forbidden' })

        // Validate the request body
        const errors = {};
        if (!startDate || new Date(startDate) < new Date()) {
            errors.startDate = "startDate cannot be in the past";
        }
        if (!endDate || new Date(endDate) <= new Date(startDate)) {
            errors.endDate = "endDate cannot be on or before startDate";
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: "Bad Request", errors });
        }

        // Check for booking conflicts
        const existingBooking = await Booking.findOne({
            where: {
                spotId: spotId,
                [Op.or]: [
                    { startDate: { [Op.between]: [startDate, endDate] } },
                    { endDate: { [Op.between]: [startDate, endDate] } }
                ]
            }
        });

        if (existingBooking) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        }

        // Create a new booking
        const newBooking = await Booking.create({
            spotId: spotId,
            userId: user.id,
            startDate: startDate,
            endDate: endDate
        });

        return res.status(200).json(newBooking);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




module.exports = router