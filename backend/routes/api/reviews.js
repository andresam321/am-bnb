const express = require('express')
const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User,ReviewImage} = require('../../db/models')
const {handleValidationErrors} =require("../../utils/validation")

const router = express.Router()

router.get("/current", requireAuth, async (req, res) => {
    try {
        let userId = req.user.id;

        let reviews = await Review.findAll({
            where: {
                userId: userId,
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
                    include: {
                        model: SpotImage,
                        as: "previewImage",
                        where: { preview: true },
                        attributes: ["url"],
                        limit: 1,
                    },
                },
                {
                    model: ReviewImage,
                    attributes: ["id", "url"],
                },
            ],
        });

        // Format the reviews data
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            userId: review.userId,
            spotId: review.spotId,
            review: review.review,
            stars: review.stars,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            User: {
                id: review.User.id,
                firstName: review.User.firstName,
                lastName: review.User.lastName,
            },
            Spot: {
                id: review.Spot.id,
                ownerId: review.Spot.ownerId,
                address: review.Spot.address,
                city: review.Spot.city,
                state: review.Spot.state,
                country: review.Spot.country,
                lat: review.Spot.lat,
                lng: review.Spot.lng,
                name: review.Spot.name,
                price: review.Spot.price,
                previewImage: review.Spot.previewImage.length > 0 ? review.Spot.previewImage[0].url : null,
            },
            ReviewImages: review.ReviewImages.map(image => ({
                id: image.id,
                url: image.url,
            })),
        }));

        res.status(200).json({ Reviews: formattedReviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
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
            error: "You are not authorized to add images to this review",
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

    if (!Number.isInteger(stars) || stars <= 1 || stars >= 6) {
        errors.stars = "Stars must be an integer from 1 to 5";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Validation error", errors });
    }

    if (!findReview) {
        return res.status(404).json({ error: "Review couldn't be found" });
    }

    if (findReview.userId !== req.user.id) {
        return res.status(403).json({ error: "You are not authorized to update this spot" });
    }

    try {
        await findReview.update({ review, stars });
        res.status(200).json(findReview);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
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