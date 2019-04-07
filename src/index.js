import request from 'request';
import WebSocket from 'ws';

export default class Loco {
  constructor(auth) {
    if (!auth) throw new Error('No authentication token was provided.');
    this.bearer = `Bearer ${auth}`;
    this.headers = {
      authorization: this.bearer,
      'user-agent': 'Loco/252 CFNetwork/975.0.3 Darwin/18.2.0',
      'x-app-build': '252',
      'x-app-version': '252',
    };
  }

  buildUrl(endpoint) {
    return `https://api.getloconow.com/v2/${endpoint}`;
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
        if (body.includes('<')) return this.getShows();
        const json = JSON.parse(body);
        json.start_time -= 300000; // start time is usually right at q1
        // eslint-disable-next-line no-unused-expressions
        json.start_time > Date.now() ? json.active = false : json.active = true;
        return resolve(json);
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
        const {
          current_coin_balance: balance,
          total_earned_coins: totalEarnedCoins,
        } = JSON.parse(body);
        resolve({
          balance,
          totalEarnedCoins,
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
        },
      }, (err, res, body) => {
        if (body === '') return resolve(false);
        return resolve(JSON.parse(body));
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
        },
      }, (err, res, body) => {
        if (body === '') return resolve(false);
        return resolve(JSON.parse(body));
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
        return resolve(json);
      });
    });
  }

  async getBalance() {
    await this.getAuthToken();
    return new Promise((resolve) => {
      request('https://payments.getloconow.com/api/v2/wallet/me/', {
        headers: this.headers,
      }, (err, res, body) => {
        const {
          current_balance: balance,
          overall_earning: totalWinnings,
          weekly_earning: weeklyWinnings,
          is_money_redeem_enabled: canCashout,
        } = JSON.parse(body);
        resolve({
          balance,
          totalWinnings,
          weeklyWinnings,
          canCashout,
        });
      });
    });
  }

  async cashout(amount) {
    if (!amount) throw new Error('No cashout amount was specified.');
    await this.getAuthToken();
    return new Promise((resolve) => {
      request('https://payments.getloconow.com/api/v1/redeem/', {
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
        return resolve(body);
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
        request(`https://realtime.getloconow.com/v2/?EIO=3&sid=${sid}&transport=polling`, { headers }, () => {
          resolve(sid);
        });
      });
    });
  }

  async ws() {
    const headers = {
      Authorization: `Bearer ${await this.getAuthToken()}`,
      Upgrade: 'websocket',
      Connection: 'Upgrade',
    };
    const ws = new WebSocket(`wss://realtime.getloconow.com/v2/?EIO=3&sid=${await this.getSID()}&transport=websocket`, { headers });
    ws.onopen = () => {
      ws.send('2probe');
      ws.send('5');
      const i = setInterval(() => {
        if (ws.readyState !== ws.OPEN) return clearInterval(i);
        return ws.send('2');
      }, 5000);
    };
    return ws;
  }

  parseWSMessage(msg) {
    if (msg === '3') return { type: 'pong' };
    if (msg === '3probe') return { type: '3probe' };
    if (msg.match(/\[(.*)/g)) {
      if (msg.match(/(\s|\w|\?)"(\s|\w|\?)/g)) {
        for (const res of msg.match(/(\s|\w|\?)"(\s|\w|\?)/g)) {
          msg = msg.replace(/(\s|\w|\?)"(\s|\w|\?)/, res.replace(/"/g, '\\"'));
        }
      }
      const data = msg.match(/\[(.*)/g)[0];
      const json = JSON.parse(data);
      if (json[0] === 'count_change') {
        json[1].type = 'count_change';
        return json[1];
      }
      if (json[0] === 'question') {
        return {
          type: 'question',
          question: json[1].text,
          id: json[1].uid,
          questionType: json[1].question_type,
          answers: [
            { id: json[1].options[0].uid, text: json[1].options[0].text },
            { id: json[1].options[1].uid, text: json[1].options[1].text },
            { id: json[1].options[2].uid, text: json[1].options[2].text },
          ],
          rewardCoins: json[1].reward_coins,
          questionNumber: json[1].question_rank,
          inTheGame: json[1].is_allowed_to_answer,
        };
      }
      if (json[0] === 'status') {
        return {
          type: 'questionSummary',
          questionId: json[1].question_uid,
          correctAnswerId: json[1].question_stats.correct_option_uid,
          answers: [
            {
              id: json[1].question_stats.answer_dist[0].option_uid,
              answerCount: json[1].question_stats.answer_dist[0].count,
            },
            {
              id: json[1].question_stats.answer_dist[1].option_uid,
              answerCount: json[1].question_stats.answer_dist[1].count,
            },
            {
              id: json[1].question_stats.answer_dist[2].option_uid,
              answerCount: json[1].question_stats.answer_dist[2].count,
            },
          ],
          totalAnswers: json[1].question_stats.total_answer,
          extraLifeUsed: json[1].user_contest_status.is_extra_life_used,
          isCorrect: json[1].user_contest_status.is_correct,
          totalCorrectAnswers: Number(json[1].user_contest_status.total_correct_answers),
          totalCoins: json[1].user_contest_status.current_coins,
          canRevive: json[1].revival_status.can_revive,
          reviveCost: json[1].revival_status.coins_required,
          coinsAfterRevive: json[1].revival_status.coins_after_revival,
        };
      }
      // eslint-disable-next-line prefer-destructuring
      json[1].type = json[0];
      return json[1];
    }
    return msg;
  }
}
