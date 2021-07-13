import { combineReducers } from 'redux'
import authenticationReducer from './authentication'

const combinedReduxReducers = combineReducers({
  auth: authenticationReducer,
  // TODO: add further reducers
})

export type ReduxRootState = ReturnType<typeof combinedReduxReducers>

export default combinedReduxReducers