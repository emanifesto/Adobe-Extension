document.addEventListener('DOMContentLoaded', async function(){


    const defaultSubject = document.querySelector('input[value="feedback"]')
    defaultSubject.checked = true

    const submit = document.querySelector('button.submit-btn')

    submit.addEventListener('click', async function(event){

        const form = document.querySelector('form.feed-form')
        if (form.checkValidity()){

            event.preventDefault()
            const main = document.querySelector('main')
            main.setAttribute('style', 'display:none;')
            const message = document.createElement('h1')
            message.className = 'post-feed-message'
            message.setAttribute('style', 'margin: 30px; text-align: center;')
            message.textContent = 'sending...'
            main.parentNode.appendChild(message)

            const {asmaID} = await chrome.storage.sync.get('asmaID')
            const email = document.getElementById('feed-email').value
            const issue = document.querySelector('input[value="issue"]').checked
            const other = document.querySelector('input[value="other"]').checked
            const body = document.getElementById('feed-body').value
            let subject = 'feedback'

            if (issue){
                subject = 'issue'
            }else if (other){
                subject = 'other'
            }

            const response = await fetch('https://damisaas.com/asma/api/feedback', {
                method: 'POST',
                headers: new Headers({'Authorization': `Bearer ${asmaID}`}),
                body: JSON.stringify({'email': `${email}`, 'subject': `${subject}`, 'feedback': `${body}`})
            })
            if (response.ok){
                document.querySelector('h1.post-feed-message').textContent = "Feedback recieved."
            }else{
                document.querySelector('h1.post-feed-message').textContent = "Please try again."
            }
        }
    })
})