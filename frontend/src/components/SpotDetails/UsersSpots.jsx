import { useNavigate, NavLink } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { getUsersSpots } from "../../store/spots"
import DeleteSpot from "./DeleteSpot"
import OpenModalButton from "../OpenModalButton/OpenModalButton"
import "./UsersSpots.css"


const UsersSpots = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const currentUser = useSelector(state => state.session.user)
    let spots = useSelector(state => state.spotsReducer)
    spots = Object.values(spots)
    console.log("line15",spots)

    useEffect(()=>{
        !currentUser && navigate('/')
        
        dispatch(getUsersSpots())
    },[currentUser,dispatch,navigate])

    return (
        <div className="manage-spots-container">
            {currentUser && (
                <div className="manage-spots-content">
                    <div className="manage-spots-header">
                        <h1>Manage Spots</h1>
                        <button onClick={() => navigate(`/spots/new`)}>Create a new Spot</button>
                    </div>

                    <div className="spots-container">
                        {spots.map(spot => (
                            <div key={spot.id} className="spot-box">
                                <NavLink to={`/spots/${spot.id}`}>
                                    <div className="spot-content" title={spot.name}>
                                        <img src={spot.previewImage} alt={`${spot.name} image`} />
                                        <div className="spot-info">
                                            <span>{`${spot.city}, ${spot.state}`}</span>
                                            <p><span className="spot-price">${spot.price}</span></p>
                                        </div>
                                        <div>
                                            <h3>{typeof spot.avgRating === 'number' ? spot.avgRating.toFixed(1) : 'No Ratings Yet'}</h3>
                                        </div>
                                    </div>
                                </NavLink>
                                <div className="button-container">
                                    <button className="update-spot-button" onClick={() => navigate(`/spots/${spot.id}/edit`)}>Update</button>
                                    <OpenModalButton buttonText={"Delete"} modalComponent={<DeleteSpot spotId={spot.id} />} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersSpots