// TODO: never used remvoe
export const reduxActionAuthenticationLogout = ()  => {
  return {
    type: 'auth.logout',
    payload: {}
  }
}

export const reduxActionAuthenticationLogin = (user: object)  => {
  return {
    type: 'auth.login',
    payload: {
      user
    }
  }
}
