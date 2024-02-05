function loadRequestFile() {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    const result = event.target.result;
    const fileContent = JSON.parse(result);
    _loadFormData(fileContent);
  });

  let input = document.createElement('input');
  input.type = 'file';
  input.onchange = _ => {
    let selectedFile = Array.from(input.files)[0];
    document.getElementById('inputFilePath').value = selectedFile.name;

    reader.readAsText(selectedFile);
  };
  input.click();
}

function saveRequestFile() {
  const fileContent = _getCurrentFormData();

  var textBlob = new Blob([JSON.stringify(fileContent)], { type: 'text/plain' });
  const fileName = document.getElementById('inputFilePath').value || 'request.json';

  var tempLink = document.createElement("a");
  tempLink.setAttribute('href', URL.createObjectURL(textBlob));
  tempLink.setAttribute('download', fileName);
  tempLink.click();
  URL.revokeObjectURL(tempLink.href);
}

function selectActionVerb(item) {
  document.getElementById('actionDropdownVerb').innerHTML = item.innerHTML;

  const methodsWithoutBody = ['GET', 'DELETE', 'OPTIONS', 'HEAD'];
  if (methodsWithoutBody.includes(item.innerHTML)) {
    document.getElementById('requestTextareaBody').readOnly = true;
    document.getElementById('requestTextareaBody').value = '';
  } else {
    document.getElementById('requestTextareaBody').readOnly = false;
  }
}

function _loadFormData(formData) {
  document.getElementById('actionDropdownVerb').innerHTML = formData.method;
  document.getElementById('actionInputUrl').value = formData.url;
  document.getElementById('requestTextareaBody').value = formData.body;
  document.getElementById('requestTextareaHeaders').value = formData.headers;
}

function _getCurrentFormData() {
  const method = document.getElementById('actionDropdownVerb').innerHTML;
  const url = document.getElementById('actionInputUrl').value;
  const body = document.getElementById('requestTextareaBody').value;
  const headers = document.getElementById('requestTextareaHeaders').value;

  return {
    method,
    url,
    body,
    headers
  };
}

function sendRequest() {
  _clearResponseData();
  const url = document.getElementById('actionInputUrl').value;
  const method = document.getElementById('actionDropdownVerb').innerHTML;
  const body = document.getElementById('requestTextareaBody').value;
  const headers = document.getElementById('requestTextareaHeaders').value;

  const requestParams = {
    method
  }

  if (method !== 'GET' && body) {
    requestParams.body = body.replace(/\n/g, '');
  }

  if (headers) {
    requestParams.headers = {
      ...headers.split('\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        acc[key] = value;
        return acc;
      }, {})
    };
  }

  _addConsoleLog('Sending request...');

  const srcTime = new Date().getTime();

  fetch(url, requestParams)
    .then(response => {
      _addConsoleLog('Response received!');
      document.getElementById('responseStatusInput').value = _getHttpStatusMessage(response.status);
      document.getElementById('responseTimeInput').value = `${new Date().getTime() - srcTime}ms`;
      let reponseHeadersText = '';
      for (var pair of response.headers.entries()) {
        reponseHeadersText += pair[0] + ': ' + pair[1] + '\n';
      }
      document.getElementById('responseHeadersTextarea').value = reponseHeadersText;

      return response.json();
    })
    .then(responseJson => {
      document.getElementById('responseTextarea').value = JSON.stringify(responseJson, null, 2);
    })
    .catch(error => {
      console.error('Error:', error);
      _addConsoleLog(error.stack || error.message || error);
    });
}

function _getHttpStatusMessage(statusCode) {
  const friendlyHttpStatus = {
    '200': 'OK',
    '201': 'Created',
    '202': 'Accepted',
    '203': 'Non-Authoritative Information',
    '204': 'No Content',
    '205': 'Reset Content',
    '206': 'Partial Content',
    '300': 'Multiple Choices',
    '301': 'Moved Permanently',
    '302': 'Found',
    '303': 'See Other',
    '304': 'Not Modified',
    '305': 'Use Proxy',
    '306': 'Unused',
    '307': 'Temporary Redirect',
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '402': 'Payment Required',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',
    '407': 'Proxy Authentication Required',
    '408': 'Request Timeout',
    '409': 'Conflict',
    '410': 'Gone',
    '411': 'Length Required',
    '412': 'Precondition Required',
    '413': 'Request Entry Too Large',
    '414': 'Request-URI Too Long',
    '415': 'Unsupported Media Type',
    '416': 'Requested Range Not Satisfiable',
    '417': 'Expectation Failed',
    '418': 'I\'m a teapot',
    '429': 'Too Many Requests',
    '500': 'Internal Server Error',
    '501': 'Not Implemented',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
    '505': 'HTTP Version Not Supported',
  };
  return `${statusCode} - ${friendlyHttpStatus[statusCode]}`;
}

function _addConsoleLog(message) {
  const today = new Date();
  const messageToLog = `${today.toISOString()} - ${message.replace(/\n/g, '')}\n`;
  const currentLogs = document.getElementById('consoleLogsTextarea').value;
  document.getElementById('consoleLogsTextarea').value = messageToLog + currentLogs;
}

function _clearResponseData() {
  document.getElementById('responseStatusInput').value = '';
  document.getElementById('responseTimeInput').value = '';
  document.getElementById('responseTextarea').value = '';
  document.getElementById('responseHeadersTextarea').value = '';
}

$(document).ready(function () {
  console.log('ready');
});