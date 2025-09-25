(function(){
  const workflowUrl = 'https://balancecore.n8n.superlazy.ai/webhook';

  fetch(`${workflowUrl}/clients`)
    .then(response => response.json())
    .then(({ data: clients }) => {
      const clientOptions = clients.map(client => `<option value="${client['Phone Number']}">${client.Name}</option>`)
      document.getElementById('client').innerHTML += clientOptions.join('');
    });

  document.querySelector('button[name="submit"]').addEventListener('click', function(e){
    e.preventDefault();

    const formData = new FormData;
    formData.append('client', document.getElementById('client').value);
    formData.append('key_points', document.getElementById('key_points').value || '');
    formData.append('homework', document.getElementById('homework').value || '');

    const attachments = document.getElementById('file').files;
    for(let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      formData.append(`file[]`, attachment);
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
      this.setAttribute('disabled', 'disabled');
    })
    .catch(console.error);
  });


})();

