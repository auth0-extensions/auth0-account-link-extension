/* global CodeMirror */

(function () {
  function performLogin() {
    window.location.href = '/login';
  }

  var SS_TOKEN_KEY = 'com.auth0.account_linking.admin_ui.session_token';

  var token = sessionStorage.getItem(SS_TOKEN_KEY);
  
  if (!token) {
    performLogin();  
  }

  var editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers : true,
    matchBrackets : true,
    tabMode: 'indent',
    theme: 'material',
    mode: 'xml',
    htmlMode: true
  });
  
  $.ajax({
      url: '/admin/settings',
      headers: {
        Authorization: 'Bearer ' + token
      }
  }).done(function (data, status) {
    editor.setValue(data.template.trim())
  }).error(function (e) {
    if (e.statusText === 'Unauthorized') {
      performLogin();
    }
  });

  

}());
