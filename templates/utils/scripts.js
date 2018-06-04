const adminJS = require('../../public/admin');

module.exports = `
<script>
var JSONStringify = JSON.stringify;
var ObjectAssign = Object.assign;
  
function makeid() {
    var text = "";
    var possible = "abcdef0123456789";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
</script>
<script src="https://code.jquery.com/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/mode/xml/xml.js"></script>
<script>(${adminJS.toString()})()</script>`;
