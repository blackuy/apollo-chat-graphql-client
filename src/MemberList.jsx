import React, { Component } from 'react'
import { graphql } from 'react-apollo'

import './MemberList.sass'

import ChannelQueryForMemberSidebar from './ChannelQueryForMemberSidebar.graphql'
import MemberJoinSubscription from './MemberJoinSubscription.graphql'
import * as Spinners from './Spinners'

const MemberList = ({ members, loading }) => {
  return (
    <div className={`members flex-column flex flex-fill padding`}>
      <h2>Members</h2>
      { members && members.map(m => <div key={m.id} className='member'>{m.username}</div>) }
      { loading && <Spinners.SnakeCircle /> }
    </div>
  )
}

const MyAccount = ({ myUser }) => {
  return (
    <div className={`my-account flex-column flex flex-center-j`}>
      {myUser.username}
    </div>
  )
}

@graphql(ChannelQueryForMemberSidebar, {
  name: 'membersQuery',
  options: ({ channel }) => ({
    notifyOnNetworkStatusChange: true,
    variables: {
      channelID: channel.id
    }
  }),
  props: (props) => {
    const {ownProps: {channel}, membersQuery} = props
    return {
      ...props,
      subscribeToNewMembers: (params) => {
        return membersQuery.subscribeToMore({
          document: MemberJoinSubscription,
          variables: {
            channelID: channel.id
          },
          updateQuery: (prev, {subscriptionData}) => {
            if (!subscriptionData.data) {
              return prev
            }
            const newMember = subscriptionData.data.onMemberJoin
            if (prev.channel.participants &&
              prev.channel.participants.filter(p => p.id === newMember.id).length > 0) {
              return
            }
            return {
              ...prev,
              channel: {
                ...prev.channel,
                participants: [
                  newMember,
                  ...prev.channel.participants
                ]
              }
            }
          }
        })
      }
    }
  }
})
export default class extends Component {
  get members () {
    const { membersQuery } = this.props
    let members = (membersQuery &&
      membersQuery.channel &&
      membersQuery.channel.participants) || []
    if (members.filter(m => m.id === this.myUser.id).length === 0) {
      members = [this.myUser, ...members]
    }
    return members
  }

  get myUser () {
    return this.props.myUser
  }

  get loading () {
    return this.props.membersQuery && this.props.membersQuery.loading
  }

  componentWillMount () {
    this.unsubscriptionHandler = this.props.subscribeToNewMembers()
  }

  componentWillUnmount () {
    this.unsubscriptionHandler()
  }

  render () {
    return (
      <div className='member-list widget flex flex-fill flex-column'>
        <MemberList
          members={this.members}
          loading={this.loading}
          />
        <MyAccount myUser={this.myUser} />
      </div>
    )
  }
}
