import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";
import { NavLink } from 'react-router-dom'
import { getAllSpots } from "../../store/spots";
import "../LandingPage/LandingPage.css"
import Maps from "../maps/maps";

const LandingPage = () => {

const dispatch = useDispatch()

// console.log("line11",getAllSpots)
// console.log(Array.isArray("line12",getAllSpots))
let spots = useSelector(state => state.spotsReducer);
console.log("line14 stateeeeeeeeee", spots)

spots = Object.values(spots)

console.log("line18 turned into array",spots)

// console.log(Array.isArray(spots))

useEffect(()=> {
    dispatch(getAllSpots())
}, [dispatch])



    return (
<header>
    <div className="spot-container">
        <Maps/>
    {spots &&
        spots.map((spot) => (
        <div className="spot-tile" key={spot.id}>
            <NavLink to={`/spots/${spot.id}`}>
            <img className="tile-image" src={spot.previewImage || "https://res.cloudinary.com/djuzk5um3/image/upload/v1710993252/am-bnb%20authme_Project/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available_ykibfw.webp"} alt={`${spot.name} preview image`} />
            <div className="info-container">
            <div className="location">{`${spot.city}, ${spot.state}`}</div>
                <div className="price">{`$${spot.price}/night`}</div>
                <div className="rating">
                <i className="fas fa-star">{`${spot.avgRating ? parseFloat(spot.avgRating).toFixed(1) : 'New'}`}</i>
                </div>
            </div>
            </NavLink>
        </div>
        ))}
</div>
</header>
    )
}

export default LandingPage