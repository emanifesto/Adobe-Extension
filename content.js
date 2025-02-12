//Aqif the OPP

// document.addEventListener('mousemove', injectButton);
// setTimeout(
//     function(){
//         document.removeEventListener('mousemove', injectButton)
//     }, 60000)

// document.addEventListener('mousemove', function(){
//     // document.getElementById('num-keywords-text-box').value = "yamada"
//     document.getElementById('the-btn').click
// });

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
    }
}

