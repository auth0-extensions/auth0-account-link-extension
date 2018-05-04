const scripts = require('../utils/scripts');
const header = require('../utils/header');

module.exports = ({ stylesheetTag, baseURL }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <base href="${baseURL}"/>
    <title>Auth0 Account Linking Extension Administrator</title>
    <link rel="stylesheet" href="https://cdn.auth0.com/styleguide/core/2.0.5/core.min.css" />
    <link rel="stylesheet" href="https://cdn.auth0.com/styleguide/components/2.0.0/components.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/theme/material.min.css">
    ${stylesheetTag}
</head>
<body>

${header(baseURL)}

<main class="container app-container">
    <form action="">
      <h2>Custom Hosted Page</h2>

      <textarea name="html-code" id="code-editor"></textarea>

      <h2>Widget Settings</h2>

      <div class="alert" id="save-result">
      </div>

      <div class="form-group">
        <label for="title">Title</label>
        <input name="title" class="form-control" id="title_input" />
      </div>

      <div class="form-group">
        <label for="logo_path">Logo Path</label>
        <input name="logo_path" class="form-control" id="logo_path_input"/>
      </div>

      <div class="form-group">
        <label for="color">Color</label>
        <input name="color" class="form-control" id="color_input"/>
      </div>

      <div class="form-group">
        <label for="locale">Language</label>
        <select name="locale" class="form-control" id="available-locales"></select>
      </div>

      <div class="form-group">
        <input type="checkbox" id="remove_overlay"/> Remove widget's overlay
      </div>

      <button class="btn btn-success" id="save-changes">Save changes</button>
    </form>
</main>


${scripts}
</body>
</html>
`;
