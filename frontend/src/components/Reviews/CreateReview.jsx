import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
// import OpenModalButton from "../OpenModalButton/OpenModalButton"
// import { useModal } from "../../context/Modal"
import { FaStar } from 'react-icons/fa';
import { createReviewBySpotId } from "../../store/reviews"
import './Reviews.css'

const CreateReview = () => {
    const dispatch = useDispatch()
    const {spotId} = useParams()
    let reviews = useSelector(state => state.reviewsReducer)
    reviews = Object.values(reviews)
    console.log("line13 checking for reviews", reviews)
    const sessionUser = useSelector(state => state.session.user?.id);
    // console.log("line14 this is the session user",sessionUser)

    const spotOwner = useSelector(state => state.spotsReducer?.[spotId].ownerId)
    console.log("line15 spotOwner",spotOwner)
    
    // console.log("line14 line <=", reviews)


    // const { closeModal } = useModal()

    const [review,setReview] = useState('')
    const [hover,setHover] = useState(0)
    const [stars,setStars] = useState(0)
    const [validations,setValidations] = useState({})

    const starRatings = [1,2,3,4,5]



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
        setHover(null)
        setStars(null)
        setValidations({})
    }

    const submitHandler = async(e)=>{
        e.preventDefault()

        const newReview = {
            review,
            stars
        }
        await dispatch(createReviewBySpotId(newReview,spotId))
        // closeModal();
        reset()
    }
    const reviewed = reviews?.find(review => review.userId === sessionUser)
    console.log("line 61", reviewed)

return (
    <>
        {sessionUser && (sessionUser !== spotOwner) && !reviewed && (
            // <OpenModalButton
            //     className = "post-review-button"
            //     buttonText ={"Post your Review"}
            //     modalComponent={
                    <form onSubmit={submitHandler}>
                        <h2>How was your stay?</h2>
                            <textarea 
                            type="text"
                            placeholder="Leave your review here..."
                            minLength={10}
                            value={review}
                            onChange={e =>setReview(e.target.value)}
                            />
                            {validations.review && <span className="validation-message">{validations.review}</span>}
                            <div className="">
                                {starRatings.map((star,index)=>{
                                    const rating = index + 1
                                    return (
                                    <label key = {rating}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={rating}
                                            onClick={()=>setStars(rating)}
                                            />
                                            <FaStar
                                                className="stars"
                                                style={{color: (hover || stars) >= rating ? 'gold' : 'grey'}}
                                                onMouseEnter={() => setHover(rating)}
                                                onMouseLeave={() => setHover(0)}
                                                />
                                                {/* {validations.stars && <span className="validation-message">{validations.stars}</span>} */}
                                        </label>
                                    )
                                })}
                                Stars
                            </div>
                            <button
                            disabled={Object.values(validations).length > 0}
                            className=""
                            type="submit">
                            Submit Your Review
                            </button>
                            
                    </form>
               // }
           // />
        )}
    </>
    )
}

export default CreateReview