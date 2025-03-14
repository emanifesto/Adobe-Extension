const saveAPI = document.getElementById("save-api")
const saveNum = document.getElementById('save-num')
const aiOnly = document.querySelector('input.check-ai-only')
const releases = document.querySelector('input.releases-check')
const subscription = document.querySelector('button.sub-btn-blue')

document.addEventListener('DOMContentLoaded', async ()=>{

    const {asmaID} = await chrome.storage.sync.get('asmaID')

    if(!asmaID){
        const newID = crypto.randomUUID()
        chrome.storage.sync.set({asmaID: `${newID}`})
    }

    chrome.storage.sync.get('api', function(result) {
        if (result.api){
            document.getElementById('api-text-box').value = result.api;
        }
    });

    chrome.storage.sync.get('keywords', function(result){
        if(result.keywords){
            document.getElementById('num-keywords-text-box').value = result.keywords;
        }
    })

    chrome.storage.sync.get('aiImages', (result) => {
        if(result.aiImages){
            aiOnly.checked = true
        }
    })

    chrome.storage.sync.get('releases', (result) => {
        if (result.releases)
            releases.checked = true
    })

    try{
        const response = await fetch("https://damisaas.com/asma/api/user", {
            'method': 'POST',
            'headers': new Headers({'Authorization': `Bearer ${asmaID}`}),
            'body': JSON.stringify({info: "payment"})
        })
        const data = await response.json()
        await chrome.storage.sync.set({payment: `${data.payment}`})
    }catch(err){
        console.log(err)
    }

    chrome.storage.sync.get('payment', async (result) => {
        if (result.payment === "null"){
            document.querySelector('p.text-upg-prem').innerHTML = 'Subscribe now to start your journey.'
        }else{
            let tab = await getCurrentTab()
            let scripts = await chrome.scripting.getRegisteredContentScripts()

            if (scripts.length === 0){
                try{
                    await chrome.scripting.registerContentScripts([{
                        js: ['content.js'],
                        matches: ['https://contributor.stock.adobe.com/*/uploads*'],
                        id: 'asma'
                    }])

                    await chrome.scripting.insertCSS({
                        target: {tabId: tab.id, allFrames: true},
                        css: "styles.css",
                    })
                    
                    await chrome.scripting.executeScript({
                        target: {tabId: tab.id, allFrames: true},
                        files: ["content.js"],
                    })
                }catch(err){
                    console.log(err)
                }
            }

            if (result.payment === 'metadata button'){
                document.querySelector('p.text-upg-prem').innerHTML = 'Upgrade subscription for full automation.'
            }
            else if (result.payment === 'hands free'){

                document.querySelector('p.text-upg-prem').style.display = 'none'

                const btnHolder = document.createElement('form')
                btnHolder.className = 'automate-btn-holder'

                const btn = document.createElement('button')
                btn.className = 'hands-free'

                const icon = document.createElement('div')
                let response = await chrome.storage.sync.get('automation')
                if (response.automation)
                    icon.className = 'pause-stock-auto'
                else
                    icon.className = 'play-stock-auto'

                btn.appendChild(icon)
                btnHolder.appendChild(btn)

                const target = document.querySelector('div.footer-sub-feed')
                target.parentNode.insertBefore(btnHolder, target)

                btn.addEventListener('click', async function(){
                    tab = await getCurrentTab()
                    
                    if (icon.className === 'play-stock-auto'){
                        chrome.tabs.sendMessage(tab.id, 'started', function(response) {
                            if (!response)
                                alert("Please reload the page.")
                            else{
                                if (response.starting){
                                    chrome.power.requestKeepAwake('display')
                                    icon.className = 'pause-stock-auto'
                                    chrome.storage.sync.set({'automation': 'running'})
                                }
                            }
                        })
                    }
                    else if (icon.className === 'pause-stock-auto'){
                        icon.className = 'play-stock-auto'
                        chrome.storage.sync.set({'automation': null})
                    }
                })

                chrome.storage.onChanged.addListener((changes) => {
                    if (changes.automation){
                        if (changes.automation['newValue'] === null){
                            chrome.power.releaseKeepAwake()
                            chrome.tabs.sendMessage(tab.id, 'halted')
                            icon.className = 'play-stock-auto'
                        }
                    }
                })
            }
        }
    })
})

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function getAutomation(){
    const response = await chrome.storage.sync.get('automation')
    const automation = response.automation
    return automation
}

saveAPI.addEventListener('click', function() {
    const APIKey = document.getElementById('api-text-box').value;
    chrome.storage.sync.set({ 'api': APIKey }, function() {
        alert('Saved.');
    });
});

saveNum.addEventListener('click', function(){
    const numsKeywords = document.getElementById('num-keywords-text-box').value;
    if ((Number(numsKeywords) > 0 && Number(numsKeywords) < 50) || !numsKeywords){
        chrome.storage.sync.set({ 'keywords': numsKeywords }, function(){
            alert('Saved.')
        })
    }else{
        alert("Try a number between 1 and 49.")
    }
})

aiOnly.addEventListener('click', function(){
    if (aiOnly.checked)
        chrome.storage.sync.set({'aiImages': "true"})
    else
        chrome.storage.sync.set({'aiImages': null})
})

releases.addEventListener('click', function(){
    if (releases.checked)
        chrome.storage.sync.set({'releases': 'no'})
    else
        chrome.storage.sync.set({'releases': null})
})

subscription.addEventListener('click', async function(){
    const response = await chrome.storage.sync.get('asmaID')
    const asmaID = response.asmaID
    chrome.tabs.create({ url: `https://damisaas.com/asma/pricing?${asmaID}`})
})