/**
 *
 * Discogs Enhancer
 *
 * @author: Matthew Salcido
 * @website: http://www.msalcido.com
 * @github: https://github.com/salcido
 *
 */

function searchAllDay(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://www.alldayrecords.com/search?type=product&q=' + encodeStr});
}

function searchBandcamp(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://bandcamp.com/search?q=' + encodeStr});
}

function searchBoomkat(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://boomkat.com/products?q[keywords]=' + encodeStr});
}

function searchClone(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({ url: 'https://clone.nl/search/?instock=1&query=' + encodeStr });
}

function searchDeeJay(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'http://www.deejay.de/' + encodeStr});
}

function searchDiscogs(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'http://www.discogs.com/search?q=' + encodeStr});
}

function searchGramaphone(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'http://webstore.gramaphonerecords.com/search.aspx?find=' + encodeStr});
}

function searchHalcyon(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://www.halcyontheshop.com/search.php?search_query=' + encodeStr + '&section=product'});
}

function searchHardwax(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://hardwax.com/?search=' + encodeStr});
}

function searchInsound(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'http://www.insound.com/catalogsearch/result/?q=' + encodeStr + '&order=relevance&dir=desc'});
}

function searchJuno(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://www.juno.co.uk/search/?q%5Ball%5D%5B%5D=' + encodeStr});
}

function searchKristina(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'http://kristinarecords.com/?s=' + encodeStr});
}

function searchOye(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://oye-records.com/search?q=' + encodeStr});
}

function searchPbvinyl(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://www.pbvinyl.com/search?q=' + encodeStr});
}

function searchPhonica(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'http://www.phonicarecords.com/search/' + encodeStr});
}

function searchRushhour(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({ url: 'http://www.rushhour.nl/search?sort_by=&query=' + encodeStr});
}

function searchSotu(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://soundsoftheuniverse.com/search/?q=' + encodeStr});
}

function searchYoutube(event) {

  let str = event.selectionText,
      encodeStr = encodeURIComponent(str);

  chrome.tabs.create({url: 'https://www.youtube.com/results?search_query=' + encodeStr});
}
