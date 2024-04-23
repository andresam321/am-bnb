import { csrfFetch } from "./csrf";


const GET_REVIEWS = 'reviews/GET_REVIEWS';
const CREATE_REVIEW = 'reviews/CREATE_REVIEW';
const DELETE_REVIEW = 'reviews/DELETE_REVIEW';

const getReviews = (reviews) => ({
    type: GET_REVIEWS,
    reviews

})

const createReview = (review) => ({
    type: CREATE_REVIEW,
    review
})

const deleteReview = (reviewId) => ({
    type: DELETE_REVIEW,
    reviewId
})


// thunks


export const getAllReviewsThunk = (spotId) => async dispatch => {
const response = await csrfFetch(`/api/spots/${spotId}/reviews`);

const reviews = await response.json();
dispatch(getReviews(reviews));
return reviews;
};

export const createReviewByIdThunk = (review, spotId) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review)
    });
    if(response.ok){
    const newReview = await response.json();
    await dispatch(createReview(newReview))
    return newReview;
    } else {
        console.log("error",response.statusText)
        return null
    }
};

export const deleteReviewByIdThunk = (reviewId) => async dispatch => {
    await csrfFetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
    })

    await dispatch(deleteReview(reviewId));
}

// reducer

function reviewsReducer(state = {}, action) {
    switch(action.type) {
    case GET_REVIEWS: {
    const newStateObj = {};
    action.reviews.Reviews.forEach((review) => newStateObj[review.id] = review)
        return newStateObj;
    }
    case CREATE_REVIEW: {
    console.log("action review here", action.review)
    const newState = {...state, [action.review.id]: action.review};
        return newState;
    }
    case DELETE_REVIEW: {
    const newState = {...state}
    delete newState[action.reviewId]
        return newState;
    }
    default:
        return state;
    }
}

export default reviewsReducer