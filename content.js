//Aqif the OPP

document.addEventListener('click', setUpEnv())

function stall(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function setUpEnv(){
    await stall(1500)
    if (!document.querySelector('button#the-btn')){
        const button = document.createElement('button');
        const icon = document.createElement("img");

        icon.src = await chrome.runtime.getURL("icon-asma2.png");
        icon.className = 'icon-asma';

        button.id = 'the-btn';
        button.appendChild(icon);

        const target = document.querySelector('div.visible');
        target.insertBefore(button, target.firstChild);

        let apiKey = await getAPIkey()
        let numKeys = await getNumKeys()
        let aiImages = await getAiImages()
        let releases = await getNoReleases()
        let payment = await getPayment()
        const url = 'https://api.openai.com/v1/chat/completions'
        let header = new Headers({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.api){
                apiKey = changes.api['newValue']
                header = new Headers({
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                })
            }
            if (changes.keywords)
                numKeys = changes.keywords['newValue']
            if (changes.aiImages)
                aiImages = changes.aiImages['newValue']
            if (changes.payment)
                payment = changes.payment['newValue']
            if (changes.releases)
                releases = changes.releases['newValue']
        })

        document.querySelector('button#the-btn').addEventListener('click', function(){

            try{
                if (payment === "null"){
                    alert('No subscription!')
                    throw new Error('No subscription.')
                }
                if (!apiKey){
                    alert('API key is not set!')
                    throw new Error('API key is not set.')
                }
                if (!numKeys){
                    alert('Number of keywords is not set!')
                    throw new Error('Number of keywords is not set.')
                }
                loadMetadata(numKeys, aiImages, releases, url, header)
            }catch(err){
                console.log(err)
            }
        })

        window.addEventListener('beforeunload', async function(e){
            try{
                chrome.storage.sync.set({'automation': null})
                e.preventDefault()
                e.returnValue = ' '
            }catch(err){
                console.log(err)
            }
        })
        
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

            if (message === 'started'){
                try{
                    if (!apiKey){
                        alert('API key is not set!')
                        throw new Error('API key is not set.')
                    }
                    if (!numKeys){
                        alert('Number of keywords is not set!')
                        throw new Error('Number of keywords is not set.')
                    }
                    sendResponse({'starting': 'true'})
                    await fullAuto(numKeys, aiImages, releases, url, header)
                    await chrome.storage.sync.set({'automation': null})
                    alert("All done!")
                }catch(err){
                    await chrome.storage.sync.set({'automation': null})
                    console.log(err)
                }
            }
        })
    }
}

async function getAPIkey(){
    const response = await chrome.storage.sync.get('api')
    const apiKey = response.api
    return apiKey
}

async function getNumKeys(){
    const response = await chrome.storage.sync.get('keywords')
    const numKeys = response.keywords
    return numKeys
}

async function getAiImages(){
    const response = await chrome.storage.sync.get('aiImages')
    const aiImages = response.aiImages
    return aiImages
}

async function getNoReleases(){
    const {releases} = await chrome.storage.sync.get('releases')
    return releases
}

async function getPayment(){
    const response = await chrome.storage.sync.get('payment')
    const payment = response.payment
    return payment
}

async function loadMetadata(numKeys, aiImages, releases, url, header){
    
    if (releases)
        checkNoReleases()

    if(aiImages)
        checkGenAI()

    let keywords = await makeKeys(numKeys, url, header)
    if (!keywords){
        console.log('Response failed; retrying keywords.')
        let retries = 0
        while (!keywords){
            if (retries >= 3){
                alert('OpenAI is experiencing issues. Retried keywords: 3 times.')
                throw new Error('OpenAI is experiencing issues. Retried keywords: 3 times.')
            }
            keywords = await makeKeys(numKeys, url, header)
            retries++
            console.log(`Retried keywords ${retries} time(s)`)
        }
    }

    let title = await makeTitle(keywords, url, header)
    if (!title){
        console.log('Response failed; retrying title.')
        let retries = 0
        while (!title){
            if (retries >= 3){
                alert('OpenAI is experiencing issues. Retried title: 3 times.')
                throw new Error('OpenAI is experiencing issues. Retried title: 3 times.')
            }
            title = await makeTitle(keywords, url, header)
            retries++
            console.log(`Retried title ${retries} time(s)`)
        }
    }

    while(document.querySelector('div.keywords-input')){
        await stall(200)
    }

    const titleBox = document.querySelector('textarea[aria-label="Content title"]')
    const keywordBox = document.querySelector('textarea[aria-label="Paste Keywords..."]')
    titleBox.value = title
    titleBox.dispatchEvent(new Event('input', {bubbles: true}))

    keywordBox.value = keywords
    keywordBox.dispatchEvent(new Event('input', {bubbles: true}))

    if (aiImages)
        checkPeople()

    await stall(500)
}

