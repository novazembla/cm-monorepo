// TODO: never used remvoe

interface AuthenticationReducerAction {
  type: string;
  payload: {
    user: object;
  }
}

const defaultValues = {
  authenticated: false, 
  user: {
    "firstname": "",
    "lastname": "",
    "email": "",
  }  
}

const authenticationReducer = (state = defaultValues, action: AuthenticationReducerAction) => {
  switch(action.type) {
    case 'LOGOUT':
      return defaultValues;
      
    case 'LOGIN':
      return {
        authenticated: true, 
        user: {
          "firstname": "",
          "lastname": "",
          "email": "",
        }  
      }
      
    default: 
      return state
  }
}
export default authenticationReducer 