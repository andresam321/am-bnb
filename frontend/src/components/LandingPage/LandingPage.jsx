import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";
import { NavLink } from 'react-router-dom'
import { getAllSpots } from "../../store/spots";
import "../LandingPage/LandingPage.css"

const LandingPage = () => {

const dispatch = useDispatch()

// console.log("line11",getAllSpots)
// console.log(Array.isArray("line12",getAllSpots))
let spots = useSelector(state => state.spotsReducer);
console.log("line14", spots)

spots = Object.values(spots)

// console.log(Array.isArray(spots))

useEffect(()=> {
    dispatch(getAllSpots())
}, [dispatch])



    return (
    <header>

    {spots && spots.map(spot => (
        <div className=''>
            <div key={spot.id} className>
            <NavLink to={`/spots/${spot.id}`}>
            <div title={spot.name}>
            <img className="tile-image" src={spot.previewImage} alt={`${spot.name} preview image`} />
                <div className="listing-info-container">
                    <div className="location-container">
                        <div className="location">{`${spot.city}, ${spot.state}`}</div>
                        <div className="price">{`$${spot.price}/night`}</div>
                </div>
                    <div className="rating">
                    <i className="fas fa-star">{`${spot.avgRating ? parseFloat(spot.avgRating).toFixed(1) : 'New'}`}</i>
                </div>
            </div>
            </div>
            </NavLink>
        </div>  
        </div>
        ))}
</header>
    )
}

export default LandingPage