const messageForm = document.getElementById('input-form')
const messageInput = document.getElementById('input-country')
const cont=document.getElementById('overall-stats-country')


messageForm.addEventListener('submit', e => {

    e.preventDefault()
    const message = messageInput.value;

    


    messageInput.value = ''
});