import React, { Component } from 'react'
import { graphql } from 'react-apollo'

import './LoginForm.sass'

import * as Spinners from './Spinners'
import ChannelsQuery from './ChannelsQuery.graphql'
import JoinMutation from './JoinMutation.graphql'

@graphql(JoinMutation, {
  props: props => {
    const { mutate } = props //, ownProps
    return {
      ...props,
      join: ({ username, channelName }) => mutate({
        variables: {
          channelName,
          username
        }
      })
    }
  }
})
@graphql(ChannelsQuery, {
  name: 'channelsQuery',
  options: () => ({
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  })
})
export default class extends Component {
  state = {
    username: null,
    channelNameField: null,
    channelNameSelected: null,
    sending: null,
    error: null
  }

  get finalChannelName () {
    const { channelNameField, channelNameSelected } = this.state
    return (channelNameField && channelNameField.length > 0) ? channelNameField : channelNameSelected
  }

  get channels () {
    return (this.props.channelsQuery && this.props.channelsQuery.channels) || []
  }

  get channelSelectValue () {
    return this.state.channelNameSelected
      // (this.channels && this.channels[0] && this.channels[0].name);
  }

  get networkStatus () {
    return this.props.networkStatus
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.channelsQuery.error) {
      if (this.props.networkStatus !== 'connected' &&
        nextProps.networkStatus === 'connected') {
        this.props.channelsQuery.refetch()
      }
    }
  }

  onSubmit = (ev) => {
    ev.preventDefault()
    this.setState({ error: null, sending: true })
    this.props.join({
      username: this.state.username,
      channelName: this.finalChannelName
    }).then(({data: {join: { channel, user }}}) => {
      // console.log('Sent! 😟', {channel, user});
      this.setState({ error: null, sending: false })
      this.props.onLogin({ user, channel })
    }).catch(e => {
      this.setState({
        sending: false,
        error: e.message
      })
    })
  }

  onChannelSelectChange = (ev) => {
    this.setState({
      channelNameField: false,
      channelNameSelected: ev.target.value
    })
  }

  onChannelNameChange = (ev) => {
    this.setState({
      channelNameField: ev.target.value,
      channelNameSelected: false
    })
  }

  componentWillUpdate (nextProps, nextState) {
    if (nextState.channelNameField === '') {
      this.channelNameDOM.value = null
    }
  }

  get submitDisabled () {
    if (this.props.channelsQuery.error) {
      return true
    }
    if (this.state.sending) {
      return true
    }
    return !((this.state.username && this.state.username.length > 3) &&
      (this.finalChannelName && this.finalChannelName.length > 3))
  }

  showErrors () {
    if (this.props.channelsQuery.error) {
      console.error('Login Errors', this.props.channelsQuery.error)
    }
  }

  render () {
    this.showErrors()
    return (
      <div className='login-form widget flex flex-column flex-fill'>
        <div className='content flex flex-column'>
          <header>
            <h1>ApolloChat</h1>
            <p>GraphQL with Subscriptions</p>
          </header>
          {this.state.error && <div className='error'>{this.state.error}</div>}
          {this.networkStatus === 'reconnecting' && <div className='error'>Can't connect to the server. Reconnecting...</div>}
          <div className='flex flex-column field username'>
            <input
              autoFocus
              onChange={(ev) => {
                this.setState({ username: ev.target.value })
              }}
              value={this.state.username || ''}
              placeholder='Username' />
          </div>
          <div className='flex flex-row field channels'>
            <select
              disabled={!!this.props.channelsQuery.error}
              className='flex'
              onChange={this.onChannelSelectChange}
              value={this.channelSelectValue || false}>
              <option disabled value={false}>Select Channel</option>
              {this.channels.map(c => <option key={c.id} value={c.name}>{c.name} {c.participantCount > 0 ? `(${c.participantCount})` : ''}</option>)}
            </select>
            <input
              ref={el => { this.channelNameDOM = el }}
              className='flex flex-fill'
              onChange={this.onChannelNameChange}
              value={this.state.channelNameField || ''}
              placeholder='or Create Channel' />
          </div>
          <div className='flex flex-column field submit'>
            <button
              onClick={this.onSubmit}
              disabled={this.submitDisabled}>
              <div className='contents'>
                {!this.state.sending && <span>Login</span>}
                {this.state.sending && <Spinners.SnakeCircle radius={15} />}
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
