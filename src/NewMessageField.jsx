import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import throttle from 'lodash/throttle'

import './NewMessageField.sass'

import NewMessageMutation from './NewMessageMutation.graphql'
import TypingMutation from './TypingMutation.graphql'
// import MessagesListQuery from './MessagesListQuery.graphql'

import { generateId } from './utils'
import TextareaAutoresize from './TextareaAutoresize'

class NewMessageField extends Component {
  state = {
    newMessageContentTemporal: ''
  }

  get newMessageContentTemporal () {
    return this.state.newMessageContentTemporal
  }

  get newMessageContentTemporalIsEmpty () {
    return !this.newMessageContentTemporal ||
      (this.newMessageContentTemporal && this.newMessageContentTemporal.length <= 0)
  }

  typingStarted = () => {
    this.props.markTyping()
  }

  typingStartedRateLimited = throttle(this.typingStarted, 500, {
    leading: true,
    trailing: true
  })

  onTextareaChanged = (ev) => {
    this.setState({ newMessageContentTemporal: ev.target.value })
    this.typingStartedRateLimited()
  }

  clearTextArea = () => {
    this.setState({ newMessageContentTemporal: '' })
  }

  sendMessage = () => {
    if (this.newMessageContentTemporalIsEmpty) {
      return
    }
    this.props.sendMessage(this.newMessageContentTemporal)
    this.clearTextArea()
  }

  onFormSubmit = (ev) => {
    this.sendMessage()
  }

  onKeyDownTextarea = (ev) => {
    if (ev.keyCode === 13) {
      ev.preventDefault()
      this.sendMessage()
      return false
    }
  }

  render () {
    return (
      <div className='new-message-field widget flex'>
        <form
          className='flex flex-fill flex-column'
          onSubmit={this.onFormSubmit}>
          <TextareaAutoresize
            className='new-message-textarea'
            placeholder={`New Message`}
            type='text'
            autoFocus
            onKeyDown={this.onKeyDownTextarea}
            maxRows={5}
            value={this.newMessageContentTemporal}
            onChange={this.onTextareaChanged}
          />
        </form>
      </div>
    )
  }
}

@graphql(TypingMutation, {
  props: props => {
    const { mutate, ownProps: { channel, myUser } } = props
    return {
      markTyping: () => mutate({
        variables: {
          channelID: channel.id,
          userID: myUser.id
        }
      })
    }
  }
})
@graphql(NewMessageMutation, {
  props: props => {
    const { mutate, ownProps: { channel, myUser } } = props
    return {
      sendMessage: (text) => mutate({
        variables: {
          channelID: channel.id,
          userID: myUser.id,
          text
        },
        // update: (proxy, mutation) => {
        //   const newMessage = {
        //     ...mutation.data.messageNew,
        //     isNew: true
        //   }
        //   const params = {
        //     query: messageListQuery,
        //     variables: {
        //       channelID: channel.id
        //     }
        //   }
        //   const data = proxy.readQuery(params)
        //   data.messagesForChannel.push(newMessage)
        //   proxy.writeQuery({
        //     ...params,
        //     data
        //   })
        // },
        optimisticResponse: {
          __typename: 'Mutation',
          messageNew: {
            __typename: 'Message',
            id: -generateId(),
            optimistic: true,
            createdBy: {
              __typename: 'User',
              username: myUser.username,
              id: myUser.id
            },
            createdAt: +new Date(),
            text
          }
        },
        updateQueries: {
          MessagesForChannelQuery: (previousResult, args) => {
            return {
              ...previousResult,
              messagesForChannel: [
                ...previousResult.messagesForChannel,
                args.mutationResult.data.messageNew
              ]
            }
          }
        }
      })
    }
  }
})
export default class extends Component {
  sendMessage = (text) => {
    this.props.sendMessage(text)
  }

  markTyping = () => {
    this.props.markTyping()
  }

  render () {
    return (
      <NewMessageField
        markTyping={this.markTyping}
        sendMessage={this.sendMessage}
      />
    )
  }
}
