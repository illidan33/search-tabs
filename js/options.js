let searchTabsOption = {
    setMsg: function (msg) {
        let outmsg = document.getElementById('outmsg');
        outmsg.innerText = msg;
        outmsg.style.color = 'green';
        setTimeout(function () {
            outmsg.innerText = '';
        }, 2000);
        document.getElementById('btnSave').blur();
    },
    setType: function (type) {
        if (type === 'default') {
            document.getElementById('default').style.display = 'block';
        } else if (type === 'online-default') {
            chrome.storage.sync.get(['imgPath'], function (results) {
                document.getElementById('themeSelect').value = results.imgPath;
            });
            document.getElementById('onlineDefault').style.display = 'block';
        } else if (type === 'local') {
            chrome.storage.local.get(['imgPath'], function (results) {
                if (!results.imgPath) {
                    results.imgPath = '';
                }
                document.getElementById('localImg').src = results.imgPath;
            });
            document.getElementById('local').style.display = 'block';
        } else if (type === 'online') {
            chrome.storage.sync.get(['imgPath'], function (results) {
                document.getElementById('onlinePath').value = results.imgPath;
                document.getElementById('onlineImg').src = results.imgPath;
            });
            document.getElementById('online').style.display = 'block';
        } else {
            document.getElementById('default').style.display = 'block';
        }
    },
    saveType: function (type) {
        let path = 'image/default.jpg';
        if (type === 'online-default') {
            path = document.getElementById('themeSelect').value;
        } else if (type === 'local') {
            path = document.getElementById('localImg').src;
        } else if (type === 'online') {
            path = document.getElementById('onlinePath').value;
        }

        let tabOpentT = document.getElementById('bookOpenTab').value;
        let searchTitle = document.getElementById('searchTitle').value;
        if (searchTitle == "") {
            searchTitle = "Happy Everyday";
        }
        if (type == 'local') {
            chrome.storage.local.set({imgPath: path}, function () {
                searchTabsOption.setMsg('Save Success');
            });
            chrome.storage.sync.set({
                imgPath: "",
                selectType: type,
                tabOpenType: tabOpentT,
                searchTitle: searchTitle
            }, function () {
                searchTabsOption.setMsg('Save Success');
            });
        } else {
            chrome.storage.sync.set({
                imgPath: path,
                selectType: type,
                tabOpenType: tabOpentT,
                searchTitle: searchTitle
            }, function () {
                searchTabsOption.setMsg('Save Success');
            });
        }

    },
    initData: function () {
        chrome.storage.sync.get(['selectType', 'tabOpenType', 'searchTitle'], function (results) {
            document.getElementById('setType').value = results.selectType;
            document.getElementById('bookOpenTab').value = results.tabOpenType;
            document.getElementById('searchTitle').value = results.searchTitle;
            searchTabsOption.setType(results.selectType);
        });

    },
    initListener: function () {
        document.getElementById("btnSave").onclick = function () {
            let type = document.getElementById('setType').value;
            chrome.storage.sync.set({selectType: type}, function () {
                searchTabsOption.saveType(type);
            });
        };
        document.getElementById('setType').onchange = function () {
            let type = this.value;
            searchTabsOption.setType(type);
            let typeDivs = document.getElementsByClassName('type-div');
            let len = typeDivs.length;
            let i;
            for (i = 0; i < len; i++) {
                typeDivs[i].style.display = 'none';
            }

            searchTabsOption.setType(type);
        };
        document.getElementById('localFile').onchange = function () {
            let file = this.files[0];

            var img = document.getElementById("localImg");
            var reader = new FileReader();
            reader.onload = function () {
                if (reader.result.length > 5242880) {
                    searchTabsOption.setMsg('picture is too large, should lesser than 5M.')
                } else {
                    img.src = reader.result;
                }
            };
            if (file) {
                reader.readAsDataURL(file);
            }
        };
        document.getElementById('onlinePath').onchange = function () {
            document.getElementById('onlineImg').src = this.value;
        };
    }
};

searchTabsOption.initListener();
searchTabsOption.initData();