const express = require('express')
const { check, query} = require('express-validator');
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
    check("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be greater than or equal to 1"),
    check("size")
        .optional()
        .isInt({ min: 1, max: 20 }) // Add max validation
        .withMessage("Size must be greater than or equal to 1, and less than or equal to 20"), // Add custom error message
    check("minLat")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Minimum latitude is invalid"),
    check("maxLat")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Maximum latitude is invalid"),
    check("minLng")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Maximum longitude is invalid"),
    check("maxLng")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Minimum longitude is invalid"),
    check("minPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Minimum price must be greater than or equal to 0"),
    check("maxPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Maximum price must be greater than or equal to 0"),
    handleValidationErrors,
];




router.get('/', validateQuery, async (req, res) => {
    try {

        let {page,size,minLat,maxLat,minLng,maxLng,minPrice,maxPrice} = req.query

        if (!page || isNaN(parseInt(page)) || page > 10) page = 1;
        if (!size || isNaN(parseInt(size)) || size > 20) size = 20;

        
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
            include:[
                {
                    model: Review,
                    attributes: ["stars"],
                },
                {
                    model: SpotImage,
                    attributes: ["url"],
                },
            ],
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
            let previewImage;
            if (!spot.SpotImages.length) {
                previewImage = "No Preview Image";
            } else {
                previewImage = spot.SpotImages[0].url; // Take the first spot image URL
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
    }
});


router.get("/current", requireAuth, async (req, res) => {
    let allOwnerSpots = [];

    const user = req.user.id;

    const allSpots = await Spot.findAll({
    where: {
        ownerId: user,
    },
    include: [
        {
        model: Review,
        attributes: ["stars"],
        },
        {
        model: SpotImage,
        attributes: ["url"],
        },
    ],
    });

    // Get the average rating of each spot
    for (let eachSpot of allSpots) {
        let totalStars = 0;
        let totalReviews = 0;

    for (let eachReview of eachSpot.Reviews) {
        totalStars += eachReview.stars; // total amount of stars for all reviews
        totalReviews++; // total amount of reviews for each spot
    }

    let avgRating;
        if (totalReviews == 0) {
        avgRating = "No Rating Yet";
    } else {
        avgRating = totalStars / totalReviews;
    }

    let previewImage;
    if (!eachSpot.SpotImages.length) {
        previewImage = "No Preview Image";
    } else {
        previewImage = eachSpot.SpotImages[0].url; // Take the first spot image URL
    }

    allOwnerSpots.push({
        id: eachSpot.id,
        ownerId: eachSpot.ownerId,
        address: eachSpot.address,
        city: eachSpot.city,
        state: eachSpot.state,
        country: eachSpot.country,
        lat: parseFloat(eachSpot.lat),
        lng: parseFloat(eachSpot.lng),
        name: eachSpot.name,
        description: eachSpot.description,
        price: parseFloat(eachSpot.price),
        createdAt: new Date(eachSpot.createdAt).toLocaleString(),
        updatedAt: new Date(eachSpot.createdAt).toLocaleString(),
        avgRating: avgRating,
        previewImage: previewImage,
    });
    }
    if (!allSpots.length)
    return res
        .status(200)
        .json({ Spots: "You do not currently own any spots" });
    return res.status(200).json({ Spots: allOwnerSpots });
});


router.get('/:spotId', async (req, res) => {
    const { spotId } = req.params;
    const spot = await Spot.findOne({ where: { id: spotId } });

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const spotImgs = await SpotImage.findAll({ where: { spotId: spotId }, attributes: ['id', 'url', 'preview'] });
    const owner = await User.findOne({ where: { id: spot.ownerId }, attributes: ['id', 'firstName', 'lastName'] });

    let reviews = await Review.findAll({
        where: {
            spotId: spot.id
        }
    });

    // Calculate average star rating
    let totalStars = 0;
    for (let i = 0; i < reviews.length; i++) {
        totalStars += reviews[i].stars;
    }
    let avgStarRating = reviews.length > 0 ? totalStars / reviews.length : 0;

    // Construct the response object
    const responseObject = {
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
        createdAt: new Date(spot.createdAt).toLocaleString(),
        updatedAt: new Date(spot.createdAt).toLocaleString(),
        numReviews: reviews.length,
        avgStarRating: avgStarRating,
        SpotImages: spotImgs,
        Owner: owner
    };

    return res.json(responseObject);
});

router.post('/', requireAuth, validateSpot,handleValidationErrors, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description,price } = req.body

    const newSpot = await Spot.create({
        ownerId: req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
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
                message: "Forbidden",
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
        // res.status(404).json({ message: "Spot couldn't be found" });
    }
});

