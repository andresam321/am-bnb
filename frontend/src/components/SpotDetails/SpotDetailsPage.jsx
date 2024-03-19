import { useDispatch,useSelector } from 'react-redux'
import { useEffect } from 'react'
import { getSpotDetails } from '../../store/spots'
import { useParams } from 'react-router-dom'

const SpotDetailsPage = () => {
    const {spotId} = useParams()
    const dispatch = useDispatch()
    const spot = useSelector(state => state.spotsReducer)
    const selectedSpot = spot[spotId]

    useEffect(()=>{
        dispatch(getSpotDetails(spotId))
    },[dispatch,spotId])

    const handleReserveClick = () => {
        alert("Feature coming soon!")
      };


return (
    <div>
        {selectedSpot && (
            <div className='body'>
                <div className=''>
                    <h2>{selectedSpot.name}</h2>
                    <h3>{`${selectedSpot.city},${selectedSpot.state},${selectedSpot.country}`}</h3>
                </div>
                <div className=''>
                    <img className="small-image" src={selectedSpot.SpotImages?.[1]?.url} alt="small image one" />
                    <img className="small-image" src={selectedSpot.SpotImages?.[2]?.url} alt="small image two" />
                    <img className="small-image" src={selectedSpot.SpotImages?.[3]?.url} alt="small image three" />
                    <img className="small-image" src={selectedSpot.SpotImages?.[4]?.url} alt="small image four" />
                </div>
                <section className="info-container">
                <div className="description-container">
                    <h3>{`Hosted by ${selectedSpot.Owner?.firstName}, ${selectedSpot.Owner?.lastName}`}</h3>
                    <p>{selectedSpot.description}</p>
                </div>
                <div className="spot-callout-container">
                    <div className="spot-callout-info">
                    <p><span className="spot-callout-price">{`$${selectedSpot.price}`}</span><span className="price-night">night</span></p>
                    {/* <p><i className="fa-solid fa-star"></i><span className="rating-review"> {reviews()}</span></p> */}
                <button
                    className="reserve-button"
                    onClick={handleReserveClick}>Reserve
                </button>
                </div>
                </div>
            </section>

            </div>
        )}
    </div>
    )
}

export default SpotDetailsPage