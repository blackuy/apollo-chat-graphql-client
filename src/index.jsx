import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import {
  ApolloProvider,
  ApolloClient,
  createBatchingNetworkInterface
} from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

import App from './App.jsx'
import AppState from './AppState.jsx'

//
// Apollo

const APOLLO_HTTP_ENDPOINT = `${process.env.APOLLO_HTTP_ENDPOINT}${window.location.search}`

const networkInterface = createBatchingNetworkInterface({
  uri: APOLLO_HTTP_ENDPOINT,
  batchInterval: 10
})

//
// Subscriptions

const APOLLO_WS_ENDPOINT = `${process.env.APOLLO_WS_ENDPOINT}${window.location.search}`

export const wsClient = new SubscriptionClient(
  APOLLO_WS_ENDPOINT, {
    reconnect: true,
    connectionCallback: (error) => {
      console.log('Subscriptions callback 🔥', { error })
    }
  })

const MyAppState = new AppState()

wsClient.onConnect((callback, ctx) => {
  console.log('Subscriptions connected! ✅', {callback, ctx})
  MyAppState.onNetworkChange('connected')
})

wsClient.onReconnect((callback, ctx) => {
  console.log('Subscriptions reconnecting....! 👀', {callback, ctx})
  MyAppState.onNetworkChange('connected')
})

wsClient.onDisconnect((callback, ctx) => {
  console.log('Subscriptions disconnect...! ❌', {callback, ctx})
  MyAppState.onNetworkChange(wsClient.reconnecting ? 'reconnecting' : 'disconnected')
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  queryDeduplication: true,
  dataIdFromObject: r => r.id || r._id
})

//
// React

const Root = (AppWidget) => {
  const MyAppStateComp = () => MyAppState
  return (
    <ApolloProvider client={apolloClient}>
      <AppContainer>
        <MyAppStateComp appComp={AppWidget} />
      </AppContainer>
    </ApolloProvider>
  )
}

render(Root(App), document.querySelector('#app'))

//
// HOT Reloading

if (module && module.hot) {
  module.hot.accept('./App.jsx', () => {
    console.log('---- HOT RELOADING 🤖 ---')
    const App = require('./App.jsx').default
    render(
      Root(App),
      document.querySelector('#app')
    )
  })
}
