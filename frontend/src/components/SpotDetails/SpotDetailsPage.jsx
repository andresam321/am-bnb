import { useDispatch,useSelector } from 'react-redux'
import { useEffect } from 'react'
import { getSpotDetails } from '../../store/spots'
import { useParams } from 'react-router-dom'
import GetSpotReviews from './GetSpotReviews'
import "../SpotDetails/SpotDetails.css"


const SpotDetailsPage = () => {

    
    const {spotId} = useParams()
    const dispatch = useDispatch()
    let spot = useSelector(state => state.spotsReducer)
    const selectedSpot = spot[spotId]
    console.log("line17 is probably working", selectedSpot)


    useEffect(() => {
        dispatch(getSpotDetails(spotId))
    },[dispatch,spotId])

    const handleReserveClick = () => {
        alert("Feature coming soon!")
    };

    
    const reviews = () => {
        if (!selectedSpot) return null;

        const { numReviews, avgStarRating } = selectedSpot;

        if (numReviews > 1 && avgStarRating) {
            return `${avgStarRating.toFixed(1)} · ${numReviews} reviews`;
        } else if (numReviews === 1 && avgStarRating) {
            return `${avgStarRating.toFixed(1)} · ${numReviews} review`;
        } else {
            return 'New';
        }
    };

return (
<div>
    {selectedSpot && (
    <div className='body'>
    <div>
        <h2>{selectedSpot.name}</h2>
        <h3>{`${selectedSpot.city}, ${selectedSpot.state}, ${selectedSpot.country}`}</h3>
    </div>
        <div className='images-container'>
        <img className="big-image" src={selectedSpot.SpotImages?.[0]?.url || "https://res.cloudinary.com/djuzk5um3/image/upload/v1710993252/am-bnb%20authme_Project/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available_ykibfw.webp"} alt="big image" />
        <div className="small-images-container">
            <div>
            <img className="small-image" src={selectedSpot.SpotImages?.[1]?.url || "https://res.cloudinary.com/djuzk5um3/image/upload/v1710993252/am-bnb%20authme_Project/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available_ykibfw.webp"} alt="small image one" />
            <img className="small-image" src={selectedSpot.SpotImages?.[2]?.url || "https://res.cloudinary.com/djuzk5um3/image/upload/v1710993252/am-bnb%20authme_Project/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available_ykibfw.webp"} alt="small image two" />
            </div>
        <div>
            <img className="small-image" src={selectedSpot.SpotImages?.[3]?.url || "https://res.cloudinary.com/djuzk5um3/image/upload/v1710993252/am-bnb%20authme_Project/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available_ykibfw.webp"} alt="small image three" />
            <img className="small-image" src={selectedSpot.SpotImages?.[4]?.url || "https://res.cloudinary.com/djuzk5um3/image/upload/v1710993252/am-bnb%20authme_Project/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available_ykibfw.webp"} alt="small image four" />
        </div>
        </div>
    </div>
    <section className="info-container">
        <div className="description-container">
            <h3>{`Hosted by ${selectedSpot.Owner?.firstName}, ${selectedSpot.Owner?.lastName}`}</h3>
            <p>{selectedSpot.description}</p>
        </div>
        <div className="spot-container">
            <div className="spot-info">
            <p><span className="">{`$${selectedSpot.price}`}</span><span className="price-night">night</span></p>
            <p><i className=""></i><span className="rating-review"> {reviews()}</span></p>
            <button className="reserve-button" onClick={handleReserveClick}>Reserve</button>
        </div>
        </div>
    </section>
    <div>
        <h1><i className=""></i><span className=""> {reviews()}</span></h1>
        <GetSpotReviews/>
    </div>
    </div>
)}
</div>


    )
}

export default SpotDetailsPage