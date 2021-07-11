import { combineReducers } from 'redux'
//import progressReducer from './progressReducer'
import authenticationReducer from './authentication'
// import httpReducer from './httpReducer'

const combinedReduxReducers = combineReducers({
  //progress: progressReducer,
  user: authenticationReducer,
  //http: httpReducer
})

export default combinedReduxReducers