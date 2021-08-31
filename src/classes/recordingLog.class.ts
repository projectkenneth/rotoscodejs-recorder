export class RecordingLogItem {
    readonly timestamp: number;
    readonly text: string;

    constructor(timestamp: number, text: string) {
        this.timestamp = timestamp;
        this.text = text;
    }
}

export class RecordingLog {
    private startTimestampMS: number = 0;
    private endTimestampMS: number = 0;
    private initialText: string = '';
    private changeLog: RecordingLogItem[] = [];

    init(initialText: string, startTime: Date) {
        this.initialText = initialText;
        this.startTimestampMS = startTime.getTime();
        this.changeLog = [];
    }

    wrapUp(curTime: Date) {
        if (this.changeLog.length > 0) {
            this.endTimestampMS = this.changeLog[this.changeLog.length - 1].timestamp;
        } else {
            this.endTimestampMS = 0;
        }
    }

    addLogItem(curTime: Date, text: string) {
        if (this.changeLog.length === 0 || text !== this.changeLog[this.changeLog.length - 1].text) {
            let millisecondTimestamp = curTime.getTime() - this.startTimestampMS;

            this.changeLog.push(new RecordingLogItem(millisecondTimestamp, text));
        }
    }

    export(): { endTimestampMS: number, initialText: string, changeLog: RecordingLogItem[] } {
        return {
            endTimestampMS: this.endTimestampMS,
            initialText: this.initialText,
            changeLog: this.changeLog
        };
    }
}