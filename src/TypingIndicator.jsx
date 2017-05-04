import React, { PureComponent } from 'react'
import { graphql } from 'react-apollo'

import './TypingIndicator.sass'

import TypingIndicatorSubscription from './TypingIndicatorSubscription.graphql'

const TypingIndicator = ({ participants }) => {
  if (!participants || (participants && participants.length <= 0)) { return null }

  const classes = ['typing-indicator', 'widget', 'flex']
  return (
    <div className={classes.join(' ')}>
      {
        participants &&
        participants.map((p, i, all) => {
          const isLastParticipant = (all.length - 1) === i
          const showComa = !isLastParticipant && all.length >= 2
          return <span key={p.id} className='participant'>{p.username}{showComa ? <span>,&nbsp;</span> : null}</span>
        })
      }
      { participants && participants.length === 1 && <span>&nbsp;is typing...</span> }
      { participants && participants.length >= 2 && <span>&nbsp;are typing...</span> }
    </div>
  )
}
@graphql(TypingIndicatorSubscription, {
  name: 'typingParticipants',
  options: ({ channel }) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      channelID: channel.id
    }
  }),
  props: (props, a, b) => {
    const {ownProps: {myUser}, typingParticipants: { onTypingIndicatorChanged }} = props
    const participants = onTypingIndicatorChanged &&
      onTypingIndicatorChanged.filter(p => p.id !== myUser.id)
    return {
      participants
    }
  }
})
export default class extends PureComponent {
  get participants () {
    return this.props.participants
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if(this.props.participants.length === 0 &&
  //     nextProps.participants.length === 0) { // TODO BETTER
  //     return false
  //   }
  //   return true
  // }
  // componentWillUnmount () {
  //   this.unsubscriptionHandler()
  // } // TODO Unsubscribe?

  render () {
    return (
      <TypingIndicator
        participants={this.participants}
      />
    )
  }
}
