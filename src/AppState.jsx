import React, { Component } from 'react'

export default class AppState extends Component {
  state = {
    channel: null,
    myUser: null,
    networkStatus: null
  }

  get loggedIn () {
    return !!(this.state.channel && this.state.myUser)
  }

  logout = () => {
    this.setState({ channel: null, myUser: null })
  }

  onNetworkChange = (networkStatus) => {
    this.setState({ networkStatus })
  }

  onLogin = ({ user, channel }) => {
    this.setState({
      myUser: user,
      channel
    })
  }

  render () {
    const props = {
      loggedIn: this.loggedIn,
      onLogin: this.onLogin,
      channel: this.state.channel,
      myUser: this.state.myUser,
      networkStatus: this.state.networkStatus,
      logout: this.logout
    }

    const App = this.props.appComp
    return (
      <App {...props} />
    )
  }
}
