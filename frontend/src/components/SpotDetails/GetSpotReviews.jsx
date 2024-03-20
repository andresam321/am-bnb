import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getReviewsBySpotId } from "../../store/reviews"





const GetSpotReviews = () => {
const dispatch = useDispatch();
const {spotId} = useParams()
let stateReviews = useSelector(state => state.reviewsReducer)

stateReviews = Object.values(stateReviews)

const reviews = [...stateReviews]

// const sessionUser = useSelector(state => state.session.user?.id)

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
    <>
    
        <div>
            {
                reviews.map(review => (
                    <div key={review.id}>
                        <div className="">
                            <p>{review.user?.firstName}</p>
                            <span>{`${months[new Date(review.createdAt).getMonth()]} ${new Date(review.createdAt).getFullYear()}`}</span>   
                        </div>
                    </div>
                ))
            }
        </div>
    
    
    
    </>
)
}

export default GetSpotReviews