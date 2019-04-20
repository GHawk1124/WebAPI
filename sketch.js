let searchUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
let contentUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=';

let userInput;

function setup() {
  noCanvas();
  userInput = select('#userinput');
  userInput.changed(goWiki);

  function goWiki() {
      let term = userInput.value();
      let url = searchUrl + term;
      loadJSON(url, gotData, 'jsonp')
  }

  function gotData(data) {
    console.log(data);
    console.log(data[1][0])
  }
}