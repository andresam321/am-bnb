import { csrfFetch } from './csrf.js';

const GET_SPOTS = "SPOTS/GET_SPOTS";

const GET_SPOT = "SPOT/GET_SPOT";


const getSpots = (spots) =>({
    type:GET_SPOTS,
    spots
})

const getSpot = (spot) =>({
    type: GET_SPOT,
    spot
})






export const getAllSpots = () => async dispatch => {
    const response = await csrfFetch("/api/spots",{

    })

    const data = await response.json()
    // console.log(data)
    dispatch(getSpots(data));
    return response
}

export const getSpotDetails = (spotId) => async dispatch =>{
    const response = await csrfFetch(`/api/spots/${spotId}`)

    const data = await response.json()
    console.log(data)

    dispatch(getSpot(data))
    return response
}


function spotsReducer(state = {}, action){
    switch(action.type){
        case GET_SPOTS:{
            // console.log(action.spots)
            const newStateObj = {}
            action.spots.Spots.forEach((spot) => newStateObj[spot.id]= spot)
            return newStateObj;
        }
        case GET_SPOT: {
            const newState = {[action.spot.id]: action.spot}
            return newState
        }
        default:
            return state
    }
}

export default spotsReducer