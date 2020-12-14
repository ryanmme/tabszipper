let saveTabs = document.getElementById('saveTabs');
let feedbackInfo = document.getElementById('FeedbackInfo');
console.log("插件启动\n");

const ASCII_START = 33,
        ASCII_DEL = 127,
        ASCII_LONG_START = 161,
        ASCII_LONG_START_ADDER = ASCII_LONG_START - ASCII_DEL;
const notAllowed = [34,42,47,58,60,62,63,92,124];
const folderName = "zippertabs";

async function numToChar(num){
    let tmp = num + ASCII_START;
    for (index in notAllowed){
        if (tmp < notAllowed[index]){
            break;
        }
        tmp++;
    }
    if (tmp < ASCII_DEL){
        return String.fromCharCode(tmp);
    }
    else{
        return String.fromCharCode(tmp + ASCII_LONG_START_ADDER);
    }
}

let res = "";

async function getDateStr(){
    let d = new Date();
    let y = d.getFullYear(),
        m = d.getMonth(),
        dd = d.getDate(),
        h = d.getHours(),
        mi = d.getMinutes(),
        s = d.getSeconds();
    await Promise.all([
        numToChar(Math.round(y / 100)),
        numToChar(y % 100),
        numToChar(m),
        numToChar(dd),
        numToChar(h),
        numToChar(mi),
        numToChar(s)
,    ]).then(
        (values) => {
            res = values.join('');
        }
    );
    return [res, d.toString()];
}

let getFileName = (serialId) => {
    return folderName + "/tz_" + serialId + "_export.json";
}

function dealTabs(tabs) {
    let tabList = [];
    for (tab of tabs){
        let tabItem = {
            title: tab.title,
            url: tab.url
        };
        tabList.push(tabItem);
    }

    getDateStr().then((resolve) => {
        let tabStore = {
            time: resolve[1] + " " + resolve[0],
            tabList: tabList
        };
        chrome.storage.local.set({tabToStore: tabStore});
        let storeStr = JSON.stringify(tabStore);
        let url = "data:application/json;base64," + btoa(unescape(encodeURIComponent(storeStr)));
        let fileName = getFileName(resolve[0]);
        chrome.downloads.download({
            url: url,
            filename: fileName
        });
        return fileName;
    }).then((resolve) => {
        console.log("Your tabs saved as file : \n" + resolve);
        feedbackInfo.innerHTML = "</br>Hi! Your tabs saved in your chrome /download path as file :<br><br> " + resolve;
    })
    .catch((reject) => {
        console.error("Failed to save due to : \n", reject);
        feedbackInfo.innerHTML = "\nFailed to save due to : \n\n" + reject;
    });
};

saveTabs.onclick = function(element){
    console.log("You pressed sAVE");
    chrome.tabs.getAllInWindow(undefined, dealTabs);
};

saveTabs.addEventListener("mouseenter", () => {
    saveTabs.style.backgroundColor = "#E5FFCC";
});

saveTabs.addEventListener("mouseleave", () => {
    saveTabs.style.backgroundColor = "#B2FF66";
});

saveTabs.addEventListener("mousedown", () => {
    saveTabs.style.backgroundColor = "#66CC00";
});

saveTabs.addEventListener("mouseup", () => {
    saveTabs.style.backgroundColor = "#B2FF66";
});

