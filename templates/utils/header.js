module.exports = baseURL => `
<header class="site-header">
 <nav class="navbar navbar-default" role="navigation">
    <div class="container">
      <div class="navbar-header">
        <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-collapse"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
        </button>
        <span>
            <h1 class="navbar-brand"><a href="${baseURL}/admin"><span>Auth0</span> <div class="product-name">Account Linking Extension</div></a></h1>
        </span>
      </div>
      <div class="collapse navbar-collapse" id="navbar-collapse">
        <ul class="nav navbar-nav navbar-left no-basic">
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <li class="dropdown"><span class="btn-dro" role="button" data-toggle="dropdown">
            <img src="" alt="" class="avatar">
            <i class="icon-budicon-460"></i></span>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
              <li><a href="${baseURL}/admin/locale" target="_blank">Manage locales</a></li>
              <li><a href="https://github.com/auth0-extensions/auth0-account-link-extension/issues/new" target="_blank">Report an issue</a></li>
              <li class="separator"></li>
              <li><a href="#" id="logout-btn">Logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</header>

<section class="loading-state-container">
  <div class="spinner spinner-lg is-auth0">
    <div class="circle"></div>
  </div>
</section>`;
