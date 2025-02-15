//Aqif the OPP


document.addEventListener('mousemove', setUpEnv)

// document.addEventListener('click', fullAuto)

async function fullAuto(){
    const save = document.querySelector('div.margin-left-small > button.button--action')
    let next = document.querySelector('ul.the-paginator-list').lastChild.firstChild
    // while(next.innerHTML === "Next"){
        console.log(next.innerHTML)
        next.click()
    // }
}

// const keywords = "bottle, cork, twine, glowing, galaxy, stars, mystical, fantasy, liquid, sparkles, night, cosmic, illumination, colorful, background, decorative, potion, amber, scientific, artistic"
// const title = "Glowing Galaxy Potion Bottle: Mystical Cork Twine Decor with Colorful Liquid and Sparkles in a Cosmic Night Background - An Artistic Fantasy of Illuminated Stars"
// document.addEventListener('click', function(){
//     input(keywords, title)})

// function input(keywords, title){
//     const titleBox = document.querySelector('textarea[aria-label="Content title"]')
//     const keywordBox = document.querySelector('textarea[aria-label="Paste Keywords..."]')
//     titleBox.value = title
//     titleBox.dispatchEvent(new Event('input', {bubbles: true}))

//     keywordBox.value = keywords
//     keywordBox.dispatchEvent(new Event('input', {bubbles: true}))
// }

async function setUpEnv(){
    if (!document.querySelector('button#the-btn')){
        const button = document.createElement('button');
        const icon = document.createElement("img");

        icon.src = await chrome.runtime.getURL("icons/icon2.png");
        icon.className = 'icon-asma';

        button.id = 'the-btn';
        button.appendChild(icon);

        const target = document.querySelector('div.visible');
        target.insertBefore(button, target.firstChild);

        setTimeout(
            function(){
                document.removeEventListener('mousemove', setUpEnv)
                // document.addEventListener('mousemove', makeKeys)
            }, 3000)


        let apiKey = await getAPIkey()
        let numKeys = await getNumKeys()
        let aiImages = await getAiImages()

        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (changes.api)
                apiKey = changes.api['newValue']
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
            //make a listener that toggles this listener on and off upon clicking play
            loadMetadata(apiKey, numKeys, aiImages)
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



async function loadMetadata(apiKey, numKeys, aiImages){

    const url = 'https://api.openai.com/v1/chat/completions'
    const header = new Headers({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    })

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
        console.log(data)

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
                content: "While under 190 characters, keep adding to the title from the first ten keywords"
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
        console.log(data)

        return data.choices[0].message.content
    }catch(err){
        alert('Something went wrong.')
        console.log(err)
    }
}

function checkGenAI(){
    const genAI = document.querySelector('input#content-tagger-generative-ai-checkbox')
    if (!genAI.checked)
        genAI.click()
}

function checkPeople(){
    const people = document.querySelector("input#content-tagger-generative-ai-property-release-checkbox")
    if (!people.checked)
        people.click()
}