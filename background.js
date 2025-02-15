const saveAPI = document.getElementById("save-api")
const saveNum = document.getElementById('save-num')
const aiOnly = document.querySelector('input.check-ai-only')
const subsciprtion = document.querySelector('button.sub-btn-blue')
const feedback = document.querySelector('button.feed-btn-orange')


document.addEventListener('DOMContentLoaded', ()=>{

    console.log(chrome.storage)

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
})


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