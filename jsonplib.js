loadJSON = function() {
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

httpDo(path, 'GET', options, t,
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
      return 0
    }
  );
  return ret;
};

httpDo = function() {
  var type;
  var callback;
  var errorCallback;
  var request;
  var promise;
  var jsonpOptions = {};
  var cbCount = 0;
  var contentType = 'text/plain';
  // Trim the callbacks off the end to get an idea of how many arguments are passed
  for (var i = arguments.length - 1; i > 0; i--) {
    if (typeof arguments[i] === 'function') {
      cbCount++;
    } else {
      break;
    }
  }
  // The number of arguments minus callbacks
  var argsCount = arguments.length - cbCount;
  var path = arguments[0];
  if (
    argsCount === 2 &&
    typeof path === 'string' &&
    typeof arguments[1] === 'object'
  ) {
    // Intended for more advanced use, pass in Request parameters directly
    request = new Request(path, arguments[1]);
    callback = arguments[2];
    errorCallback = arguments[3];
  } else {
    // Provided with arguments
    var method = 'GET';
    var data;

    for (var j = 1; j < arguments.length; j++) {
      var a = arguments[j];
      if (typeof a === 'string') {
        if (a === 'GET' || a === 'POST' || a === 'PUT' || a === 'DELETE') {
          method = a;
        } else if (
          a === 'json' ||
          a === 'jsonp' ||
          a === 'binary' ||
          a === 'arrayBuffer' ||
          a === 'xml' ||
          a === 'text' ||
          a === 'table'
        ) {
          type = a;
        } else {
          data = a;
        }
      } else if (typeof a === 'number') {
        data = a.toString();
      } else if (typeof a === 'object') {
        if (a.hasOwnProperty('jsonpCallback')) {
          for (var attr in a) {
            jsonpOptions[attr] = a[attr];
          }
        } else if (a instanceof p5.XML) {
          data = a.serialize();
          contentType = 'application/xml';
        } else {
          data = JSON.stringify(a);
          contentType = 'application/json';
        }
      } else if (typeof a === 'function') {
        if (!callback) {
          callback = a;
        } else {
          errorCallback = a;
        }
      }
    }

    request = new Request(path, {
      method: method,
      mode: 'cors',
      body: data,
      headers: new Headers({
        'Content-Type': contentType
      })
    });
  }
  // do some sort of smart type checking
  if (!type) {
    if (path.indexOf('json') !== -1) {
      type = 'json';
    } else if (path.indexOf('xml') !== -1) {
      type = 'xml';
    } else {
      type = 'text';
    }
  }

  if (type === 'jsonp') {
    promise = fetchJsonp(path, jsonpOptions);
  } else {
    promise = fetch(request);
  }
  promise = promise.then(function(res) {
    if (!res.ok) {
      var err = new Error(res.body);
      err.status = res.status;
      err.ok = false;
      throw err;
    } else {
      var fileSize = 0;
      if (type !== 'jsonp') {
        fileSize = res.headers.get('content-length');
      }
      if (fileSize && fileSize > 64000000) {
        return 0;
      }
      switch (type) {
        case 'json':
        case 'jsonp':
          return res.json();
        case 'binary':
          return res.blob();
        case 'arrayBuffer':
          return res.arrayBuffer();
        case 'xml':
          return res.text().then(function(text) {
            var parser = new DOMParser();
            var xml = parser.parseFromString(text, 'text/xml');
            return new XML(xml.documentElement);
          });
        default:
          return res.text();
      }
    }
  });
  promise.then(callback || function() {});
  promise.catch(errorCallback || console.error);
  return promise;
};

function fetchJsonp(_url) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  // to avoid param reassign
  var url = _url;
  var timeout = options.timeout || defaultOptions.timeout;
  var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

  var timeoutId = undefined;

  return new Promise(function (resolve, reject) {
    var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
    var scriptId = jsonpCallback + '_' + callbackFunction;

    window[callbackFunction] = function (response) {
      resolve({
        ok: true,
        // keep consistent with fetch API
        json: function json() {
          return Promise.resolve(response);
        }
      });

      if (timeoutId) clearTimeout(timeoutId);

      removeScript(scriptId);

      clearFunction(callbackFunction);
    };

    // Check if the user set their own params, and if not add a ? to start a list of params
    url += url.indexOf('?') === -1 ? '?' : '&';

    var jsonpScript = document.createElement('script');
    jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
    if (options.charset) {
      jsonpScript.setAttribute('charset', options.charset);
    }
    jsonpScript.id = scriptId;
    document.getElementsByTagName('head')[0].appendChild(jsonpScript);

    timeoutId = setTimeout(function () {
      reject(new Error('JSONP request to ' + _url + ' timed out'));

      clearFunction(callbackFunction);
      removeScript(scriptId);
      window[callbackFunction] = function () {
        clearFunction(callbackFunction);
      };
    }, timeout);

    // Caught if got 404/500
    jsonpScript.onerror = function () {
      reject(new Error('JSONP request to ' + _url + ' failed'));

      clearFunction(callbackFunction);
      removeScript(scriptId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  });
}

var defaultOptions = {
  timeout: 5000,
  jsonpCallback: 'callback',
  jsonpCallbackFunction: null
};

function generateCallbackFunction() {
  return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
}

function removeScript(scriptId) {
  var script = document.getElementById(scriptId);
  if (script) {
    document.getElementsByTagName('head')[0].removeChild(script);
  }
}

_decrementPreload = function() {
    var context = _isGlobal ? window : this;
    if (typeof context.preload === 'function') {
      context._setProperty('_preloadCount', context._preloadCount - 1);
      context._runIfPreloadsAreDone();
    }
  };

function clearFunction(functionName) {
  // IE8 throws an exception when you try to delete a property on window
  // http://stackoverflow.com/a/1824228/751089
  try {
    delete window[functionName];
  } catch (e) {
    window[functionName] = undefined;
  }
}
