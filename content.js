//Aqif the OPP

document.addEventListener('mousemove', injectButton);
// document.addEventListener('click', function(){
//     const apiKey = chrome.storage.sync.get('api', function(result){
//         const apiKey = result.api
//         return result.api
//     })
//     console.log(apiKey)
// })

// document.addEventListener('mousemove', function(){
//     document.getElementById('num-keywords-text-box').value = "yamada"
//     console.log('clicking')
//     document.getElementById('the-btn').click()
// });

// document.getElementById('the-btn').addEventListener('click', console.log('they touching me'))


function injectButton(){
    if (!document.querySelector('button#the-btn')){
        const button = document.createElement('button');
        const icon = document.createElement("img");

        icon.src = chrome.runtime.getURL("icons/icon2.png");
        icon.className = 'icon-asma';

        button.id = 'the-btn';
        button.appendChild(icon);

        const target = document.querySelector('div.margin-bottom-xlarge');
        target.appendChild(button);

        setTimeout(
            function(){
                document.removeEventListener('mousemove', injectButton)
            }, 3000)
        
        document.getElementById('the-btn').addEventListener('click', makeKeys)
    }
}

async function makeKeys(){
    chrome.storage.sync.get('api', (result) =>{
        const apiKey = result.api
        if (!result.api){
            alert('API key is not set!')
            throw new Error('API key is not set.')
        }
    
        chrome.storage.sync.get('keywords', async (result) => {
            const numKeys = result.keywords
            if (!result.keywords){
                alert("Number of keywords is not set!")
                throw new Error('Number of keywords is not set.')
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
                        content: "You are the best SEO tool in the world. You make content easy to find in the Adobe Stock search algorithm.",
                    },{
                        role: 'user',
                        content: [{
                                type: 'text',
                                text: `Analyze the image throughly. From it, respond with EXACTLY ${numKeys} keywords separated by commas.`
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
                console.log(data.choices)
                console.log(data.usage)
            }catch(err){
                alert(`Something went wrong. Try setting up API key and number of keywords.`)
                console.log(err)
            }
        })
    })
}