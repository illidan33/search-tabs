function dumpTreeNodes(bookmarkNodes, query, matchArr) {
    if (bookmarkNodes.children) {
        for (let i in bookmarkNodes.children) {
            dumpTreeNodes(bookmarkNodes.children[i], query, matchArr);
        }
    } else {
        if (bookmarkNodes.title) {
            if (query && !bookmarkNodes.children) {
                let reg = new RegExp(query, "gim");
                if (String(bookmarkNodes.title).toLowerCase().indexOf(query) !== -1) {
                    bookmarkNodes.title = bookmarkNodes.title.replace(reg, "<match>" + query + "</match>");
                    matchArr.push({
                        'content': bookmarkNodes.url,
                        'description': bookmarkNodes.title + " - <url>" + bookmarkNodes.url + "</url>",
                    });
                } else if (String(bookmarkNodes.url).toLowerCase().indexOf(query) !== -1) {
                    let url = bookmarkNodes.url.replace(reg, "<match>" + query + "</match>")
                    matchArr.push({
                        'content': bookmarkNodes.url,
                        'description': bookmarkNodes.title + " - <url>" + url + "</url>",
                    });
                }
            }
        }
    }
}

function escapeXML(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/;/g, "");
}

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    let query = escapeXML(text);
    if (query.length < 2) {
        return
    }
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        let matchArr = [];
        for (let i in bookmarkTreeNodes) {
            dumpTreeNodes(bookmarkTreeNodes[i], query, matchArr);
        }
        suggest(matchArr);
    });
});

chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    chrome.storage.sync.get(['tabOpenType'], function (results) {
        if (results.tabOpenType === "current") {
            chrome.tabs.update({
                'url': text,
            });
        } else {
            chrome.tabs.create({'url': text, 'active': true});
        }
    });
});