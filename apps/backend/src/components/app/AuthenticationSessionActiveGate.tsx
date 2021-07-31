import React from 'react'
import { useHistory } from 'react-router-dom';

import { user} from "~/services";

export const AuthenticationSessionActiveGate = ({children}:{children:React.ReactNode}) => {
  const history = useHistory();
  if (!user.isLocalSessionValid()) {
    user.logout();
    history.push("/login");
  }
  return (<>{children}</>)
}

export default AuthenticationSessionActiveGate;