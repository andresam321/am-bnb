import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getReviewsBySpotId } from "../../store/reviews"
import CreateReview from "../Reviews/CreateReview"

console.log("LINE7",CreateReview)



const GetSpotReviews = () => {
const dispatch = useDispatch();
const {spotId} = useParams()
let stateReviews = useSelector(state => state.reviewsReducer)


stateReviews = Object.values(stateReviews)






const reviews = [...stateReviews].reverse()
console.log("line 18",reviews)

const sessionUser = useSelector(state => state.session.user?.id)

const spot = useSelector(state => state.spotsReducer?.[spotId].ownerId)

useEffect(()=>{
    dispatch(getReviewsBySpotId(spotId))
},[dispatch,spotId])



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
        <CreateReview/>
    
    {!reviews.length && sessionUser && sessionUser !== spot?.Owner?.id && 
    (
        <p>Be the first to post a review</p>
    )}
        <div>
            {
                reviews.map(review => (
                    <div key={review.id}>
                        <div className="">
                            <p>{review.User?.firstName}</p>
                            <p>{review.review}</p>
                            <span>{`${months[new Date(review.createdAt).getMonth()]} ${new Date(review.createdAt).getFullYear()}`}</span>   
                        </div>
                    </div>
                ))
            }
        </div>
    
</div>
    

)
}

export default GetSpotReviews