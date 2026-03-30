export const RELATIONSHIP_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
} as const;

export const FRIEND_REQUEST_ACTION = {
  ACCEPT: 'accept',
  REJECT: 'reject',
} as const;

export const NETWORK_ENDPOINTS = {
  SEARCH_USERS: '/network/search',
  GET_REQUESTS: '/network/requests',
  GET_FRIENDS: '/network/friends',
  SEND_REQUEST: '/network/request/send',
  CANCEL_REQUEST: (userId: number) => `/network/request/cancel/${userId}`,
  RESPOND_REQUEST: (requestId: number) => `/network/request/${requestId}/respond`,
  UNFRIEND: (userId: number) => `/network/friend/${userId}`,
} as const;

export const NETWORK_UI_CONSTANTS = {
  DEBOUNCE_DELAY_MS: 300,
  MAX_SIDEBAR_FRIENDS: 5,
} as const;

export const USER_CARD_TEXTS = {
  ADD_FRIEND: 'Add Friend',
  PROCESSING: 'Processing...',
  CANCEL_REQUEST: 'Cancel Request',
  ACCEPT: 'Accept',
  REJECT: 'Decline',
  UNFRIEND: 'Unfriend',
  PENDING: 'Pending',
  FRIENDS: 'Friends',
} as const;
