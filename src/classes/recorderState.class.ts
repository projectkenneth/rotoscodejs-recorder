import { RecordingLog } from './recordingLog.class';

export class RecorderState {
    isRecording: boolean = false;
    recordingLog: RecordingLog = new RecordingLog();

    startRecording(initialText: string) {
        this.isRecording = true;
        this.recordingLog.init(initialText, new Date());
    }

    stopRecording() {
        this.isRecording = false;
        this.recordingLog.wrapUp(new Date());
    }
}