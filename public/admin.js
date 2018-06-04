/* global CodeMirror, $ */
/* eslint-disable */
// Ignoring this file since it has to be written in ES5
// and eslint is configured to lint ES6.

module.exports = function() {
  var locales = {};
  var selectedLocale = '';

  var SUCCESS_MESSAGE = 'Success! Your changes has been successfully saved.';
  var ERROR_MESSAGE = 'Oops! An error has ocurred while trying to save your changes.';
  var TOKEN_KEY = 'com.auth0.account_linking.admin_ui.session_token';

  var baseURL = $('base').attr('href');
  var $appContainer = $('.app-container');
  var $loadingContainer = $('.loading-state-container');
  var $avatarImg = $('.avatar');
  var token = sessionStorage.getItem(TOKEN_KEY);

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

  function performLogin() {
    window.location.href = baseURL + '/login';
  }

  function mainAdminPanel() {
    var $titleInput = $('#title_input');
    var $logoPathInput = $('#logo_path_input');
    var $colorInput = $('#color_input');
    var $removeOverlayCheck = $('#remove_overlay');
    var $availableLocalesSelect = $('#available-locales');
    var $saveChangesBtn = $('#save-changes');
    var $saveResult = $('#save-result');
    var $logoutBtn = $('#logout-btn');

    var editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
      lineNumbers: true,
      matchBrackets: true,
      tabMode: 'indent',
      theme: 'material',
      mode: 'xml',
      htmlMode: true
    });

    function fillSelectItem(data) {
      data.availableLocales.forEach(function(locale) {
        var isSelected = data.locale === locale.code ? 'selected' : '';
        $availableLocalesSelect.append(
          `<option value="${locale.code}" ${isSelected}>${locale.name}</option>`
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
          setSaveResult('<h4>' + SUCCESS_MESSAGE + '</h4>');
          setSaveButtonDisabled(false);
        })
        .error(function(err) {
          if (typeof err.responseJSON.message !== 'undefined') {
            setSaveResult(
              '<h4>' + ERROR_MESSAGE + '</h4> <p>' + err.responseJSON.message + '</p>',
              {
                error: true
              }
            );
          } else {
            setSaveResult('<h4>' + ERROR_MESSAGE + '</h4>', { error: true });
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
    var $localeMenu = $('#locale-menu');
    var $localeDetail = $('#locale-detail');
    var $localeTitle = $('#locale-title');
    var $managementTable = $('#locale-management-table');
    var $managementSubmit = $('#locale-management-submit');
    var $addNewLocaleButton = $('#add-new-locale');
    var $newLocaleNameInput = $('#add-new-locale-name');
    var $newLocaleCodeInput = $('#add-new-locale-code');
    var $newLocaleHelpButton = $('#help-button');
    var $newLocaleHelpContent = $('#help-button-content');

    $newLocaleHelpButton.on('mouseover', () => {
      $newLocaleHelpContent.show();
      $newLocaleHelpContent.animate({opacity: 1,top: "-=20"}, 300);
    });

    $newLocaleHelpButton.on('mouseleave', () => {
      setTimeout(() => {
        $newLocaleHelpContent.animate({opacity: 0,top: "+=20"}, 300, () => $newLocaleHelpContent.hide());
      }, 300);
    })

    function saveChanges() {
      $.ajax({
        url: baseURL + '/admin/locales',
        method: 'PUT',
        contentType: 'application/json',
        data: JSONStringify(locales),
        processData: false,
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
        .done(function(data, status) {
          toastr.success('You have successfully saved your locales.', 'Success!');
        })
        .error(function(err) {
          if (typeof err.responseJSON.message !== 'undefined') {
            toastr.error(err.responseJSON.message, 'Error');
          } else {
            toastr.error('Please try again later.', 'Error');
          }
        });
    }

    function hydrateMenu() {
      $localeMenu.find('li').remove();

      for (var key in locales) {
        $localeMenu.append(
          `<li class="list-group-item" data-locale-name="${key}">${locales[key]._name}</li>`
        );
      }
      listenForMenuClicks();

      // Select first menu item by default
      $('#locale-menu li')[0].click();
    }

    function hydrateDetail() {
      var locale = locales[selectedLocale];
      $('tr:not(tr.header)').remove();

      $localeTitle.html(locale._name);

      for (var messageName in locale) {
        if (messageName !== '_name') {
          $managementTable.append(
            '<tr><td id="key">' +
              messageName +
              '</td><td><input class="form-control" value="' +
              locale[messageName] +
              '" /></td>'
          );
        }
      }
    }

    function listenForMenuClicks() {
      $('.list-group-item').on('click', function() {
        $(this).addClass('active');
        $(this)
          .siblings()
          .removeClass('active');
        selectedLocale = $(this).attr('data-locale-name');
        hydrateDetail();
      });
    }

    $.ajax({
      url: baseURL + '/admin/locales',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token
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

    $managementSubmit.on('click', function() {
      var editedLocale = { _name: locales[selectedLocale]._name };

      $managementTable.find('tr').each(function() {
        var key = $(this)
          .find('#key')
          .html();
        var message = $(this)
          .find('input')
          .val();
        editedLocale[key] = message;
      });

      locales[selectedLocale] = editedLocale;
      saveChanges();
    });

    $addNewLocaleButton.on('click', function(e) {
      e.preventDefault();

      var newLocaleId = $newLocaleCodeInput.val();
      var newLocaleName = $newLocaleNameInput.val();
      locales[newLocaleId] = ObjectAssign({}, locales.en, { _name: `${newLocaleName} (Custom)` });

      hydrateMenu();
      $newLocaleNameInput.val('');
      $newLocaleCodeInput.val('');
    });

    $('#remove-locale-btn').on('click', function(e) {
      e.preventDefault();

      if (confirm('Are you sure?')) {
        delete locales[selectedLocale];
        hydrateMenu();
        saveChanges();
      }
    });
  }

  var path = window.location.pathname;
  
  if (path.endsWith('/admin')) {
    return mainAdminPanel();
  } else if (path.endsWith('/admin/locale')) {
    return localeAdminPanel();
  } 
}