async function fullAuto(numKeys, aiImages, releases, url, header){

    let save = document.querySelector('div.margin-left-small > button.button--action')
    let next = document.querySelector('ul.the-paginator-list').lastChild.firstChild
    let running = true

    while(next.innerHTML === 'Next' && running){
        next = document.querySelector('ul.the-paginator-list').lastChild.firstChild
        let target = document.querySelector('div[aria-selected="true"]').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode

        while (target.className === 'container-inline-block' && running){
            target.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.click()
    
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message === 'halted'){
                    running = false
                }
            })
            if (!running){
                throw new Error('Program halted through extension.')
            }

            await loadMetadata(numKeys, aiImages, releases, url, header)

            target = target.nextSibling
            await stall(500)
        }

        if (!running){
            throw new Error('Program halted through extension.')
        }

        save.click()
        await stall(1000)
        save = document.querySelector('div.margin-left-small > button.button--action')
        while(save.innerHTML === "Saving work..."){
            save = document.querySelector('div.margin-left-small > button.button--action')
            await stall(1000)
        }
        
        await stall(2000)
        
        next.click()
        await stall(500)
        while (document.querySelector('div[data-t="content-spinner-wrapper"]').style.display === 'block'){
            await stall(500)
        }
        await stall(1000)
    }
}

async function makeKeys(numKeys, url, header){

    const image = document.querySelector(`div[aria-selected="true"] > div > img`).src

    const payload = {
        model: "gpt-4o-mini",
        messages: [
            {
                role: 'system',
                content: "Prioritize short-tail keywords and don't repeat the same words"
            },
            {
                role: 'user',
                content: [{
                        type: 'text',
                        text: `Analyze the image thoroughly. From it, respond with EXACTLY ${numKeys} keywords separated by commas`
                    },{
                        type: 'image_url',
                        image_url: {
                            'url': image,
                        }
                    }
                ]
            }
        ]
    }
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(payload)
        })
        if (!response.ok){
            throw new Error('OpenAI is experiencing issues.')
        }
        const data = await response.json()
        
        let roughKeys = data.choices[0].message.content

        if (roughKeys[roughKeys.length - 1] === '.')
            roughKeys = roughKeys.substring(0, roughKeys.length - 1)

        const temp = roughKeys.split(', ')
        if (temp.length > numKeys){
            const finalKeys = temp.slice(0, numKeys).join(', ')
            return finalKeys
        }else{
            return roughKeys
        }
    }catch(err){
        console.log(err)
    }
}

async function makeTitle(keywords, url, header){
    const payload = {
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: "After making the title; while under 190 characters, keep adding to the title from the first ten keywords. No surrounding quotes"
            },{
                role: 'user',
                content: `Analyze the following image keywords and respond with an SEO title. (${keywords})`
            }
        ]
    }

    try{
        const response = await fetch(url, {
            'method': 'POST',
            'headers': header,
            'body': JSON.stringify(payload)
        })
        if (!response.ok){
            throw new Error('OpenAI is experiencing issues.')
        }
        const data = await response.json()
        
        let title = data.choices[0].message.content
        while (title.length > 200){
            title = title.substring(0, title.lastIndexOf(" "))
        }
        return title
    }catch(err){
        console.log(err)
    }
}

function checkGenAI(){
    const editorial = document.querySelector('input[data-t="content-tagger-illustrative-editorial-checkbox"]')
    const genAI = document.querySelector('input#content-tagger-generative-ai-checkbox')
    if (editorial.checked)
        editorial.click()
    if (!genAI.checked)
        genAI.click()
}

function checkPeople(){
    const people = document.querySelector("input#content-tagger-generative-ai-property-release-checkbox")
    if (!people.checked)
        people.click()
}

function checkNoReleases(){
    const releases = document.querySelector('input[data-t="has-release-no"]')
    if (releases)
        releases.click()
}