

/**
 * doGet, entrance of this App
*/
function doGet(e) {
  Logger.log(e.parameter);
  var storageService = getService();
  if (storageService.hasAccess()) {
    var html = HtmlService.createTemplateFromFile('index');
    return html.evaluate();
  } else {
    // Show the clickable authorization url
    var authorizationUrl = storageService.getAuthorizationUrl();
    var template = HtmlService.createTemplate(
      '<a>Click the link ---> </a>'+
      '<a href="<?= authorizationUrl ?>"target="_blank">Authorize</a>'+
      '<p> Refresh this page after you complete the authorization.</p>'
    );
    template.authorizationUrl = authorizationUrl;
    Logger.log('Open the following URL and re-run the script: %s', authorizationUrl);
    return template.evaluate();
  }
}

/**
 * Make a request to Google Storage API.
 */
function authFetch(url, objectSource) {
  if ( typeof objectSource == "undefined" ) {
    // normal GET
    return UrlFetchApp.fetch(url, {
      method: "GET",
      headers: {
        Authorization: 'Bearer '+ storageService.getAccessToken(),
      },
      'muteHttpExceptions': true,
      });
  } else {
    // copy objectSource to url
    return UrlFetchApp.fetch(url, {
      method: "PUT",
      headers: {
        Authorization: 'Bearer '+ storageService.getAccessToken(),
        "x-goog-copy-source": objectSource,
      },
      'muteHttpExceptions': true,
      });
  }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  getService().reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth2.createService('storage')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('https://www.googleapis.com/auth/devstorage.read_write')
    .setParam('access_type', 'offline')
    .setParam('approval_prompt', 'force')
    // .setParam('prompt', 'consent')
    .setParam('login_hint', Session.getActiveUser().getEmail());
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
 * Logs the redict URI to register in the Google Developers Console.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}
