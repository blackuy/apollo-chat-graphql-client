import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import moment from 'moment'

import './MessagesList.sass'

import MessagesListQuery from './MessagesListQuery.graphql'
import MessagesListSubscription from './MessagesListSubscription.graphql'
import * as Spinners from './Spinners'

const Message = ({
  messages,
  isPending,
  isMine,
  isNextMessageDifferentAuthor,
  isPrevMessageDifferentAuthor,
  isLastMessage,
  username,
  id,
  createdAt,
  isNextMessagePending,
  text,
  isNew
}) => {
  const showFooter = (isNextMessageDifferentAuthor || (isLastMessage && !isPending) || isNextMessagePending) && !isPending

  const classes = ['message']
  if (isPending) { classes.push('pending') }
  if (isPrevMessageDifferentAuthor) { classes.push('same') }
  if (isMine) { classes.push('mine') }
  if (isNew) { classes.push('new') }

  return (
    <div className={classes.join(' ')}>
      {
        !isPrevMessageDifferentAuthor &&
        <div className='header'>
          {username}
        </div>
      }
      <div className='text'>
        {text}
      </div>
      {
        showFooter &&
        <div className='footer'>
          <span className='date'>{moment(createdAt).fromNow()}</span>
        </div>
      }
    </div>
  )
}

class MessagesList extends Component {
  scrollToEnd = ({ autoBottom = false } = {}) => {
    // console.log('scrollToEnd');
    const messagesScrollerDiv = this.messagesScrollerDiv
    window.requestAnimationFrame(() => {
      if (!messagesScrollerDiv) {
        return
      }

      messagesScrollerDiv.scrollTop = messagesScrollerDiv.scrollHeight
      if (autoBottom) {
        const lastScrollTop = messagesScrollerDiv.scrollTop
        setTimeout(() => {
          if (messagesScrollerDiv.scrollHeight !== lastScrollTop) {
            this.scrollToEnd()
          }
        }, 10)
      }
    })
  }

  componentWillMount () {
    if (this.messagesScrollerDiv) {
      this.messagesScrollerDiv.removeEventListener('scroll', this.messagesOnScroll)
    }
  }

  componentDidMount () {
    this.scrollToEnd({ autoBottom: true })
  }

  setMessagesScrollerRef = (el) => {
    if (!el) {
      return
    }
    el.addEventListener('scroll', this.messagesOnScroll)
    this.messagesScrollerDiv = el
  }

  componentWillReceiveProps (nextProps) {
    // if (nextProps.activeChannel.id !== this.props.activeChannel.id) {

    this.scrollToEnd({ autoBottom: true })
    // }
  }

  render () {
    const { myUser, loading, error, refetch, messages } = this.props
    return (
      <div
        className='message-list widget flex flex-column flex-fill'
        ref={this.setMessagesScrollerRef}
        >
        {
          loading &&
          <div className='loading-messages flex flex-fill flex-center-j flex-center-a'>
            <Spinners.SnakeCircle />
          </div>
        }
        { error && <button className='retry' onClick={refetch}>Retry</button> }
        {
          !loading &&
          <div className='messages flex flex-column'>
            {
              messages.map((m, i, messages) => {
                const isNextMessageDifferentAuthor = (i + 1) < messages.length && messages[i + 1].createdBy.id !== m.createdBy.id
                const isLastMessage = i === messages.length - 1
                const isPrevMessageDifferentAuthor = i > 0 && messages[i - 1].createdBy.id === m.createdBy.id
                const isMine = m.createdBy.id === myUser.id
                const isPending = m.id < 0
                const isNextMessagePending = (i + 1) < messages.length && messages[i + 1].id < 0
                // return <div>{JSON.stringify(m)}</div>
                return (
                  <Message
                    isNextMessageDifferentAuthor={isNextMessageDifferentAuthor}
                    isNextMessagePending={isNextMessagePending}
                    isLastMessage={isLastMessage}
                    isPending={isPending}
                    isMine={isMine}
                    messages={messages}
                    isPrevMessageDifferentAuthor={isPrevMessageDifferentAuthor}
                    key={m.id}
                    id={m.id}
                    isNew={m.isNew}
                    username={m.createdBy.username}
                    createdAt={m.createdAt}
                    text={m.text} />
                )
              })
            }
          </div>
        }
      </div>
    )
  }
}

@graphql(MessagesListQuery, {
  name: 'messagesQuery',
  options: ({ channel }) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      channelID: channel.id
    }
  }),
  props: (props) => {
    const {ownProps: {channel, myUser}, messagesQuery} = props
    return {
      ...props,
      subscribeToNewMessages: (params) => {
        return messagesQuery.subscribeToMore({
          document: MessagesListSubscription,
          variables: {
            channelID: channel.id
          },
          updateQuery: (prev, {subscriptionData}) => {
            if (!subscriptionData.data) {
              return prev
            }
            const newMessage = subscriptionData.data.onMessageAdded
            if (newMessage.createdBy.id === myUser.id) {
              return prev
            }
            return {
              ...prev,
              messagesForChannel: [
                ...prev.messagesForChannel,
                newMessage
              ]
            }
          }
        })
      }
    }
  }
})
export default class extends Component {
  get messagesFromQuery () {
    return (this.props.messagesQuery &&
      this.props.messagesQuery.messagesForChannel) || []
  }

  get messages () {
    return this.messagesFromQuery
  }

  get loading () {
    return this.props.messagesQuery && this.props.messagesQuery.loading
  }

  get myUser () {
    return this.props.myUser
  }

  get error () {
    return this.props.messagesQuery && this.props.messagesQuery.error
  }

  get networkStatus () {
    return this.props.messagesQuery && this.props.messagesQuery.networkStatus
  }

  componentWillMount () {
    this.unsubscriptionHandler = this.props.subscribeToNewMessages()
  }

  componentWillUnmount () {
    this.unsubscriptionHandler()
  }

  refetch = () => {
    return this.props.messagesQuery &&
      this.props.messagesQuery.refetch()
  }

  render () {
    // console.log('message-list 😈', new Date)
    return (
      <MessagesList
        myUser={this.myUser}
        loading={this.loading}
        error={this.error}
        refetch={this.refetch}
        messages={this.messages}
      />
    )
  }
}

// { this.error && <h2>Error {JSON.stringify(this.error)}</h2> }
// <p>Network Status: {ApolloNetworkStatuses[this.networkStatus]} ({this.networkStatus})</p>
// { (new Date).toString() }
