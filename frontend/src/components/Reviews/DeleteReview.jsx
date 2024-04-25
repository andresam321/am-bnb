import { useDispatch } from "react-redux"
import OpenModalButton from "../OpenModalButton/OpenModalButton"
import { deleteReviewByIdThunk,getAllReviewsThunk } from "../../store/reviews"
import { useModal } from "../../context/Modal"
import { useEffect } from "react"
import { getSpotDetails } from "../../store/spots"
import "./Reviews.css"


const DeleteReview = ({reviewId, spotId}) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()

    useEffect(() => {
        dispatch(getAllReviewsThunk(spotId))
    },[spotId, dispatch])


    const deleteReview = async (e) => {
        e.preventDefault()
        await dispatch(deleteReviewByIdThunk(reviewId))
        closeModal()
        await dispatch(getSpotDetails(spotId))
    }


return (
    
        <OpenModalButton
            buttonText={'Delete'}
            modalComponent={
                <div className="modal-container">
                    <div className="modal-content">
                        <h2 className="modal-title">Delete</h2>
                        <p className="modal-message">Are you sure you want to delete this review?</p>
                        <div className="modal-buttons">
                            <button className="delete-button" onClick={deleteReview}>Yes (Delete Review)</button>
                            <button className="keep-button" onClick={() => closeModal()}>No (Keep Review)</button>
                        </div>
                    </div>
                </div>
            }
        />
    );
};



export default DeleteReview