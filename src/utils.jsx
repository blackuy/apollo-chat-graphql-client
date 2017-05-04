import React from 'react'

export const ApolloNetworkStatuses = [
  null,
  'loading', // The query has never been run before and the request is now pending. A query will still have this network status even if a result was returned from the cache, but a query was dispatched anyway.
  'setVariables', // If a query’s variables change and a network request was fired then the network status will be setVariables until the result of that query comes back. React users will see this when options.variables changes on their queries.
  'fetchMore', // Indicates that fetchMore was called on this query and that the network request created is currently in flight.
  'refetch', // It means that refetch was called on a query and the refetch request is currently in flight.
  null,
  'poll', // Indicates that a polling query is currently in flight. So for example if you are polling a query every 10 seconds then the network status will switch to poll every 10 seconds whenever a poll request has been sent but not resolved.
  'ready', // No request is in flight for this query, and no errors happened. Everything is OK.
  'error' // No request is in flight for this query, but one or more errors were detected
]

// generateId :: Integer -> String
export function generateId () {
  return (+new Date())
}

export const Link = ({ onClick, children, ...restProps }) => {
  return <a {...restProps} href='#' onClick={(ev) => { ev.preventDefault(); onClick() }}>{children}</a>
}
