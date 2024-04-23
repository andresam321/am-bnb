import { useDispatch } from "react-redux"
import OpenModalButton from "../OpenModalButton/OpenModalButton"
import { deleteReviewThunk,getReviewsThunk } from "../../store/reviews"
import { useModal } from "../../context/Modal"
import { useEffect } from "react"
import "./Reviews.css"


const DeleteReview = ({reviewId, spotId}) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()

    useEffect(() => {
        dispatch(getReviewsThunk(spotId))
    },[spotId, dispatch])


    const deleteReview = async (e) => {
        e.preventDefault()
        await dispatch(deleteReviewThunk(reviewId))
        closeModal()
        window.location.reload()
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