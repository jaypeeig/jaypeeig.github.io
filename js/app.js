
function order_by_occurrence(arr) {
    var counts = {};
    arr.forEach(function (value) {
        if (!counts[value]) {
            counts[value] = 0;
        }
        counts[value]++;
    });

    return Object.keys(counts).sort(function (curKey, nextKey) {
        return counts[curKey] < counts[nextKey];
    });
}

function load_quagga() {
    if ($('#barcode-scanner').length > 0 && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {


        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                numOfWorkers: navigator.hardwareConcurrency,
                target: document.querySelector('#barcode-scanner')
            },
            decoder: {
                //readers: ['ean_reader', 'ean_8_reader', 'code_39_reader', 'code_39_vin_reader', 'codabar_reader', 'upc_reader', 'upc_e_reader']
                readers: ["code_128_reader"] 
            },
            debug: {
                drawBoundingBox: false,
                showFrequency: false,
                drawScanline: false,
                showPattern: false
            }
        }, function (err) {
            if (err) { console.log(err); return }
            Quagga.initialized = true;
            Quagga.start();
        });

        var last_result = [];
        if (Quagga.initialized == undefined) {
            Quagga.onDetected(function (result) {
                var last_code = result.codeResult.code;
                console.log(last_code);
                last_result.push(last_code);
                if (last_result.length > 6) {
                    code = order_by_occurrence(last_result)[0];
                    last_result = [];
                    Quagga.stop();
                    
                    var url = window.location.href;
                    if (url.indexOf('?') > -1) {
                        url += '&barcode=' + code;
                    } else {
                        url += '?barcode=' + code;
                    }
                    window.location.href = url;
                }
            });
        }

    }else{
        alert('media not supported');
    }
};

$(function(){
    url = new URL(window.location.href);

    if (url.searchParams.get('barcode')) {
        $('#bcode_result').html('Barcode found! ' + url.searchParams.get('barcode'));
    }else{
        load_quagga();
    }
});