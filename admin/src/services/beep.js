export function beep(duration = 200, frequency = 440, volume = 1, type = 'sine') {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, duration);
}