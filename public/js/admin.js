/* global CodeMirror */

(function () {
  var SESSION_STORAGE_TOKEN_KEY = 'com.auth0.account_linking.admin_ui.session_token';

  var editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers : true,
    matchBrackets : true,
    tabMode: 'indent',
    theme: 'material',
    mode: 'xml',
    htmlMode: true
  });
  
  $.ajax({
      url: '/admin/settings'
  }).done(function (data) {
    editor.setValue(data.template.trim())
  });


  if (!sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY)) {
    window.location.href = AccountLinkingExtension.authorizationUrl;
  }


}());
