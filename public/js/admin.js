/* eslint-disable no-var, func-names, prefer-arrow-callback */
/* global CodeMirror, $ */

(function () {
  var SUCCESS_MESSAGE = 'Success! Your changes has been succesfully saved.';
  var ERROR_MESSAGE = 'Oops! An error has ocurred while trying to save your changes.';
  var TOKEN_KEY = 'com.auth0.account_linking.admin_ui.session_token';
  
  var $availableLocalesSelect = $('#available-locales');
  var $appContainer = $('.app-container');
  var $loadingContainer = $('.loading-state-container');
  var $saveChangesBtn = $('#save-changes');
  var $saveResult = $('#save-result');
  var $logoutBtn = $('#logout-btn');
  var $avatarImg = $('.avatar');
  
  var token = sessionStorage.getItem(TOKEN_KEY);

  var editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers: true,
    matchBrackets: true,
    tabMode: 'indent',
    theme: 'material',
    mode: 'xml',
    htmlMode: true
  });
  
  function performLogin() {
    window.location.href = '/login';
  }
  
  function fillSelectItem(data) {
    data.availableLocales.forEach(function (locale) {
      var isSelected = data.locale === locale.code ? 'selected' : '';
      $availableLocalesSelect.append('<option value="' + locale.code  + '"' + isSelected + '>' + locale.name + '</option>')
    });
  }
  
  function fillCodeEditor(editor, data) {
    editor.setValue(data.template.trim());
  }

  function setSaveButtonDisabled(setDisabled) {
    var disabledClass = 'disabled';

    if (setDisabled) {
      $saveChangesBtn
        .addClass(disabledClass)
        .html('Saving changes...');
    } else {
      $saveChangesBtn
        .removeClass(disabledClass)
        .html('Save changes');
    }
  }

  function setSaveResult(text) {
    $saveResult.html(text);
    
    setTimeout(function () {
      $saveResult.html('');
    }, 5000);
  }
  
  
  if (!token) {
    performLogin();  
  }
  
  editor.setSize(null, 500);
  
  $.ajax({
    url: '/admin/settings',
    headers: {
      Authorization: 'Bearer ' + token
    }
  }).done(function (data, status) {
    $loadingContainer.hide();
    $appContainer.show();
    
    fillCodeEditor(editor, data);
    fillSelectItem(data);
  }).error(function (e) {
    if (e.statusText === 'Unauthorized') {
      performLogin();
    }
  });

  $.ajax({
    url: '/admin/user',
    headers: {
      Authorization: 'Bearer ' + token
    }
  }).done(function (data, status) {
    $avatarImg.attr('src', data.avatar);
  }).error(function (e) {
    if (e.statusText === 'Unauthorized') {
      performLogin();
    }
  });
  
  $saveChangesBtn.on('click', function(e) {
    e.preventDefault();

    setSaveButtonDisabled(true);
    
    $.ajax({
      url: '/admin/settings',
      method: 'PUT',
      data: {
        template: editor.getValue(),
        locale: $availableLocalesSelect.val()
      },
      headers: {
        Authorization: 'Bearer ' + token
      }
    }).done(function (data, status) {
      setSaveResult(SUCCESS_MESSAGE);
      setSaveButtonDisabled(false);
    }).error(function (err) {
      setSaveResult(ERROR_MESSAGE + err);
      setSaveButtonDisabled(false);
    });
  });

  $logoutBtn.on('click', function () {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  })
}());
