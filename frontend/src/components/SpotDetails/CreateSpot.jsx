import { useDispatch, useSelector } from "react-redux"
import { useEffect,useState } from "react"
import { useNavigate } from "react-router-dom"
import { createNewSpot, getSpotDetails } from "../../store/spots"
import "./SpotDetails.css"

const CreateSpot = () => {
const dispatch = useDispatch()
const navigate = useNavigate()

const currentUser = useSelector(state => state.session.user)

const [address, setAddress] = useState("")
const [city,setCity] = useState("")
const [state, setState] = useState("")
const [country,setCountry] = useState("")
const [lat,setLat] = useState(89)
const [lng,setLng] = useState(170)
const [name,setName] = useState("")
const [description,setDescription] = useState('')
const [price,setPrice] = useState("")
// const [avgRating, setRating] = useState("")
const [previewImage, setPreviewImage] = useState('')
const [imageTwo, setImageTwo] = useState('');
const [imageThree, setImageThree] = useState('');
const [imageFour, setImageFour] = useState('');
const [imageFive, setImageFive] = useState('');
// const [formSubmitted, setFormSubmitted] = useState(false);
// const [touched,setTouched] = useState(false)

const [validations, setValidations] = useState({});


useEffect(() =>{
    // if (!formSubmitted && !touched) return;
    setLat(90);
    setLng(180);
    // setFormSubmitted()
    // setTouched()
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
    if(!previewImage){
        validationsObj.previewImage = "Please add a preview image"
    }

    setValidations(validationsObj)

    // navigate("/")

}, [address,city,state,country,name,description,price,previewImage,currentUser,navigate])

const handleSubmit = async (e) =>{
    e.preventDefault()

    const spot = {
        ownerId: currentUser.id,
        address,
        city,
        state,
        country,
        name,
        description,
        price,
        lat,
        lng,
    }
    const newImages = {
        previewImage,
        imageTwo,
        imageThree,
        imageFour,
        imageFive
    }
    const newSpot = await dispatch(createNewSpot(spot, newImages))

    dispatch(getSpotDetails(newSpot))
    navigate(`/spots/${newSpot.id}`)
}

    return (
    <div>
        <h1>Create A New Spot</h1>
        <div className="">
            <form className="" onSubmit={handleSubmit}>
            <h3>Where&apos;s your place located?</h3>
            <p>Guests will only get your exact address once they booked a reservation.</p>
                <div className="">
                    <label htmlFor="country">
                        Country
                        <input
                        type="text"
                        name="country" placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        />
                    </label>
                    {validations.country && <span className="validation-message">{validations.country}</span>}
                    <label htmlFor="address">
                        Street Address
                        <input
                        type="text"
                        name="address" placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        />
                    </label>
                    {validations.address && <span className="validation-message">{validations.address}</span>}
                    <label htmlFor="city">
                        City
                        <input
                        type="text"
                        name="city" placeholder="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        />
                    </label>
                    {validations.city && <span className="validation-message">{validations.city}</span>}
                    <label htmlFor="state">
                        State
                        <input
                        type="text"
                        name="state" placeholder="STATE"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        />
                    </label>
                    {validations.state && <span className="validation-message">{validations.state}</span>}
                    {/* <label htmlFor="lat">
                        Latitude
                        <input
                        type="text"
                        name="lat"
                        placeholder="Latitude"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)} />
                    </label>
                    <label htmlFor="longitude">
                        Longitude
                        <input
                        type="text"
                        name="longitude"
                        placeholder="Longitude"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)} />
                    </label>  */}
                </div>
                <div className="section-2">
                    <div className="">
                        <h3>Describe your place to guests</h3>
                        <p>Mention the best features of your space, any special amentities like
fast wif or parking, and what you love about the neighborhood.</p>
                    <textarea placeholder="30 Characters are needed at minimun"
                        cols="45"
                        rows="8"
                        minLength={30}
                        value={description}
                        onChange={(e)=> setDescription(e.target.value)}
                        >
                    </textarea>
                    {validations.description && <span className="validation-message">{validations.description}</span>}
                    </div>
                    <div className="">
                        <h3>Create a title for your spot</h3>
                        <p>Catch guests&apos; attention with a spot title that highlights what makes
your place special.</p>
                        <input
                        type="text"
                        placeholder="Name of your Spot"
                        value={name}
                        onChange={(e)=> setName(e.target.value)}
                        />
                    </div>
                    {validations.name && <span className="validation-message">{validations.name}</span>}
                    <div className="">
                        <h3>Set a base price for your spot</h3>
                        <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                        <input
                        type="number"
                        placeholder="Price Per night (USD)"
                        value={price}
                        onChange={(e)=> setPrice(e.target.value)}
                        />
                    </div>
                    {validations.price && <span className="validation-message">{validations.price}</span>}
                    <div className="">
                        <h3>Liven up your spot with photos</h3>
                        <p>Submit a link to at least one photo to publish your spot.</p>
                        <input
                        type="text"
                        placeholder="Preview image URL"
                        value={previewImage}
                        onChange={(e)=> setPreviewImage(e.target.value)}
                        />
                        {validations.previewImage && <span className="validation-message">{validations.previewImage}</span>}
                        <input
                        type="text"
                        placeholder="Image URL"
                        value={imageTwo}
                        onChange={(e) => setImageTwo(e.target.value)} />
                        <input
                        type="text"
                        placeholder="Image URL"
                        value={imageThree}
                        onChange={(e) => setImageThree(e.target.value)} />
                        <input
                        type="text"
                        placeholder="Image URL"
                        value={imageFour}
                        onChange={(e) => setImageFour(e.target.value)} />
                        <input
                        type="text"
                        placeholder="Image URL"
                        value={imageFive}
                        onChange={(e) => setImageFive(e.target.value)} />
                    </div>
                </div>
                <button type="submit">Create Spot</button>
            </form>
        </div>
    </div>
)
}

export default CreateSpot