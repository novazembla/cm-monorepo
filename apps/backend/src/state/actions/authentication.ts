// TODO: never used remvoe
export const reduxActionAuthenticationLogout = ()  => {
  return {
    type: 'LOGOUT',
    payload: {}
  }
}

export const reduxActionAuthenticationLogin = (user: object)  => {
  return {
    type: 'LOGIN',
    payload: {
      user
    }
  }
}
