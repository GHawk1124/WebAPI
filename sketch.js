let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
//let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=';
let verboseContentUrl = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=';

let userInput;
let index = 0;

function setup() {
  noCanvas();
  userInput = select('#userinput');
  userInput.changed(goWiki);

  function goWiki() {
    let term = userInput.value();
    let url = searchUrl + term;
    loadJSON(url, gotData, 'jsonp');
  }

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
  	let content = page[pageId].extract/*revisions[0]['*']*/;
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
