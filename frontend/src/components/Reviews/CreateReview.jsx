import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useModal } from "../../context/Modal"
import { createReviewByIdThunk } from "../../store/reviews"
import StarInput from "./StarInput"
import './Reviews.css'
import { getSpotDetails } from "../../store/spots"

const CreateReview = () => {
    const dispatch = useDispatch()
    const {spotId} = useParams()
    let reviews = useSelector(state => state.reviewsReducer)
    reviews = Object.values(reviews)
    // console.log("line13 checking for reviews", reviews)
    const sessionUser = useSelector(state => state.session.user?.id);
    // console.log("line14 this is the session user",sessionUser)

    const spotOwner = useSelector(state => state.spotsReducer?.[spotId].ownerId)
    // console.log("line15 spotOwner",spotOwner)
    
    // console.log("line14 line <=", reviews)


    const { closeModal } = useModal()

    const [review,setReview] = useState('')
    // const [hover,setHover] = useState(0)
    const [stars,setStars] = useState(0)
    const [validations,setValidations] = useState({})
    const [averageRating, setAverageRating] = useState(0);



    useEffect(() => {
        const validationObj = {}
        if(review.length < 10){
            validationObj.review = "10 Characters are Atleast Needed"
        }
        if(!stars){
            validationObj.stars = "A star rating is needed"
        }
        setValidations(validationObj)
    }, [review,stars])

    const reset = () =>{
        setReview('')
        setStars(null)
        setValidations({})
    }
    useEffect(() => {
        if (reviews.length > 0) {
            let totalStars = 0;
            reviews.forEach(review => {
                totalStars += review.stars;
            });
            const avg = totalStars / reviews.length;
            setAverageRating(avg);
        }
    }, [reviews]);

    const submitHandler = async(e)=>{
        e.preventDefault()

        const newReview = {
            review,
            stars
        }
        await dispatch(createReviewByIdThunk(newReview,spotId))
        await dispatch(getSpotDetails(spotId))
        closeModal();
        reset()
    }
    const reviewed = reviews?.find(review => review.userId === sessionUser)
    // console.log("line 61", reviewed)

return (
    <>
        {sessionUser && (sessionUser !== spotOwner) && !reviewed && (
                    <form onSubmit={submitHandler}>
                        <h2>How was your stay?</h2>
                            <textarea 
                            type="text"
                            placeholder="Leave your review here..."
                            minLength={10}
                            value={review}
                            onChange={(e) =>setReview(e.target.value)}
                            />
                            {validations.review && <span className="validation-message">{validations.review}</span>}
                            <StarInput stars={stars} setStars={setStars}
                            />
                            <button
                            disabled={Object.values(validations).length > 0}
                            className=""
                            type="submit">
                            Submit Your Review
                            </button>
                            <div>
                        {averageRating > 0 && (
                            <div>
                                Average Rating: {averageRating.toFixed(1)}
                            </div>
                            )}
                    </div>

                    </form>
        )}
    </>
    )
}

export default CreateReview