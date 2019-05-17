let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=';
let verboseContentUrl = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=';
let userInput;
let index = 0;

function setup() {
  noCanvas();
  userInput = select('#userinput');
  userInput.changed(checkMethod);
  document.getElementById('Wikipedia').checked = true;

  function checkMethod() {
    if (document.getElementById('Wikipedia').checked) {
      goWiki();
    }
    if (document.getElementById('WolframAlpha').checked) {
      return 0;
    }
    if (document.getElementById('YahooFinance').checked) {
      return 0;
    }
  }

  function goWiki() {
    let term = document.getElementById('userinput').value;
    let url = searchUrl + term;
    loadJSON(url, wikiGotData, 'jsonp');

    function wikiGotData(data) {
      console.log(data);
      let htitle = data[1][index];
      let title = data[1][index];
      title = title.replace(/\s+/g, '%20');
      htitle = htitle.replace('%20', ' ');
      createP(htitle);
      console.log(title);
      let searchData = contentUrl + title;
      let verboseSearchData = verboseContentUrl + title;
      if (document.getElementById('verbose').checked) {
        loadJSON(verboseSearchData, wikiVerboseResults, 'jsonp');
      } else {
        loadJSON(searchData, wikiResults, 'jsonp');
      }
    }

    function wikiResults(data) {
      let page = data.query.pages;
      let pageId = Object.keys(data.query.pages)[0];
      console.log(pageId);
      let content = page[pageId].extract;
      console.log(content);
      createP(content);
      createP('<hr>');
    }

    function wikiVerboseResults(data) {
      let page = data.parse.text['*'];
      createP(page);
      createP('<hr>');
    }
  }
}
