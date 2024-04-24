import { useEffect,useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getAllReviewsThunk } from "../../store/reviews"
import CreateReview from "../Reviews/CreateReview"
import DeleteReview from '../Reviews/DeleteReview'
import OpenModalButton from '../OpenModalButton';

import "./GetSpotReviews.css"




const GetSpotReviews = () => {
const dispatch = useDispatch();
const {spotId} = useParams()
const [showButton, setShowButton] = useState(true);

let stateReviews = useSelector(state => state.reviewsReducer)


stateReviews = Object.values(stateReviews)






const reviews = [...stateReviews].reverse()
console.log("line 18",reviews)

const sessionUser = useSelector(state => state.session.user?.id)

const spot = useSelector(state => state.spotsReducer?.[spotId].ownerId)

useEffect(()=>{
    dispatch(getAllReviewsThunk(spotId))
    setShowButton(true)
},[dispatch,spotId])

useEffect(() => {
    if (sessionUser && reviews.some(review => review.userId === sessionUser)) {
        setShowButton(false); 
    }
}, [reviews, sessionUser]);


const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];


return (

<div>
    
    <div>
    {showButton && sessionUser && sessionUser !== spot && (
        <OpenModalButton
        buttonText="Post Your Review"
        modalComponent={<CreateReview />}
        />
    )} 
    </div>

        {!reviews.length && sessionUser && sessionUser !== spot?.Owner?.id &&
                <p>Be the first to post a review</p>
            }
        <div className="reviews-container">
                {reviews.map(review => (
                <div key={review.id} className="review">
                    <div className="review-content">
                        <p>{review.User?.firstName}</p>
                        <p>{review.review}</p>
                        <span>{`${months[new Date(review.createdAt).getMonth()]} ${new Date(review.createdAt).getFullYear()}`}</span>
                    </div>
                        {review.userId === sessionUser && <DeleteReview reviewId={review.id} spotId={spotId} />}
                </div>
                ))}
            </div>
        </div>
    );
}

export default GetSpotReviews