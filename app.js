const workflowUrl = 'https://balancecore.n8n.superlazy.ai/webhook';
let clients = [];

(function(){
  fetch(`${workflowUrl}/clients`)
    .then(response => response.json())
    .then(({ data }) => {
      clients = data;
      const clientOptions = clients.map(client => `<option value="${client['Phone Number']}">${client.Name}</option>`)
      document.getElementById('client').innerHTML += clientOptions.join('');
    });

  const validateForm = (data = {}) => {
    const schema = joi.object({
      clientPhone: joi.string().required(),
      clientName: joi.string().required(),
      keyPoints: joi.string().allow('', null),
      homework: joi.string().allow('', null),
    });

    return schema.validate(data, { abortEarly: false }); // show all errors
  }

  document.querySelector('button[name="submit"]').addEventListener('click', async function(e){
    e.preventDefault();
    const clientPhone = document.getElementById('client').value;
    const clientName = document.querySelector(`option[value="${clientPhone}"]`).text;
    const clientEmail = clients.find(client => client['Phone Number']?.toString() === clientPhone)?.Email || '';
    const keyPoints = document.getElementById('key_points').value || '';
    const homework = document.getElementById('homework').value || '';

    const errors = validateForm({
      clientPhone,
      clientName,
      keyPoints,
      homework
    });

    if (errors?.error?.details) {
      const errorMessage = errors
        .error
        .details
        .map(error => error.message)
        .join('\n');

      alert(errorMessage);
      return;
    }

    const formData = new FormData;
    formData.append('client_name', clientName);
    formData.append('client_phone', clientPhone);
    formData.append('client_email', clientEmail);
    formData.append('key_points', keyPoints);
    formData.append('homework', homework);

    const audioSrc = document.querySelector('audio').getAttribute('src');
    if (audioSrc) {
      const audioResponse = await fetch(audioSrc);
      const audioBlob = await audioResponse.blob();
      formData.append('file[]', audioBlob);
    }

    const attachments = document.getElementById('file').files;
    for(let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      formData.append('file[]', attachment);
    }

    this.textContent = 'Please wait...'
    this.setAttribute('disabled', 'disabled');

    fetch(`${workflowUrl}/post-theraphy`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(response => {
      this.textContent = 'Done'
    })
    .catch((error) => {
      this.textContent = 'Error'
      console.error(error);
    });
  });

})();
