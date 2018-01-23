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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" />
    ${stylesheetTag}
</head>
<body>

${header(baseURL)}

<main class="container app-container">
    <div class="row">
        <div class="col-sm-4">
            <div class=" list-group" id="locale-menu">
            </div>
            <div class="text-center">
                <div class="input-group">
                    <input id="add-new-locale-name" class="form-control" placeholder="Add new locale" />
                    <span class="input-group-btn">
                        <button id="add-new-locale" class="btn btn-primary" type="button">Add</button>
                    </span>
                </div>
            </div>
        </div>
        
        
        <div class="col-sm-8" id="locale-detail">
            <h2 id="locale-title"></h2>

            <table id="locale-management-table" class="table table-striped">
                    <th class="header" width="20%">Name</th>
                    <th class="header" width="80%">Message</th>
            </table>

            <button id="locale-management-submit" class="btn btn-primary">Save changes</button>
            
            <hr/>
            
            <div class="panel panel-danger">
                <div class="panel-heading">Remove locale</div>
                <div class="panel-body">
                    <p>Once removed, you cannot undo this change.</p>
                    <a class="btn btn-danger" id="remove-locale-btn">Remove locale</a>
                </div>
            </p>
        </div>
    </div>
</main>


${scripts}
</body>
</html>
`;
