import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  user: {
    avatar: '',
    name: '',
    email: '',
    token: '',
    },
}

const changeState = (state = initialState, { type, ...rest }:any) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

const store = createStore(changeState)
export default store