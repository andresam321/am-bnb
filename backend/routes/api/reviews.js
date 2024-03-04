const express = require('express')
const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User,ReviewImage} = require('../../db/models')
const {handleValidationErrors} =require("../../utils/validation")

const router = express.Router()

router.get("/current", requireAuth, async (req, res) => {
    let allUserReviews = [];
    const user = req.user.id;

    const allReviews = await Review.findAll({
    where: {
        userId: user,
    },
    include: [
        {
        model: User,
        attributes: ["id", "firstName", "lastName"],
        },
        {
        model: Spot,
        attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
        ],
        include: [
            {
            model: SpotImage,
            attributes: ["url"],
            },
        ],
        },
        {
        model: ReviewImage,
        attributes: ["id", "url"],
        },
    ],
    });

    if (!allReviews.length) allUserReviews = "No Reviews Yet";

    for (let eachReview of allReviews) {
    let previewImage;
    if (!eachReview.ReviewImages.length) {
        previewImage = "No Reviews Images";
    } else {
        previewImage = eachReview.Spot.SpotImages[0].url;
    }

    allUserReviews.push({
        id: eachReview.id,
        userId: eachReview.userId,
        spotId: eachReview.spotId,
        review: eachReview.review,
        stars: parseFloat(eachReview.stars),
        createdAt: new Date(eachReview.createdAt).toLocaleString(),
        updatedAt: new Date(eachReview.updatedAt).toLocaleString(),
        User: {
            id: eachReview.User.id,
            firstName: eachReview.User.firstName,
            lastName: eachReview.User.lastName,
        },
        Spot: {
            id: eachReview.Spot.id,
            ownerId: eachReview.Spot.ownerId,
            address: eachReview.Spot.address,
            city: eachReview.Spot.city,
            state: eachReview.Spot.state,
            country: eachReview.Spot.country,
            lat: parseFloat(eachReview.Spot.lat),
            lng: parseFloat(eachReview.Spot.lng),
            name: eachReview.Spot.name,
            price: parseFloat(eachReview.Spot.price),
            previewImage: previewImage,
        },
        ReviewImages: eachReview.ReviewImages,
        });
    }

    return res.status(200).json({ Reviews: allUserReviews });
});


router.post("/:reviewId/images",requireAuth, async (req, res) => {

    const reviewId = req.params.reviewId

    const {url} = req.body

    const findReview = await Review.findByPk(reviewId)

    if (!findReview) {
        return res.status(404).json({
            message: "Review couldn't be found",
        });
    }

    // Check if the logged-in user is the owner of the spot
    if (findReview.userId !== req.user.id) {
        return res.status(403).json({
            message: "forbidden",
        });
    }
    const maxImages = 10; 
    const existingImagesCount = await ReviewImage.count({ where: { reviewId: reviewId } });
    if (existingImagesCount >= maxImages) {
        return res.status(403).json({ message: "Maximum number of images for this review was reached" });
    }


    const addReviewImage = await ReviewImage.create({
        reviewId,
        url

    })
    res.status(200).json({
        id: addReviewImage.id,
        url: addReviewImage.url
    })
});

router.put("/:reviewId", requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const reviewId = req.params.reviewId;
    const findReview = await Review.findByPk(reviewId);

    const errors = {};

    if (!review) {
        errors.review = "Review text is required";
    }

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
        errors.stars = "Stars must be an integer from 1 to 5";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Validation error", errors });
    }

    if (!findReview) {
        return res.status(404).json({ error: "Review couldn't be found" });
    }

    if (findReview.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        await findReview.update({ review, stars });
        res.status(200).json(findReview);
    } catch (error) {
        
    }
});

router.delete("/:reviewId",requireAuth, async(req,res)=>{
    const reviewId = req.params.reviewId

    const findReview = await Review.findByPk(reviewId)

    if (!findReview) {
        return res.status(404).json({
            message: "Review couldn't be found",
        });
    }

    if (findReview.userId !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }


    await findReview.destroy()

    res.status(200).json({
        message: "Successfully Deleted"
    })

})


module.exports = router