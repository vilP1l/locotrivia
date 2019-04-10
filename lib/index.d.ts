// Type definitions for locotrivia
// Project: locotrivia
// Definitions by: vilP1l https://vilp1l.dev

declare class Loco {
  constructor(authToken: string);
  headers: Array;
  getAuthToken(): string;
  getShows(): object;
  getUserData(): object;
  getCoinBalance(): object;
  getFriends(): object;
  getFriendRequests(): object;
  acceptFriendRequest(userUID: string): object;
  sendFriendRequest(userUID: string): object;
  searchUsers(query: string): object;
  getBalance(): object;
  cashout(amount: number): object;
  ws(): WebSocket;
  parseWSMessage(msg: string): object;
  submitAnswer(questionID: string, choiceID: string, showID: string): void;
}
