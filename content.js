//Aqif the OPP

// document.addEventListener('mousemove', function handler(){
//     this.removeEventListener('mousemove', handler)
//     setUpEnv()
// })

document.addEventListener('click', setUpEnv())



// document.addEventListener('keypress', function(){
//     const iledco = document.querySelector('input#illustrativeEditorialContent')
//     console.log(iledco.checked)
// })

function stall(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function setUpEnv(){
    await stall(2000)
    if (!document.querySelector('button#the-btn')){
        const button = document.createElement('button');
        const icon = document.createElement("img");

        icon.src = await chrome.runtime.getURL("icon-asma2.png");
        icon.className = 'icon-asma';

        button.id = 'the-btn';
        button.appendChild(icon);

        const target = document.querySelector('div.visible');
        target.insertBefore(button, target.firstChild);

        // document.removeEventListener('click', setUpEnv)

        let apiKey = await getAPIkey()
        let numKeys = await getNumKeys()
        let aiImages = await getAiImages()
        const url = 'https://api.openai.com/v1/chat/completions'
        let header = new Headers({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        })

        chrome.storage.onChanged.addListener((changes, namespace) => {
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
        })

        document.querySelector('button#the-btn').addEventListener('click', function(){
            if (!apiKey){
                alert('API key is not set!')
                throw new Error('API key is not set.')
            }
            if (!numKeys){
                alert('Number of keywords is not set!')
                throw new Error('Number of keywords is not set.')
            }
            loadMetadata(numKeys, aiImages, url, header)
        })

        
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            console.log('got the message')

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
                    sendResponse({'started': true}); await stall(5000)
                    // await fullAuto(numKeys, aiImages, url, header)
                    alert("All done!")
                }catch(err){
                    if (err.message === 'Program halted through extension.'){
                        console.log(err.message)
                    }
                    else{
                        alert('Something went wrong!')
                        console.log(err)
                    }
                }finally{
                    chrome.runtime.sendMessage('stopped')
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

async function loadMetadata(numKeys, aiImages, url, header){

    if(aiImages)
        checkGenAI()

    const keywords = await makeKeys(numKeys, url, header)
    const title = await makeTitle(keywords, url, header)

    const titleBox = document.querySelector('textarea[aria-label="Content title"]')
    const keywordBox = document.querySelector('textarea[aria-label="Paste Keywords..."]')
    titleBox.value = title
    titleBox.dispatchEvent(new Event('input', {bubbles: true}))

    keywordBox.value = keywords
    keywordBox.dispatchEvent(new Event('input', {bubbles: true}))

    if (aiImages)
        checkPeople()
}

async function fullAuto(numKeys, aiImages, url, header){
    //throw errors
    //try catch  - sending message to switch pause to play if finished or stopped abruptly
    let save = document.querySelector('div.margin-left-small > button.button--action')
    let next = document.querySelector('ul.the-paginator-list').lastChild.firstChild
    let running = true
    // console.log('entering loop')

    while(next.innerHTML === 'Next' && running){
        next = document.querySelector('ul.the-paginator-list').lastChild.firstChild
        let target = document.querySelector('div[aria-selected="true"]').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode

        // await stall(1000)
        // console.log('metadata-ing')

        while (target.className === 'container-inline-block' && running){
            target.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.click()

            while(document.querySelector('div.keywords-input')){
                await stall(200)
            }
            
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message === 'halted'){
                    running = false
                }
            })
            if (!running){
                throw new Error('Program halted through extension.')
            }

            await loadMetadata(numKeys, aiImages, url, header)
            // checkGenAI()

            // await stall(1000)//metadata-ing

            target = target.nextSibling
            await stall(500)
        }

        if (!running){
            throw new Error('Program halted through extension.')
        }

        save.click()//#2D8CEB
        await stall(5000)
        save = document.querySelector('div.margin-left-small > button.button--action')
        while(save.innerHTML === "Saving work..."){
            await stall(1000)
        }

        await stall(5000)
        // console.log('metadata saved')
        
        next.click()
        await stall(500)
        while (document.querySelector('div[data-t="content-spinner-wrapper"]').style.display === 'block'){
            await stall(500)
        }
    }
}

async function makeKeys(numKeys, url, header){

    const image = document.querySelector(`div[aria-selected="true"] > div > img`).src

    const payload = {
        model: "gpt-4o-mini",
        messages: [
            {
                role: 'system',
                content: "Prioritize short-tail keywords and don't repeat the same words"//"You are the best SEO tool in the world. You make content easy to find in the Adobe Stock search algorithm.",
            },
            {
                role: 'user',
                content: [{
                        type: 'text',
                        text: `Analyze the image throughly. From it, respond with EXACTLY ${numKeys} keywords separated by commas`
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
            alert("OpenAI is experiencing issues!")
            throw new Error('OpenAI is experiencing issues.')
        }
        const data = await response.json()
        // console.log(data)

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
        alert(`Something went wrong. Try setting up API key and number of keywords.`)
        console.log(err)
    }
}

async function makeTitle(keywords, url, header){
    const payload = {
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: "While under 190 characters, keep adding to the title from the first ten keywords."
            },{
                role: 'user',
                content: `Analyze the following image keywords and respond with an SEO title. (${keywords})`
            }
        ]
    }
//While under 190 characters, keep adding to the title from the first ten keywords.
//ALWAYS include the first 10 keywords and don't go over 200 characters
    try{
        const response = await fetch(url, {
            'method': 'POST',
            'headers': header,
            'body': JSON.stringify(payload)
        })
        if (!response.ok){
            alert("OpenAI is experiencing issues!")
            throw new Error('OpenAI is experiencing issues.')
        }
        const data = await response.json()
        // console.log(data)

        let title = data.choices[0].message.content
        while (title.length > 200){
            title = title.substring(0, title.lastIndexOf(" "))
        }
        return title
    }catch(err){
        alert('Something went wrong.')
        console.log(err)
    }
}

function checkGenAI(){
    const editorial = document.querySelector('input#illustrativeEditorialContent')
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