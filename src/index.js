import request from 'request';
import WebSocket from 'ws';

export default class Loco {
  constructor(auth) {
    if (!auth) throw new Error('No authentication token was provided.');
    this.bearer = `Bearer ${auth}`
    this.headers = {
      authorization: this.bearer,
      'user-agent': 'Loco/252 CFNetwork/975.0.3 Darwin/18.2.0',
      'x-app-build': '252',
      'x-app-version': '252',
      'x-client-id': 'fdioi34ufkenripoupouoer0783434',
    };
  }

  buildUrl(endpoint) {
    return `https://api.getloconow.com/v2/${endpoint}`
  }

  getAuthToken() {
    return new Promise(async (resolve) => {
      const { token } = await this.getUserData();
      this.headers['x-auth-token'] = token;
      resolve(token);
    });
  }

  getShows() {
    return new Promise((resolve) => {
      request(this.buildUrl('contests'), {
        headers: this.headers,
      }, (err, res, body) => {
        const json = JSON.parse(body);
        json.start_time > Date.now() ? json.active = false : json.active = true;
        resolve(json);
      });
    });
  }

  getUserData() {
    return new Promise((resolve) => {
      request(this.buildUrl('user/me'), {
        headers: this.headers,
      }, (err, res, body) => {
        resolve(JSON.parse(body));
      });
    });
  }

  async getCoinBalance() {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request('https://api.getloconow.com/coin/v1/profile/', {
        headers: this.headers,
      }, (err, res, body) => {
        const { current_coin_balance: balance, total_earned_coins: totalEarnedCoins } = JSON.parse(body);
        resolve({
          balance,
          totalEarnedCoins
        });
      });
    });
  }

  async getFriends() {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request('https://api.getloconow.com/social/v2/social/friends', {
        headers: this.headers,
      }, (err, res, body) => {
        resolve(JSON.parse(body));
      });
    });
  }

  async getFriendRequests() {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request('https://api.getloconow.com/social/v2/social/friend_requests', {
        headers: this.headers,
      }, (err, res, body) => {
        resolve(JSON.parse(body));
      });
    });
  }

  async acceptFriendRequest(userUID) {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request(this.buildUrl('social/accept_friend_request/'), {
        headers: this.headers,
        method: 'POST',
        form: {
          to_user_uid: userUID,
        }
      }, (err, res, body) => {
        if (body === '') return resolve(false);
        resolve(JSON.parse(body));
      });
    });
  }

  async sendFriendRequest(userUID) {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request(this.buildUrl('social/send_friend_request/'), {
        headers: this.headers,
        method: 'POST',
        form: {
          to_user_uid: userUID,
        }
      }, (err, res, body) => {
        if (body === '') return resolve(false);
        resolve(JSON.parse(body));
      });
    });
  }

  async searchUsers(query) {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request(`https://api.getloconow.com/social/v2/search/?q=${query}`, {
        headers: this.headers,
      }, (err, res, body) => {
        const json = JSON.parse(body);
        if (json.message) return resolve({ error: json.message });
        if (json.length === 1) return resolve(json[0]);
        resolve(json);
      });
    });
  }

  async getBalance() {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request(`https://payments.getloconow.com/api/v2/wallet/me/`, {
        headers: this.headers,
      }, (err, res, body) => {
        const { current_balance: balance, overall_earning: totalWinnings, weekly_earning: weeklyWinnings, is_money_redeem_enabled: canCashout } = JSON.parse(body);
        resolve({
          balance,
          totalWinnings,
          weeklyWinnings,
          canCashout
        })
      });
    });
  }

  async cashout(amount) {
    if (!amount) throw new Error('No cashout amount was specified.');
    await this.getAuthToken();
    return new Promise((resolve) => {
      request(`https://payments.getloconow.com/api/v1/redeem/`, {
        headers: this.headers,
        method: 'POST',
        json: {
          transaction_in: {
            unit: 'inr',
            value: amount.toString(),
          },
          transaction_out: {
            unit: 'inr',
            value: amount.toString(),
          },
          target_uid: 'paytm',
        },
      }, (err, res, body) => {
        if (!body) return resolve(false);
        if (body.error_code) return resolve({ error: body.message });
        resolve(body);
      });
    });
  }

  async getSID() {
    const headers = {
      authorization: `Bearer ${await this.getAuthToken()}`,
    };
    return new Promise((resolve) => {
      request('https://realtime.getloconow.com/v2/?EIO=3&transport=polling', { headers }, (err, res, body) => {
        body = body.replace('96:0', '');
        const { sid } = JSON.parse(body);
        request(`https://realtime.getloconow.com/v2/?EIO=3&sid=${sid}&transport=polling`, { headers }, (err, res, body) => {
          resolve(sid);
        });
      });
    });
  }

  async ws() {
    await this.getAuthToken();
    const { active } = await this.getShows();
    // if (!active) throw new Error('No game is currently active.');
    const headers = {
      authorization: `Bearer ${await this.getAuthToken()}`,
    };
    const ws = new WebSocket(`wss://realtime.getloconow.com/v2/?EIO=3&sid=${await this.getSID()}&transport=websocket`, {
      headers,
    });
    ws.onopen = () => {
      ws.send('2probe');
      ws.send('5');
      const i = setInterval(() => {
        if (ws.readyState !== ws.OPEN) return clearInterval(i);
        ws.send('2');
      }, 5000);
    };
    return ws;
  }
}
