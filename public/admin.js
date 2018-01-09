/* global CodeMirror, $ */
/* eslint-disable */
// Ignoring this file since it has to be written in ES5
// and eslint is configured to lint ES6.

export default function() {
  var locales = {};
  var selectedLocale = "";

  var SUCCESS_MESSAGE = 'Success! Your changes has been successfully saved.';
  var ERROR_MESSAGE = 'Oops! An error has ocurred while trying to save your changes.';
  var TOKEN_KEY = 'com.auth0.account_linking.admin_ui.session_token';

  var baseURL = $('base').attr('href');
  var $appContainer = $('.app-container');
  var $loadingContainer = $('.loading-state-container');

  function mainAdminPanel() {
    var $titleInput = $('#title_input');
    var $logoPathInput = $('#logo_path_input');
    var $colorInput = $('#color_input');
    var $removeOverlayCheck = $('#remove_overlay');
    var $availableLocalesSelect = $('#available-locales');
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
      window.location.href = baseURL + '/login';
    }

    function fillSelectItem(data) {
      data.availableLocales.forEach(function(locale) {
        var isSelected = data.locale === locale.code ? 'selected' : '';
        $availableLocalesSelect.append(
          '<option value="' + locale.code + '"${isSelected}>' + locale.name + '</option>'
        );
      });
    }

    function fillCodeEditor(editor, data) {
      editor.setValue(data.template.trim());
    }

    function setSaveButtonDisabled(setDisabled) {
      var disabledClass = 'disabled';

      if (setDisabled) {
        $saveChangesBtn.addClass(disabledClass).html('Saving changes...');
      } else {
        $saveChangesBtn.removeClass(disabledClass).html('Save changes');
      }
    }

    function setSaveResult(text, options) {
      $saveResult.removeClass('alert-danger');
      $saveResult.removeClass('alert-success');

      $saveResult.html(text);
      $saveResult.show();

      if (options && options.error) {
        $saveResult.addClass('alert-danger');
      } else {
        $saveResult.addClass('alert-success');
      }

      setTimeout(function() {
        $saveResult.html('');
        $saveResult.hide();

        if (options.error) {
          $saveResult.removeClass('alert-danger');
        } else {
          $saveResult.removeClass('alert-success');
        }
      }, 10000);
    }

    if (!token) {
      performLogin();
    }

    editor.setSize(null, 500);

    $.ajax({
      url: baseURL + '/admin/settings',
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
      .done(function(data) {
        $loadingContainer.hide();
        $appContainer.show();

        fillCodeEditor(editor, data);
        fillSelectItem(data);
        $titleInput.val(data.title);
        $colorInput.val(data.color);
        $logoPathInput.val(data.logoPath);

        $removeOverlayCheck.prop('checked', data.removeOverlay || false);
      })
      .error(function(e) {
        if (e.statusText === 'Unauthorized') {
          performLogin();
        }
      });

    $.ajax({
      url: baseURL + '/admin/user',
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
      .done(function(data, status) {
        $avatarImg.attr('src', data.avatar);
      })
      .error(function(e) {
        if (e.statusText === 'Unauthorized') {
          performLogin();
        }
      });

    $saveChangesBtn.on('click', function(e) {
      e.preventDefault();

      setSaveButtonDisabled(true);

      $.ajax({
        url: baseURL + '/admin/settings',
        method: 'PUT',
        data: {
          template: editor.getValue(),
          locale: $availableLocalesSelect.val(),
          logoPath: $logoPathInput.val(),
          color: $colorInput.val(),
          title: $titleInput.val(),
          removeOverlay: $removeOverlayCheck.is(':checked')
        },
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
        .done(function(data, status) {
          setSaveResult("<h4>" + SUCCESS_MESSAGE + "</h4>");
          setSaveButtonDisabled(false);
        })
        .error(function(err) {
          if (typeof err.responseJSON.message !== 'undefined') {
            setSaveResult("<h4>" + ERROR_MESSAGE + "</h4> <p>" + err.responseJSON.message + "</p>", {
              error: true
            });
          } else {
            setSaveResult("<h4>" + ERROR_MESSAGE + "</h4>", { error: true });
          }
          setSaveButtonDisabled(false);
        });
    });

    $logoutBtn.on('click', function() {
      sessionStorage.removeItem(TOKEN_KEY);
      window.location.reload();
    });

    // Save with Cmd+S / Ctrl+S
    $(window).bind('keydown', function(event) {
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
            event.preventDefault();
            $saveChangesBtn.click();
            break;
          default:
            break;
        }
      }
    });
  }

  function localeAdminPanel() {
    var token = sessionStorage.getItem(TOKEN_KEY);
    var $localeMenu = $('#locale-menu');
    var $localeDetail = $('#locale-detail');
    var $localeTitle = $('#locale-title');
    var $managementTable = $('#locale-management-table');

    function hydrateMenu() {
      for (var key in locales) {
        $localeMenu.append('<li class="list-group-item" data-locale-name="' + key + '">' + locales[key]._name + '</li>')
      }
      listenForMenuClicks();
    }

    function hydrateDetail() {
      var locale = locales[selectedLocale];
      $('tr:not(th)').remove();
      
      $localeTitle.html(locale._name);

      for (var messageName in locale) {
        if (messageName !== '_name') {
          $managementTable.append('<tr><td>' + messageName + '</td><td><input class="form-control" value="' + locale[messageName] + '" /></td>')
        }
      }
    }

    function listenForMenuClicks() {
      $('.list-group-item').on('click', function () {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        selectedLocale = $(this).attr('data-locale-name');
        hydrateDetail();
      });
    }

    $.ajax({
      url: baseURL + '/admin/locales',
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .done(function(data, status) {
        $loadingContainer.hide();
        $appContainer.show();
        
        locales = data;
        hydrateMenu();
      })
      .error(function(err) {
        $loadingContainer.hide();
        alert(err);
      });
  }

  switch (window.location.pathname) {
    case '/admin':
      return mainAdminPanel();
      break;
    case '/admin/locale':
      return localeAdminPanel();
      break;
  }
}
