const express = require('express')
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User,ReviewImage,Booking} = require('../../db/models')
const {handleValidationErrors} =require("../../utils/validation")

const router = express.Router()

router.delete('/:imageId', requireAuth, async (req, res) => {
    const { user } = req
    const { imageId } = req.params

    const spotImg = await SpotImage.findOne({ 
        where: 
        { 
            id: imageId 
        
        } })

    if (!spotImg) return res
    .status(404)
    .json({ message: `Spot Image couldn't be found` })

    const spot = await Spot.findOne({ 
        where: 
        { 
            id: spotImg.spotId 
        } 
    })
    

    if (spot.ownerId != user.id) return res
    .status(403)
    .json({ message: "Forbidden" })

    await spotImg.destroy()

    return res.json({ message: "Successfully deleted" })
})

module.exports = router