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
      'x-app-version': '252'
    };
  }

  _createClass(Loco, [{
    key: "buildUrl",
    value: function buildUrl(endpoint) {
      return "https://api.getloconow.com/v2/".concat(endpoint);
    }
  }, {
    key: "getShows",
    value: function getShows() {
      var _this = this;

      return new Promise(function (resolve) {
        (0, _request["default"])(_this._buildUrl('contests'), {
          headers: _this.headers
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
      var _this2 = this;

      return new Promise(function (resolve) {
        (0, _request["default"])(_this2.buildUrl('user/me'), {
          headers: _this2.headers
        }, function (err, res, body) {
          resolve(JSON.parse(body));
        });
      });
    }
  }, {
    key: "ws",
    value: async function ws() {
      var _ref = await this.getShows(),
          broadcast = _ref.broadcast;

      if (!broadcast) throw new Error('No game is currently active.');
      var ws = new _ws["default"](broadcast.socketUrl, {
        headers: this.headers
      });

      ws.onopen = function () {
        var i = setInterval(function () {
          if (ws.readyState !== ws.OPEN) return clearInterval(i);
          ws.ping();
        }, 5000);
      };

      return ws;
    }
  }]);

  return Loco;
}();

exports["default"] = Loco;