import { useModal } from "../../context/Modal";
import { useDispatch } from "react-redux";
import { deleteSpotByUserId } from "../../store/spots";
import "./DeleteSpot.css"


const DeleteSpot = ({spotId}) => {
const dispatch = useDispatch();
const { closeModal } = useModal()


const handleDelete = async (e) =>{
    e.preventDefault()

    await dispatch(deleteSpotByUserId(spotId))
    closeModal();
}

return (
    <div className="delete-spot-container">
        <form onSubmit={handleDelete} className="delete-spot-form">
            <div className="delete-spot-title">
                <h2>Confirm Delete</h2>
        </div>
        <div className="delete-spot-message">
            <p>Are you sure you want to remove this spot?</p>
        </div>
        <div className="delete-spot-buttons">
            <button type="submit" className="delete-spot-button">Yes (Delete Spot)</button>
            <button onClick={() => closeModal()} className="keep-spot-button">No (Keep Spot)</button>
        </div>
    </form>
</div>
);
};

export default DeleteSpot