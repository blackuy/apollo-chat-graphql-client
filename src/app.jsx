import React from 'react'
import './App.sass'

import Chat from './Chat'
import LoginForm from './LoginForm'

export default ({ logout, loggedIn, myUser, onLogin, channel, networkStatus }) => {
  return (
    <div className='app widget flex flex-column flex-fill'>
      {
        loggedIn &&
        <Chat
          logout={logout}
          networkStatus={networkStatus}
          myUser={myUser}
          channel={channel}
          />
      }
      {
        !loggedIn &&
        <LoginForm
          onLogin={onLogin}
          />
      }
    </div>
  )
}
