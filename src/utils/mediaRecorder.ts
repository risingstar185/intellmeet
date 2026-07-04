export default class PCMRecorder {
  private socket: any;
  private roomId: string;
  private stream: MediaStream;

  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;

  constructor(socket: any, roomId: string, stream: MediaStream) {
    this.socket = socket;
    this.roomId = roomId;
    this.stream = stream;
  }

  async start() {
    this.audioContext = new AudioContext({
      sampleRate: 16000,
    });

    this.source = this.audioContext.createMediaStreamSource(this.stream);

    this.processor = this.audioContext.createScriptProcessor(
      4096,
      1,
      1
    );

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.processor.onaudioprocess = (event) => {

  //  console.log("Processing audio")
      const input = event.inputBuffer.getChannelData(0);
//console.log(input.length)
      const pcm = this.floatTo16BitPCM(input);

   // console.log(pcm.byteLength)
      this.socket.emit("audio-chunk", {
        roomId: this.roomId,
       chunk: pcm,
       // chunk: Array.from(new Uint8Array(pcm))
      });
    };

    console.log("🎤 Recorder Started");
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log("🛑 Recorder Stopped");
  }

  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);

    let offset = 0;

    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));

      view.setInt16(
        offset,
        s < 0 ? s * 0x8000 : s * 0x7fff,
        true
      );
    }

    return buffer;
  }
}