router.put('/:spotId', requireAuth, validateSpot, handleValidationErrors, async (req, res) => {
    const spotId = req.params.spotId;
    const { address, city, state, country, lat, lng, name, description } = req.body;

    // Check if the spot exists
    let spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({ message: "Spot not found" });
    }

    // Check if the user is authorized to update the spot
    if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
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


router.delete("/:spotId", requireAuth, async(req,res) =>{
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
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
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
            return res.status(500).json({ message: "User already has a review for this spot" });
        }

        const newReview = await Review.create({
            userId: userId,
            spotId: spotId,
            review: review,
            stars: stars
        });

        return res.status(201).json(newReview);
    } catch (error) {
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

    }
});

router.post('/:spotId/bookings', requireAuth, async (req, res) => {
    let { startDate, endDate } = req.body;
    const spotId = parseInt(req.params.spotId);
    const userId = parseInt(req.user.id);

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
    return res.status(404).json({
        message: "Spot couldn't be found"
    });
    };

    if(spot.ownerId == userId) {
        return res.status(403).json({
        message: "Forbidden"
        });
    };

    const currentDate = new Date();
    const startDateCheck = new Date(startDate);
    const endDateCheck = new Date(endDate);

    if (startDateCheck < currentDate && endDateCheck <= startDateCheck) {
        return res.status(400).json({
        message: "Bad Request",
        errors: {
            startDate: "startDate cannot be in the past",
            endDate: "endDate cannot be on or before startDate"
        }
        });
    };

    if (startDateCheck < currentDate) {
        return res.status(400).json({
        message: "Bad Request",
        errors: {
            startDate: "startDate cannot be in the past"
        }
        });
    };

    if (endDateCheck <= startDateCheck) {
    return res.status(400).json({
        message: "Bad Request",
        errors: {
            endDate: "endDate cannot be on or before startDate"
        }
        });
    };

    const booking = await Booking.findOne({
        where: {
        spotId,
        [Op.and]: [
            {
            startDate: {
                [Op.lte]: endDateCheck
            }
            },
            {
            endDate: {
                [Op.gte]: startDateCheck
            }
            }
        ]
        }
    });

    if(booking) {
        const bookingStart = new Date(booking.startDate).getTime();
        const bookingEnd = new Date(booking.endDate).getTime();

    if(endDateCheck.getTime() == bookingStart) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
                error: {
                endDate: "End date conflicts with an existing booking"
                }
            });
        };

    if (startDateCheck >= bookingStart && endDateCheck <= bookingEnd) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            });
        };

    if (startDateCheck >= bookingStart) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                error: {
                    startDate: "Start date conflicts with an existing booking"
                }
            });
        };

    if (endDateCheck <= bookingEnd) {
            return res.status(403).json({
                message: "Sorry, this spot is already booked for the specified dates",
                    error: {
                    endDate: "End date conflicts with an existing booking"
                }
            });
        };

    if (startDateCheck < bookingStart && endDateCheck > bookingEnd) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            errors: {
                startDate: "Start date conflicts with an existing booking",
                endDate: "End date conflicts with an existing booking"
            }
            });
        };
    };

    const newBooking = await Booking.create({
        spotId,
        userId,
        startDate,
        endDate
    });

    const newBookingFormatted = {
        ...newBooking.toJSON(),
        startDate: newBooking.startDate.toJSON().slice(0,10),
        endDate: newBooking.endDate.toJSON().slice(0,10),
        createdAt: newBooking.createdAt.toJSON().split('T').join(' ').split('Z').join('').slice(0,19),
        updatedAt: newBooking.updatedAt.toJSON().split('T').join(' ').split('Z').join('').slice(0,19),
    }

    return res.json(newBookingFormatted);
});




module.exports = router