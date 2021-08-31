(function () {
    const $ = (q, c = document) => c.querySelector(q);

    const vscode = acquireVsCodeApi();

    const $controlDiv = $('#controlDiv');
    const $controlButton = $('#controlButton');
    const $recordingState = $('#recordingState');
    const $recordingStateText = $('#recordingStateText');

    const $prepareDiv = $('#prepareDiv');
    const $prepareNumber = $('#prepareNumber');
    
    const $playButton = $('#playButton');

    const $originalOutputCode = $('#originalOutputCode');
    const $outputDiv = $('#outputDiv');
    const $outputCode = $('#outputCode');
    const $outputCodeRaw = $('#outputCodeRaw');
    const $copyOutputCode = $('#copyOutputCode');

    let isRecording = false;
    let countdownTimer;
    let countdownNumber = 3;

    const rotoscodeObj = rotoscodejs({
        element: $('#codeplayer'),
        recordingData: {},
        onRender: (el) => {
            hljs.highlightElement(el);
        },
        onPlay: (runningTimestamp, endTimestamp) => {
            $('#codeplayer-ts').innerHTML = runningTimestamp + " / " + endTimestamp;
        }
    });

    function _toggleDisplay(_isRecording) {
        if (_isRecording) {
            $recordingState.classList.add('is-recording');
            $recordingStateText.innerHTML = 'Recording...';

            $controlButton.classList.add('is-recording');
            $controlButton.innerHTML = "Stop Recording";
        } else {
            $recordingState.classList.remove('is-recording');
            $recordingStateText.innerHTML = 'Not Recording';

            $controlButton.classList.remove('is-recording');
            $controlButton.innerHTML = "Start Recording";
        }
    }

    function _onControlStartRecording() {
        $outputDiv.classList.add('hide');
        $controlDiv.classList.add('hide');
        $prepareDiv.classList.remove('hide');

        $prepareNumber.innerText = 3;
        countdownNumber = 2;

        countdownTimer = setInterval(() => {
            $prepareNumber.innerText = countdownNumber > 0 ? countdownNumber : 'Go!';

            if (countdownNumber === 0) {
                clearInterval(countdownTimer);

                vscode.postMessage({ type: 'startRecording' });

                $controlDiv.classList.remove('hide');
                $prepareDiv.classList.add('hide');

                isRecording = !isRecording;

                _toggleDisplay(isRecording);
            }

            countdownNumber--;
        }, 1000);
    }

    function _onControlStopRecording() {
        vscode.postMessage({ type: 'stopRecording' });

        isRecording = !isRecording;

        _toggleDisplay(isRecording);
    }

    function _onMessageReceivedStopRecording(recordingData) {
        rotoscodeObj.updateData(recordingData);
        rotoscodeObj.play();

        $outputCodeRaw.value = $originalOutputCode.value.replace('{RD}', JSON.stringify(recordingData));

        $outputCode.innerHTML = $outputCodeRaw.value.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });

        $outputDiv.classList.remove('hide');

        hljs.highlightElement($outputCode);
    }

    $controlButton.addEventListener('click', () => {
        if (isRecording) {
            _onControlStopRecording();
        } else {
            _onControlStartRecording();
        }
    });

    $playButton.addEventListener('click', () => {
        rotoscodeObj.jump(0);
        rotoscodeObj.play();
    });

    $copyOutputCode.addEventListener('click', () => {
        navigator.clipboard.writeText($outputCodeRaw.value);
        vscode.postMessage({ type: 'outputCopied' });
    });

    window.addEventListener('message', ({ data: { type, recordingData } }) => {
        if (type === 'stopRecording') {
            _onMessageReceivedStopRecording(recordingData);
        }
    });

    _toggleDisplay(isRecording);
})();