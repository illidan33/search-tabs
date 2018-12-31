let searchTabs = {
    searchType: {
        "google": 'https://www.google.com/search?q=',
        "bing": 'https://www.bing.com/search?q=',
        "baidu": 'https://www.baidu.com/s?wd=',
    },
    randomPathNum: function () {
        let minNum = 1, maxNum = 5;
        let rand = parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        if (rand < 10) {
            return "0" + rand + ".jpg";
        } else {
            return rand + ".jpg";
        }
    },
    createImg: function (path) {
        let img = document.createElement('img');
        img.src = path;
        img.id = 'bg-img';
        img.className = 'bg-display';

        document.getElementsByTagName('body')[0].appendChild(img);
    },
    createVideo: function (path) {
        let video = document.createElement('video');
        video.src = path;
        video.id = 'bg-img';
        video.setAttribute('autoplay', true);
        video.className = 'bg-display';

        document.getElementsByTagName('body')[0].appendChild(video);
    },
    initData: function () {
        let _this = this;
        chrome.storage.sync.get(['selectType', 'searchTitle', 'searchBoxOffset', 'searchType', 'tabOpenType', 'imgPath'], function (results) {
            // console.log(results);
            // title
            if (results.searchTitle) {
                document.getElementById('searchTitle').innerText = results.searchTitle;
            }
            // background image
            let type = results.selectType;
            if (type === 'local') {
                chrome.storage.local.get(['imgPath'], function (results) {
                    _this.createImg(results.imgPath);
                });
            } else {
                chrome.storage.sync.get(['imgPath'], function (results) {
                    if (!results.imgPath) {
                        results.imgPath = "image/default.jpg";
                    }
                    if (results.imgPath.indexOf(".mp4") !== -1) {
                        _this.createVideo(results.imgPath);
                    } else if (results.imgPath.indexOf(".rand") !== -1) {
                        let rand = results.imgPath.indexOf(".rand");
                        let path = results.imgPath.substring(0, rand);
                        _this.createImg(path + "-" + _this.randomPathNum());
                    } else {
                        _this.createImg(results.imgPath);
                    }
                });
            }
            // search box offset
            let searchForm = document.getElementById('search-form');
            searchForm.style.left = results.searchBoxOffset.x;
            searchForm.style.top = results.searchBoxOffset.y;
            // search type
            document.getElementById('searchType').value = results.searchType;
        });
    },
    initListener: function () {
        let _this = this;
        document.onkeydown = function (event) {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode === 13) {
                let searchContent = document.getElementById("search").value;
                if (searchContent) {
                    let sType = document.getElementById('searchType').value;
                    window.location.href = _this.searchType[sType] + searchContent;
                }
            }
        };
        document.getElementById("searchTitle").onmousedown = function (e) {
            let d = document;
            let _this = this.parentNode;
            let page = {
                event: function (evt) {
                    return evt || window.event;
                },
                pageX: function (evt) {
                    let e = this.event(evt);
                    return e.pageX || (e.clientX + document.body.scrollLeft - document.body.clientLeft);
                },
                pageY: function (evt) {
                    let e = this.event(evt);
                    return e.pageY || (e.clientY + document.body.scrollTop - document.body.clientTop);

                },
                layerX: function (evt) {
                    let e = this.event(evt);
                    return e.layerX || e.offsetX;
                },
                layerY: function (evt) {
                    let e = this.event(evt);
                    return e.layerY || e.offsetY;
                }
            };
            let x = page.layerX(e);
            let y = page.layerY(e);
            let maxX = 0;
            let maxY = 0;
            if (_this.setCapture) {
                _this.setCapture();
            } else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            d.onmousedown = function (e) {
                let flag = document.getElementById('bg-img');
                maxX = flag.offsetWidth - _this.offsetWidth;
                maxY = flag.offsetHeight - _this.offsetHeight - 30;
            };
            d.onmousemove = function (e) {
                let boxX = page.pageX(e) - x;
                boxX = boxX < 0 ? 0 : boxX;
                boxX = boxX > maxX ? maxX : boxX;
                let boxY = page.pageY(e) - y;
                boxY = boxY < 0 ? 0 : boxY;
                boxY = boxY > maxY ? maxY : boxY;

                _this.style.left = boxX + "px";
                _this.style.top = boxY + "px";
            };
            d.onmouseup = function (e) {
                if (_this.releaseCapture) {
                    _this.releaseCapture();
                } else if (window.releaseEvents) {
                    window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                }
                d.onmousemove = null;
                d.onmouseup = null;
                chrome.storage.sync.set({searchBoxOffset: {"x": _this.style.left, "y": _this.style.top}}, function () {
                });
            }
        };
        document.getElementById('searchType').onchange = function () {
            let val = this.value;
            chrome.storage.sync.set({searchType: val}, function () {

            })
        }
    },
};

searchTabs.initData();
searchTabs.initListener();