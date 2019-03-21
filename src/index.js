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
    };
  }

  buildUrl(endpoint) {
    return `https://api.getloconow.com/v2/${endpoint}`
  }

  getShows() {
    return new Promise((resolve) => {
      request(this._buildUrl('contests'), {
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

  ws() {
    const { broadcast } = await this.getShows();
    if (!broadcast) throw new Error('No game is currently active.');
    const ws = new WebSocket(broadcast.socketUrl, {
      headers: this.headers,
    });
    ws.onopen = () => {
      const i = setInterval(() => {
        if (ws.readyState !== ws.OPEN) return clearInterval(i);
        ws.ping();
      }, 5000);
    };
    return ws;
  }
}
