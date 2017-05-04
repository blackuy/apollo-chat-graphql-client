import React from 'react'
import './Chat.sass'

import MessagesList from './MessagesList'
import NewMessageField from './NewMessageField'
import TypingIndicator from './TypingIndicator'
import Header from './Header'
import MemberList from './MemberList'

export default ({ channel, myUser, logout, networkStatus }) => {
  return (
    <div className='chat widget flex flex-row flex-fill'>
      <div className='members-wrapper flex flex-column'>
        <MemberList
          channel={channel}
          myUser={myUser}
        />
      </div>
      <div className='content-wrapper flex flex-fill flex-column'>
        <div className='message-list-wrapper flex flex-fill flex-column'>
          <Header
            logout={logout}
            channel={channel}
            networkStatus={networkStatus}
            myUser={myUser}
          />
          <MessagesList
            channel={channel}
            myUser={myUser}
          />
          <TypingIndicator
            channel={channel}
            myUser={myUser}
          />
          <NewMessageField
            channel={channel}
            myUser={myUser}
          />
        </div>
      </div>
    </div>
  )
}
