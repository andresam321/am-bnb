import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { updateCurrentSpot } from "../../store/spots"
import { useNavigate, useParams } from "react-router-dom"
import { getSpotDetails } from "../../store/spots"


const UpdateSpot = () => {

const dispatch = useDispatch()
const navigate = useNavigate()
const { spotId } = useParams()
// console.log("line13",spotId)
const spot = useSelector(state => state.spotsReducer[spotId])
// console.log("line14444444", spot)
const currentUser = useSelector(state => state.session.user)

const [country, setCountry] = useState(spot?.country);
const [address, setAddress] = useState(spot?.address);
const [city, setCity] = useState(spot?.city);
const [state, setState] = useState(spot?.state);
// const [lat,setLat] = useState(89)
// const [lng,setLng] = useState(170)
const [description, setDescription] = useState(spot?.description);
const [name, setName] = useState(spot?.name);
const [price, setPrice] = useState(spot?.price);
const [validations, setValidations] = useState({});

useEffect(() =>{
    !currentUser && navigate('/');

    const validationsObj = {}

    if(!address){
        validationsObj.address = "Address is required"
    }
    if(!city){
        validationsObj.city = "City is required"
    }
    if(!state){
        validationsObj.state = "State is required"
    }
    if(!country){
        validationsObj.country = "Country is required"
    }
    if(!name){
        validationsObj.name = "Name is required"
    }
    if(!description){
        validationsObj.description = "Description should be atleast 30 characters"
    }
    if(!price){
        validationsObj.price = "Price is required"
    }
    setValidations(validationsObj)

    // navigate("/")

}, [address,city,state,country,name,description,price,currentUser,navigate])

const handleSubmit = async (e) => {
    e.preventDefault();

    const newSpot = {
        ownerId: currentUser.id,
        country,
        address,
        city,
        state,
        lat: 90,
        lng: 180,
        description,
        name,
        price,
    }
    const updatedSpot = await dispatch(updateCurrentSpot(newSpot, spotId));
    console.log("line79",updatedSpot)
    dispatch(getSpotDetails(updatedSpot))
    navigate(`/spots/${updatedSpot.id}`)
}



return (
    <div>
        <h1>Update your Spot</h1>
        <div>
            <form className="" onSubmit={handleSubmit}>
                <div>
                <h3>Where&apos;s your place located?</h3>
            <p>Guests will only get your exact address once they booked a reservation.</p>
            <label htmlFor="country">
                Country
            <input
                type="text"
                name="country"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                />
            </label>
            {validations.country && <span className="validation-message">{validations.country}</span>}
            <label htmlFor="address">
                Street Address
            <input
                type="text"
                name="address"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                />
            {validations.address && <span className="validation-message">{validations.address}</span>}
            </label>
            <label htmlFor="city">
                City
            <input
                type="text"
                name="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            {validations.city && <span className="validation-message">{validations.city}</span>}
            </label>
            <label htmlFor="state">
                State
            <input
                type="text"
                name="state"
                placeholder="STATE"
                value={state}
                onChange={(e) => setState(e.target.value)}
                />
            {validations.state && <span className="validation-message">{validations.state}</span>}
            </label>  
        </div>
            <div>
                <h3>Describe your place to guests</h3>
                <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                <textarea
                placeholder="Please write at least 30 characters"
                cols="40"
                rows="6"
                minLength={30}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                >
                </textarea>
                {validations.description && <span className="validation-message">{validations.description}</span>}
            </div>
            <div>
                <h3>Create a tile for your spot</h3>
                <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>
            <input
                type="text"
                placeholder="Name of your spot"
                value={name}
                onChange={(e) => setName(e.target.value)} />
            </div>
            {validations.name && <span className="validation-message">{validations.name}</span>}
            <div className="">
                <h3>Set a base price for your spot</h3>
                <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                <input
                type="number"
                placeholder="Price per night (USD)"
                value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </div>
            {validations.price && <span className="validation-message">{validations.price}</span>}
            <button type="submit">Update your Spot</button>
            </form>
        </div>
    </div>
    )
}

export default UpdateSpot