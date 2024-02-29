const express = require('express')
const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User} = require('../../db/models')
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
        .isLength({ max: 50 })
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


router.get('/', async (req, res) => {
    try {
        // Fetch all spots from the database
        const spots = await Spot.findAll({});

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
        res.status(200).json({ Spots: listOfSpots });
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
        res.status(200).json({ Spots: listOfSpots });
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
                model: SpotImage
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

        
        const addedImage = await SpotImage.create({
            spotId, // Assuming a unique ID is generated for the image
            url,
            preview
        });

        const newImage = await SpotImage.findOne({
            attributes:["id","url","preview"],
            where:{
                id:addedImage.id
            }
        })

        if (!newImage) {
            return res.status(404).json({
            message: "Spot couldn't be found",
            });
        }

        res.status(200).json(newImage);
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
        return res.status(403).json({ error: "You are not authorized to update this spot" });
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
            message: "You are not authorized to delete this spot",
        });
    }


    await deleteSpot.destroy()

    res.status(200).json({
        message: "Successfully deleted",
    });

})




module.exports = router