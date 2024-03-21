import { useNavigate, NavLink } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { getUsersSpots } from "../../store/spots"
// import OpenModalButton from "../OpenModalButton/OpenModalButton"


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


    <div>
        {currentUser && (
            <div>
                <div>
                    <h1>Manage Spots</h1>
                    <button onClick={() => navigate(`/spots/new`)}>Create a new Spot</button>
                </div>

                <div>
                {spots.map(spot => (    
                    <div key={spot.id}>
                        <NavLink to={`/spots/${spot.id}`}>
                            <div title= {spot.name} className="">
                                <img src={spot.previewImage} alt={`${spot.name} image`}/>
                                <div className="">
                                    <span>{`${spot.city}, ${spot.state}`}</span>
                                    <p><span>{`$${spot.price}`}</span></p>

                                </div>
                                <div>
                                <h3>{typeof spot.avgRating === 'number' ? spot.avgRating.toFixed(1) : 'No Ratings Yet'}</h3>
                                </div>
                            </div>
                        </NavLink>
                    </div>
                ))}
            </div>
            </div>
        )}

    </div>



    )
}

export default UsersSpots