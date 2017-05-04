import React, { Component } from 'react'

import './Header.sass'

import { Link } from './utils'

const Header = ({ username, networkStatus, channelName, logout }) => {
  return (
    <div className={`header widget connection-${networkStatus} flex-row flex`}>
      <div className='left flex-center-j flex-center-a'>
        <Link onClick={logout} className='black'><span className='fa fa-2x fa-angle-left' /></Link>
      </div>
      <div className='middle flex flex-fill flex-center-j flex-center-a'>
        {channelName || 'Channel Name'}
      </div>
      <div className='right flex flex-center-j flex-center-a'>
        <div className='connection-state-bubble' />
      </div>
    </div>
  )
}

export default class extends Component {
  render () {
    return (
      <Header
        logout={this.props.logout}
        username={this.props.myUser.username}
        networkStatus={this.props.networkStatus}
        channelName={this.props.channel.name}
      />
    )
  }
}
