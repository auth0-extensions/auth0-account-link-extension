import adminJS from '../../public/admin';

export default `
<script src="https://code.jquery.com/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/mode/xml/xml.js"></script>
<script>(${adminJS.toString()})()</script>`;
