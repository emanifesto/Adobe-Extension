// const saveAPI = document.getElementById("save-api")
const saveNum = document.getElementById('save-num')
const aiOnly = document.querySelector('input.check-ai-only')
const subsciprtion = document.querySelector('button.sub-btn-blue')
const feedback = document.querySelector('button.feed-btn-orange')

console.log('does this work?')

document.addEventListener('DOMContentLoaded', ()=>{
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

    // document.addEventListener('mousemove', injectButton);
})


document.getElementById('save-api').addEventListener('click', function() {
    const APIKey = document.getElementById('api-text-box').value;
    chrome.storage.sync.set({ 'api': APIKey }, function() {
        alert('Saved.');
    });
});

document.getElementById('save-num').addEventListener('click', function(){
    const numsKeywords = document.getElementById('num-keywords-text-box').value;
    chrome.storage.sync.set({ 'keywords': numsKeywords }, function(){
        alert('Saved.')
    })
})