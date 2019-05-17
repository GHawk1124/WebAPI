p5.prototype.loadJSON = function() {
  p5._validateParameters('loadJSON', arguments);
  var path = arguments[0];
  var callback;
  var errorCallback;
  var options;

  var ret = {}; // object needed for preload
  var t = 'json';

  // check for explicit data type argument
  for (var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'string') {
      if (arg === 'jsonp' || arg === 'json') {
        t = arg;
      }
    } else if (typeof arg === 'function') {
      if (!callback) {
        callback = arg;
      } else {
        errorCallback = arg;
      }
    } else if (typeof arg === 'object' && arg.hasOwnProperty('jsonpCallback')) {
      t = 'jsonp';
      options = arg;
    }
  }

  var self = this;
  this.httpDo(
    path,
    'GET',
    options,
    t,
    function(resp) {
      for (var k in resp) {
        ret[k] = resp[k];
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }

      self._decrementPreload();
    },
    function(err) {
      // Error handling
      p5._friendlyFileLoadError(5, path);

      if (errorCallback) {
        errorCallback(err);
      } else {
        throw err;
      }
    }
  );

  return ret;
};

var self = this;
  p5.prototype.httpDo.call(
    this,
    arguments[0],
    'GET',
    'text',
    function(data) {
      // split lines handling mac/windows/linux endings
      var lines = data
        .replace(/\r\n/g, '\r')
        .replace(/\n/g, '\r')
        .split(/\r/);
      Array.prototype.push.apply(ret, lines);

      if (typeof callback !== 'undefined') {
        callback(ret);
      }

      self._decrementPreload();
    },
    function(err) {
      // Error handling
      p5._friendlyFileLoadError(3, arguments[0]);

      if (errorCallback) {
        errorCallback(err);
      } else {
        throw err;
      }
    }
  );

  return ret;
};
