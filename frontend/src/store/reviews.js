import { csrfFetch } from "./csrf"

const GET_REVIEWS = "reviews/GET_REVIEWS"

const CREATE_REVIEW = "reviews/CREAT_REVIEW"

const DELETE_REVIEW = "reviews/DELETE_REVIEW"


const getReviews = (reviews) => {
    // console.log(reviews)
    return {
        type:GET_REVIEWS,
        reviews
    }
}

const createReview = (review) =>{
    return {
        type:CREATE_REVIEW,
        review
    }
}

const deleteReview = (reviewId) => ({
    type:DELETE_REVIEW,
    reviewId
})
//thunks


export const deleteReviewById = (reviewId) => async dispatch => {
   const response = await csrfFetch(`/api/reviews/${reviewId}`,{
        method: 'DELETE'
    })

    await dispatch(deleteReview(reviewId))

    response.json(`Succesfully deleted review ${reviewId}`)
}

export const createReviewBySpotId = (review,spotId) => async dispatch =>{
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
        });
    
        const newReview = await response.json();
    await dispatch(createReview(newReview))
    return newReview;
}


export const getReviewsBySpotId = (spotId) => async dispatch =>{
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`)
    
    const reviews = await response.json()

    // console.log("line23 reviews", reviews)
    dispatch(getReviews(reviews))

    return reviews
}


function reviewsReducer(state = {}, action){
    switch(action.type){
        case GET_REVIEWS: {
            const newStateObj = {}
            action.reviews.Reviews.forEach((review) => newStateObj[review.id] = review)
            return newStateObj
        }
        case CREATE_REVIEW:{
            const newState = {...state, [action.review.id]: action.review}
            return newState
        }
        case DELETE_REVIEW:{
            const newState = {...state}
            delete newState[action.reviewId]
            return newState
        }
        default:
            return state;
    }
}

export default reviewsReducer