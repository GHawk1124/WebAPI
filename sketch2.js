let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
//let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=';
let verboseContentUrl = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=';

let userInput;
let index = 0;

/*window.onload = function() {
  let term = document.getElementById('userinput').value;
  let url = searchUrl + term;
  document.getElementById('userinput').onkeydown = function() {
    if (event.keyCode == 13) {
      goWiki();
    }
  }
}*/

/*const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all',
  },
};*/

/*var defaultOptions = {
  timeout: 1000000000000000000000,
  jsonpCallback: 'callback',
  jsonpCallbackFunction: null
};*/

function setup() {
  noCanvas();
  userInput = select('#userinput');
  userInput.changed(goWiki);

//httpR = function {}

/*function load_jsonp() {

}*/
/*function clearFunction(functionName) {
  try {
    delete window[functionName];
  } catch (e) {
    window[functionName] = undefined;
  }
}

function generateCallbackFunction() {
  return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
}

function removeScript(scriptId) {
  var script = document.getElementById(scriptId);
  if (script) {
    document.getElementsByTagName('head')[0].removeChild(script);
  }
}

httpDo = function() {
  var type;
  var callback;
  var errorCallback;
  var request;
  var promise;
  var jsonpOptions = {};
  var cbCount = 0;
  var contentType = 'text/plain';
  for (var i = arguments.length - 1; i > 0; i--) {
    if (typeof arguments[i] === 'function') {
      cbCount++;
    } else {
      break;
    }
  }
  var argsCount = arguments.length - cbCount;
  var path = arguments[0];
  if (
    argsCount === 2 &&
    typeof path === 'string' &&
    typeof arguments[1] === 'object'
  ) {
    request = new Request(path, arguments[1]);
    callback = arguments[2];
    errorCallback = arguments[3];
  } else {
    var method = 'GET';
    var data;
    for (var j = 1; j < arguments.length; j++) {
      var a = arguments[j];
      if (typeof a === 'string') {
        if (a === 'GET') {
          method = a;
        } else if (a === 'json' || a === 'jsonp') {
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
      switch (type) {
        case 'jsonp':
          return res.json();
        default:
          return res.text();
      }
    }
  });
  promise.then(callback || function() {});
  promise.catch(errorCallback || console.error);
  return promise;
};

function load_jsonp() {
  var path = arguments[0];
  var callback;
  var options;
  var ret = {};
  var json_type = 'jsonp';
  for (var i = 1; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'string') {
      if (arg === 'jsonp' || arg === 'json') {
        json_type = arg;
      }
    } else if (typeof arg === 'function') {
      if (!callback) {
        callback = arg;
      }
    }

    var self = this;
    this.httpDo(path, 'GET', options, json_type, function(resp) {
      for (var k in resp) {
        ret[k] = resp[k];
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
      self._decrementPreload();
    }, );
    return ret;
  };
}

function jsonp(surl) {
  return new Promise(function(resolve) {
    var jsonpID = generateCallbackFunction();
    var script = 'callback' + '_' + jsonpID;
    window[jsonpID] = function(response) {
      resolve({ok: true, json: function json() {
        return Promise.resolve(response)
    }});
  };
  surl += surl.indexOf('?') === -1 ? '?' : '&';
  console.log(surl);
  var jsonpScript = document.createElement('script');
  var newsurl = jsonpScript.setAttribute('src', '' + surl + 'callback' + '=' + jsonpID);
  console.log(newsurl);
  })
  jsonpScript.id = scriptId;
  document.getElementsByTagName('head')[0].appendChild(jsonpScript);
}

function fetchJsonp(_url) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var url = _url;
  var timeout = options.timeout;
  var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;
  var timeoutId = undefined;
  return new Promise(function(resolve, reject) {
    var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
    var scriptId = jsonpCallback + '_' + callbackFunction;

    window[callbackFunction] = function(response) {
      resolve({
        ok: true,
        json: function json() {
          return Promise.resolve(response);
        }
      });
      if (timeoutId) clearTimeout(timeoutId);
      removeScript(scriptId);
      clearFunction(callbackFunction);
    };
    url += url.indexOf('?') === -1 ? '?' : '&';
    var jsonpScript = document.createElement('script');
    jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
    if (options.charset) {
      jsonpScript.setAttribute('charset', options.charset);
    }
    jsonpScript.id = scriptId;
    document.getElementsByTagName('head')[0].appendChild(jsonpScript);
    timeoutId = setTimeout(function() {
      reject(new Error('JSONP request to ' + _url + ' timed out'));
      clearFunction(callbackFunction);
      removeScript(scriptId);
      window[callbackFunction] = function() {
        clearFunction(callbackFunction);
      };
    }, timeout);
  });
}*/


function goWiki() {
  let term = document.getElementById('userinput').value;
  let url = searchUrl + term;
  /*let htitle = data[1][index];
  let title = data[1][index];
  title = title.replace(/\s+/g, '%20');
  htitle = htitle.replace('%20', ' ');*/
  /*var human_title = document.createElement("p");
  var text = document.createTextNode(/*htitle"test");
  human_title.appendChild(text);
  var element = document.getElementById("div1");
  element.appendChild(human_title);*/
  //loadJSON();
  loadJSON(url, gotData, 'jsonp');
  //load_jsonp(url, /* gotData,*/ 'jsonp')
  //fetchJsonp(url);
  //jsonp(url);
}

/*function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}*/

function gotData(data) {
  console.log(data);
  let htitle = data[1][index];
  let title = data[1][index];
  title = title.replace(/\s+/g, '%20');
  htitle = htitle.replace('%20', ' ');
  createP(htitle);
  console.log(title);
  let searchData = contentUrl + title
  let verboseSearchData = verboseContentUrl + title;
  if (document.getElementById('verbose').checked) {
    loadJSON(verboseSearchData, verboseResults, 'jsonp');
  } else {
    loadJSON(searchData, results, 'jsonp');
  }
}

function results(data) {
  let page = data.query.pages;
  let pageId = Object.keys(data.query.pages)[0];
  console.log(pageId);
  let content = page[pageId].extract /*revisions[0]['*']*/ ;
  console.log(content);
  createP(content);
  createP('<hr>');
}

function verboseResults(data) {
  let page = data.parse.text['*'];
  createP(page);
  createP('<hr>');
}
}
