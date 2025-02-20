const saveAPI = document.getElementById("save-api")
const saveNum = document.getElementById('save-num')
const aiOnly = document.querySelector('input.check-ai-only')
const subsciprtion = document.querySelector('button.sub-btn-blue')
const feedback = document.querySelector('button.feed-btn-orange')


document.addEventListener('DOMContentLoaded', ()=>{

    // chrome.scripting.registerContentScripts(['content.js'])

    document.addEventListener('click', async function(){
        const automation = await getAutomation()
        console.log(automation)
    })

//chrome-extension://gnapbdecbbnaalohhpcocalcefhlofnk
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


    chrome.storage.sync.get('payment', async (result) => {
        if (result.payment === 'none'){
            document.querySelector('p.text-upg-prem').innerHTML = 'Upgrade to premium for full automation.'
        }
        if (result.payment === 'hands free'){

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

            const target = document.querySelector('form.footer-sub-feed')
            target.parentNode.insertBefore(btnHolder, target)

            btn.addEventListener('click', async function(){

                async function getCurrentTab() {
                    let queryOptions = { active: true, lastFocusedWindow: true };
                    let [tab] = await chrome.tabs.query(queryOptions);
                    return tab;
                  }


                // chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
                //     if (message === 'stopped'){
                //         icon.className = 'play-stock-auto'
                //         chrome.storage.sync.set({'automation': null})
                //     }
                // })                

                let tab = await getCurrentTab()
                  
                if (icon.className === 'play-stock-auto'){
                    chrome.tabs.sendMessage(tab.id, 'started', function(response) {
                        if (!response)
                            alert("Please reload the page.")
                        else{
                            if (response.starting){
                                icon.className = 'pause-stock-auto'
                                chrome.storage.sync.set({'automation': 'running'})
                            }
                        }
                    })
                }
                else if (icon.className === 'pause-stock-auto'){
                    icon.className = 'play-stock-auto'
                    chrome.storage.sync.set({'automation': null})
                    chrome.tabs.sendMessage(tab.id, 'halted')
                }
            })

            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message === 'stopped'){
                    icon.className = 'play-stock-auto'
                    chrome.storage.sync.set({'automation': null})
                }
            })

            // window.addEventListener('beforeunload', function(){
            //     icon.className = 'play-stock-auto'
            //     chrome.storage.sync.set({'automation': null})
            // })
        }
    })
})

chrome.storage.sync.set({'payment': 'hands free'})


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