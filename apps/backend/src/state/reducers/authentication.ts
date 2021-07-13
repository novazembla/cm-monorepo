// TODO: never used remvoe
import { AuthenticatedUser } from "../../hooks/useAuthUser";

interface AuthenticationState {
  authenticated: boolean;
  user: AuthenticatedUser | null;
}

const defaultState: AuthenticationState = {
  authenticated: false, 
  user: null    
}

type AuthenticationActions =
  | {
      type: "auth.login";
      payload: {
        user: AuthenticatedUser;
      };
    }
  | { type: "auth.logout" };

const authenticationReducer = (state: AuthenticationState = defaultState, action: AuthenticationActions) => {
  switch(action.type) {
    case 'auth.login':
      return {
        authenticated: true, 
        user: action.payload.user  
      };
      
    case 'auth.logout':
      return {
        authenticated: false, 
        user: null
      }
      
    default: 
      return state
  }
}
export default authenticationReducer 