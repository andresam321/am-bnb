import { useModal } from "../../context/Modal";
import { useDispatch } from "react-redux";
import { deleteSpotByUserId } from "../../store/spots";


const DeleteSpot = ({spotId}) => {
const dispatch = useDispatch();
const { closeModal } = useModal()


const handleDelete = async (e) =>{
    e.preventDefault()

    await dispatch(deleteSpotByUserId(spotId))
    closeModal();
}

return (

    <>
    <form onSubmit={handleDelete}>
        <div>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to remove this spot</p>
        </div>
        <div>
            <button type ="submit">Yes Delete Spot</button>
            <button onClick={() => closeModal()}>No, Keep Spot</button>
        </div>
    </form>
    </>


    )
}

export default DeleteSpot