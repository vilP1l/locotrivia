# LocoTrivia

This is a javascript wrapper for [loco trivia](https://getloconow.com). This package is no longer maintained. Features may still work.

## Installation

`yarn add locotrivia` or `npm i locotrivia`

## Getting Started

To use this wrapper you will need an authentication token. This can be aquired by sniffing the loco app web trafic using a proxy tool such as [Charles Proxy](https://www.charlesproxy.com/). Use the smaller authentication token, not the larger one. It will look something like `Bearer j9a347Tdsagjdjshgw8bqCC6jZn53st46Ty`. Once you have the authentication token you can create a new instance of the Loco class by doing  

```js

import Loco from 'locotrivia'; // or const Loco = require('locotrivia');
const loco = new Loco('auth token');

```

**If you are using require (es5) you need to do `const loco = new Loco.default('auth token')`**

### Websocket Example

```js

import Loco from 'locotrivia'; // or const Loco = require('locotrivia');
import WebSocket from 'ws'; // or const WebSocket = require('ws');

const loco = new Loco('auth token');

loco.getShows().then(async (shows) => {
  if (shows.active) {
    const ws = await loco.ws();
    ws.onmessage = (msg) => {
      console.log(msg.data);
    };
    // locotrivia handles .on('open') or .onopen for you
  } else console.log('Loco is not live.');
});

```

## Methods

All the methods below are promises and `.then` / `await` must be used.

- `getShows()` - List upcoming loco trivia shows

- `getUserData()` - Get the authenticated users data (username, earnings, stats, etc.)

- `getBalance()` - Get rupee balance

- `cashout(amount)` - Cashout to paytm

- `getCoinBalance()` - Get loco coin balance

- `getFriends()` - Get friends

- `getFriendRequests()` - Get friend requests

- `acceptFriendRequest(userUID)` - Accept a friend request, requires a user UID which can be gotten from `getFriendRequests()`

- `searchUsers(query)` - Search users

- `sendFriendRequest(userUID)` - Send a friend request, requires a user UID which can be gotten from `searchUsers(query)`

- `ws()` - Returns a websocket object that is connected to the active game

## Issues

If you have any issues (or something you want to suggest) open a github issue or message me on discord: `vilP1l#0001`

## Contributing

Fork the [locotrivia repository on Github](https://https://github.com/vilP1l/locotrivia), push changes to your fork, and [create a pull request](https://github.com/vilP1l/locotrivia/pull/new/master)
