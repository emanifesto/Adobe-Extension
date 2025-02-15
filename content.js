//Aqif the OPP


document.addEventListener('mousemove', setUpEnv)



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
            makeKeys(apiKey, numKeys, aiImages)
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



async function loadMetadata(){
    let apiKey = await getAPIkey()
    let numKeys = await getNumKeys()
    let aiImages = await getAiImages()
    // let button = await 
}

async function makeKeys(apiKey, numKeys, aiImages){
    console.log(apiKey)
    console.log(numKeys)
    console.log(aiImages + '\n')

    if (aiImages){
        checkGenAI()
    }

    const url = 'https://api.openai.com/v1/chat/completions'
    const image = document.querySelector(`div[aria-selected="true"] > div > img`).src
    const header = new Headers({
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    })

    const payload = {
        model: "gpt-4o-mini",
        messages: [
            {
                role: 'system',
                content: "Prioritize short-tail keywords and don't repeat the same words."//"You are the best SEO tool in the world. You make content easy to find in the Adobe Stock search algorithm.",
            },
            {
                role: 'user',
                content: [{
                        type: 'text',
                        text: `Analyze the image throughly. From it, respond with EXACTLY ${numKeys} mainly keywords separated by commas.`
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
            return
        }
        const data = await response.json()
        console.log('done')
        let roughKeys = data.choices[0].message.content
        console.log(roughKeys)

        if (roughKeys[roughKeys.length - 1] === '.')
            roughKeys = roughKeys.substring(0, roughKeys.length - 1)


        const temp = roughKeys.split(', ')
        if (temp.length > numKeys){
            const finalKeys = temp.slice(0, numKeys).join(', ')
            console.log(finalKeys)
        }else{
            console.log(roughKeys)
        }
        console.log(data.usage)

    }catch(err){
        alert(`Something went wrong. Try setting up API key and number of keywords.`)
        console.log(err)
    }

    if (aiImages){
        checkPeople()
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