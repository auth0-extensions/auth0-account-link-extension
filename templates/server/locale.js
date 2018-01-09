import scripts from '../utils/scripts';
import header from '../utils/header';

export default ({ stylesheetTag, baseURL }) => `
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

${header}

<main class="container app-container">
    <div class="row">
        <div class="col-sm-4 list-group" id="locale-menu">
        
        </div>
        <div class="col-sm-8" id="locale-detail">
            <h2 id="locale-title"></h2>

            <table id="locale-management-table" class="table table-striped">
                    <th class="header" width="20%">Name</th>
                    <th class="header" width="80%">Message</th>
            </table>

            <button id="locale-management-submit" class="btn btn-primary">Save changes</button>
        </div>
    </div>
</main>


${scripts}
</body>
</html>
`;
