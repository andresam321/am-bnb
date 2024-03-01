const express = require('express')
const { check } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { requireAuth } = require("../../utils/auth")
const {Spot, Review, SpotImage, User,ReviewImage,Booking} = require('../../db/models')
const {handleValidationErrors} =require("../../utils/validation")

const router = express.Router()




module.exports = router