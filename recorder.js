let mediaRecorder;
let audioChunks = [];
let audioBlob;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const audioPlayback = document.getElementById('audioPlayback');
const downloadBtn = document.getElementById('downloadBtn');

async function transcribeAudio() {
  try {
    const formData = new FormData;
    formData.append('audio', audioBlob, 'recording.webm');

    startBtn.disabled = true;
    stopBtn.disabled = true;

    transcribeBtn.disabled = true;
    transcribeBtn.innerText = 'Processing...';

    const response = await fetch(`${workflowUrl}/transribe-and-summarize`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(errText);
    }

    const result = await response.json();
    document.getElementById('key_points').value = result.summary;
    transcribeBtn.innerText = 'Transcribe';
    startBtn.disabled = false;
  } catch (error) {
    console.error("Transcription failed:", error);
    return null;
  }
}

const record = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioUrl;

      downloadBtn.disabled = false;
      transcribeBtn.disabled = false;
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    transcribeBtn.disabled = true;
    stopBtn.disabled = false;

    console.log('Recording started...');
  } catch (err) {
    alert('Microphone access denied or not available.');
    console.error(err);
  }
}

startBtn.addEventListener('click', function(){
  record();
});

transcribeBtn.addEventListener('click', function(){
  transcribeAudio();
});

downloadBtn.addEventListener('click', function(){
  const a = document.createElement('a');
  a.href = audioPlayback.src;
  a.download = 'recording.webm';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

stopBtn.addEventListener('click', () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  transcribeBtn.disabled = true;
  console.log('Recording stopped.');
});