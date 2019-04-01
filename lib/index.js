"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _request = _interopRequireDefault(require("request"));

var _ws = _interopRequireDefault(require("ws"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Loco =
/*#__PURE__*/
function () {
  function Loco(auth) {
    _classCallCheck(this, Loco);

    if (!auth) throw new Error('No authentication token was provided.');
    this.bearer = "Bearer ".concat(auth);
    this.headers = {
      authorization: this.bearer,
      'user-agent': 'Loco/252 CFNetwork/975.0.3 Darwin/18.2.0',
      'x-app-build': '252',
      'x-app-version': '252',
      'x-client-id': 'fdioi34ufkenripoupouoer0783434'
    };
  }

  _createClass(Loco, [{
    key: "buildUrl",
    value: function buildUrl(endpoint) {
      return "https://api.getloconow.com/v2/".concat(endpoint);
    }
  }, {
    key: "getAuthToken",
    value: function getAuthToken() {
      var _this = this;

      return new Promise(async function (resolve) {
        var _ref = await _this.getUserData(),
            token = _ref.token;

        _this.headers['x-auth-token'] = token;
        resolve(token);
      });
    }
  }, {
    key: "getShows",
    value: function getShows() {
      var _this2 = this;

      return new Promise(function (resolve) {
        (0, _request["default"])(_this2.buildUrl('contests'), {
          headers: _this2.headers
        }, function (err, res, body) {
          var json = JSON.parse(body);
          json.start_time > Date.now() ? json.active = false : json.active = true;
          resolve(json);
        });
      });
    }
  }, {
    key: "getUserData",
    value: function getUserData() {
      var _this3 = this;

      return new Promise(function (resolve) {
        (0, _request["default"])(_this3.buildUrl('user/me'), {
          headers: _this3.headers
        }, function (err, res, body) {
          resolve(JSON.parse(body));
        });
      });
    }
  }, {
    key: "getCoinBalance",
    value: async function getCoinBalance() {
      var _this4 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])('https://api.getloconow.com/coin/v1/profile/', {
          headers: _this4.headers
        }, function (err, res, body) {
          var _JSON$parse = JSON.parse(body),
              balance = _JSON$parse.current_coin_balance,
              totalEarnedCoins = _JSON$parse.total_earned_coins;

          resolve({
            balance: balance,
            totalEarnedCoins: totalEarnedCoins
          });
        });
      });
    }
  }, {
    key: "getFriends",
    value: async function getFriends() {
      var _this5 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])('https://api.getloconow.com/social/v2/social/friends', {
          headers: _this5.headers
        }, function (err, res, body) {
          resolve(JSON.parse(body));
        });
      });
    }
  }, {
    key: "getFriendRequests",
    value: async function getFriendRequests() {
      var _this6 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])('https://api.getloconow.com/social/v2/social/friend_requests', {
          headers: _this6.headers
        }, function (err, res, body) {
          resolve(JSON.parse(body));
        });
      });
    }
  }, {
    key: "acceptFriendRequest",
    value: async function acceptFriendRequest(userUID) {
      var _this7 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])(_this7.buildUrl('social/accept_friend_request/'), {
          headers: _this7.headers,
          method: 'POST',
          form: {
            to_user_uid: userUID
          }
        }, function (err, res, body) {
          if (body === '') return resolve(false);
          resolve(JSON.parse(body));
        });
      });
    }
  }, {
    key: "sendFriendRequest",
    value: async function sendFriendRequest(userUID) {
      var _this8 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])(_this8.buildUrl('social/send_friend_request/'), {
          headers: _this8.headers,
          method: 'POST',
          form: {
            to_user_uid: userUID
          }
        }, function (err, res, body) {
          if (body === '') return resolve(false);
          resolve(JSON.parse(body));
        });
      });
    }
  }, {
    key: "searchUsers",
    value: async function searchUsers(query) {
      var _this9 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])("https://api.getloconow.com/social/v2/search/?q=".concat(query), {
          headers: _this9.headers
        }, function (err, res, body) {
          var json = JSON.parse(body);
          if (json.message) return resolve({
            error: json.message
          });
          if (json.length === 1) return resolve(json[0]);
          resolve(json);
        });
      });
    }
  }, {
    key: "getBalance",
    value: async function getBalance() {
      var _this10 = this;

      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])("https://payments.getloconow.com/api/v2/wallet/me/", {
          headers: _this10.headers
        }, function (err, res, body) {
          var _JSON$parse2 = JSON.parse(body),
              balance = _JSON$parse2.current_balance,
              totalWinnings = _JSON$parse2.overall_earning,
              weeklyWinnings = _JSON$parse2.weekly_earning,
              canCashout = _JSON$parse2.is_money_redeem_enabled;

          resolve({
            balance: balance,
            totalWinnings: totalWinnings,
            weeklyWinnings: weeklyWinnings,
            canCashout: canCashout
          });
        });
      });
    }
  }, {
    key: "cashout",
    value: async function cashout(amount) {
      var _this11 = this;

      if (!amount) throw new Error('No cashout amount was specified.');
      await this.getAuthToken();
      return new Promise(function (resolve) {
        (0, _request["default"])("https://payments.getloconow.com/api/v1/redeem/", {
          headers: _this11.headers,
          method: 'POST',
          json: {
            transaction_in: {
              unit: 'inr',
              value: amount.toString()
            },
            transaction_out: {
              unit: 'inr',
              value: amount.toString()
            },
            target_uid: 'paytm'
          }
        }, function (err, res, body) {
          if (!body) return resolve(false);
          if (body.error_code) return resolve({
            error: body.message
          });
          resolve(body);
        });
      });
    }
  }, {
    key: "getSID",
    value: async function getSID() {
      var headers = {
        authorization: "Bearer ".concat((await this.getAuthToken()))
      };
      return new Promise(function (resolve) {
        (0, _request["default"])('https://realtime.getloconow.com/v2/?EIO=3&transport=polling', {
          headers: headers
        }, function (err, res, body) {
          body = body.replace('96:0', '');

          var _JSON$parse3 = JSON.parse(body),
              sid = _JSON$parse3.sid;

          (0, _request["default"])("https://realtime.getloconow.com/v2/?EIO=3&sid=".concat(sid, "&transport=polling"), {
            headers: headers
          }, function (err, res, body) {
            resolve(sid);
          });
        });
      });
    }
  }, {
    key: "ws",
    value: async function ws() {
      var headers = {
        authorization: "Bearer ".concat((await this.getAuthToken()))
      };
      var ws = new _ws["default"]("wss://realtime.getloconow.com/v2/?EIO=3&sid=".concat((await this.getSID()), "&transport=websocket"), {
        headers: headers
      });

      ws.onopen = function () {
        ws.send('2probe');
        ws.send('5');
        var i = setInterval(function () {
          if (ws.readyState !== ws.OPEN) return clearInterval(i);
          ws.send('2');
        }, 5000);
      };

      return ws;
    }
  }, {
    key: "parseWSMessage",
    value: function parseWSMessage(msg) {
      console.log(msg);
      if (msg === '3') return {
        type: 'pong'
      };
      if (msg === '3probe') return {
        type: '3probe'
      };

      if (msg.match(/\[(.*)/g)) {
        if (msg.match(/(\s|\w|\?)"(\s|\w|\?)/g)) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = msg.match(/(\s|\w|\?)"(\s|\w|\?)/g)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var res = _step.value;
              console.log(res);
              msg = msg.replace(/(\s|\w|\?)"(\s|\w|\?)/, res.replace(/"/g, '\\"'));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }

        var data = msg.match(/\[(.*)/g)[0];
        var json = JSON.parse(data);

        if (json[0] === 'count_change') {
          json[1].type = 'count_change';
          return json[1];
        } else if (json[0] === 'question') {
          return {
            type: 'question',
            question: json[1].text,
            id: json[1].uid,
            questionType: json[1].question_type,
            answers: [{
              id: json[1].options[0].uid,
              text: json[1].options[0].text
            }, {
              id: json[1].options[1].uid,
              text: json[1].options[1].text
            }, {
              id: json[1].options[2].uid,
              text: json[1].options[2].text
            }],
            rewardCoins: json[1].reward_coins,
            questionNumber: json[1].question_rank,
            inTheGame: json[1].is_allowed_to_answer
          };
        } else {
          json[1].type = json[0];
          return json[1];
        }
      }
    }
  }]);

  return Loco;
}();

exports["default"] = Loco;