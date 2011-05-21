/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    Validates, verifies and saves given account information. Use this class if you want to add or update
 *           a new Piwik account.
 *
 * @todo maybe we should split latestVersion comparison from the account request. Maybe we should also do the
 *       latestVersion comparison more often, for example once per week/month
 * @todo we should not directly save the account here, just verifying. Storing has nothing to do with 'request'.
 */
Piwik.Network.AccountRequest = function () {
    
    /**
     * Fired if the given url is invalid
     *
     * @name    Piwik.Network.AccountRequest#event:onInvalidUrl
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type       The name of the event.
     * @param   {string}    event.url        The invalid url.
     */

    /**
     * Fired if the username is required but not given (if anonymous is disabled).
     *
     * @name    Piwik.Network.AccountRequest#event:onMissingUsername
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type       The name of the event.
     */

    /**
     * Fired if the password is required but not given (if anonymous is disabled).
     *
     * @name    Piwik.Network.AccountRequest#event:onMissingPassword
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type       The name of the event.
     */

    /**
     * Fired if the given account credentials are correct but the user has no view access to any site.
     *
     * @name    Piwik.Network.AccountRequest#event:onNoViewAccess
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type               The name of the event.
     * @param   {boolean}   event.errorMessageSent   true if the user was already informed about this error, false
     *                                               otherwise.
     */

    /**
     * Fired if there is any issue while fetching the tokenAuth or if the entered account credentials do not match.
     *
     * @name    Piwik.Network.AccountRequest#event:onReceiveAuthTokenError
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type               The name of the event.
     * @param   {boolean}   event.errorMessageSent   true if the user was already informed about this error, false
     *                                               otherwise.
     */

    /**
     * Fired if entered account credentials are correct and user has view access to at least one website.
     *
     * @name    Piwik.Network.AccountRequest#event:onload
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type         The name of the event.
     * @param   {string}    event.action       Either 'create' or 'update'. If value is 'create' we added a new
     *                                         account (on the mobile app, not on the server). If value is 'update'
     *                                         we updated an already existing account.
     * @param   {boolean}   event.success      true if update or create was successful, false otherwise.
     */

    /**
     * Holds the number of the latest available piwik version. For example '1.3.1'.
     *
     * @type string
     */
    this.latestVersion = null;

    /**
     * Add an event listener receive triggered events. The callback will be executed in the
     * Piwik.UI.Window context.
     *
     * @param   {string}     name       Name of the event you want to listen to.
     * @param   {Function}   callback   Callback function to invoke when the event is fired
     */
    this.addEventListener = function (name, callback) {
        Piwik.UI.currentWindow.addEventListener(name, callback);
    };

    /**
     * Fires an event to all listeners. The event will be fired in Piwik.UI.Window context.
     *
     * @param   {string}     name       Name of the event you want to fire.
     * @param   {Function}   event      An event object that will be passed to the callback function which was added
     *                                  via addEventListener.
     */
    this.fireEvent = function (name, event) {
        Piwik.UI.currentWindow.fireEvent(name, event);
    };

    /**
     * Validates the given account data. Fires an event if any account data is not valid, for example 'Missing
     * Username'. If the account data is valid, it fetches the tokenAuth which is needed to send Piwik API calls. It
     * uses the Piwik API method 'UsersManager.getTokenAuth' to verify the entered credentials. If we receive a valid
     * tokenAuth we do trigger the {Piwik.Network.AccountRequest#verifyAccess} method to verify whether the user has
     * at least view access.
     *
     * @param   {Object}     params
     * @param   {Object}     params.account                 The account that shall be saved/requested
     * @param   {string}     params.account.accessUrl       The url to the Piwik Server installation
     * @param   {boolean}    params.account.anonymous       True if anonymous mode is enabled, false otherwise
     * @param   {string}     params.account.username        The username, if anonymous is disabled
     * @param   {string}     params.account.password        The password, if anonymous is disabled
     * @param   {string}     params.account.name            A name that describes the account
     *
     * @fires   Piwik.Network.AccountRequest#event:onInvalidUrl
     * @fires   Piwik.Network.AccountRequest#event:onMissingUsername
     * @fires   Piwik.Network.AccountRequest#event:onMissingPassword
     * @fires   Piwik.Network.AccountRequest#event:onReceiveAuthTokenError
     * @fires   Piwik.Network.AccountRequest#event:onNoViewAccess
     * @fires   Piwik.Network.AccountRequest#event:onload
     */
    this.send = function (params) {

        var account = params.account;

        if (!account || !account.accessUrl || 'http' !== account.accessUrl.substr(0, 4).toLowerCase()) {

            this.fireEvent('onInvalidUrl', {type: 'onInvalidUrl', url: account.accessUrl});

            return;
        }

        if ((!account.username || '' == account.username) && !account.anonymous) {

            this.fireEvent('onMissingUsername', {type: 'onMissingUsername'});

            return;
        }

        if ((!account.password || '' == account.password) && !account.anonymous) {

            this.fireEvent('onMissingPassword', {type: 'onMissingPassword'});

            return;
        }

        if (account && account.anonymous) {

            account.tokenAuth = 'anonymous';
            
            return this.verifyAccess(account);
        }

        var lastUrlChar   = account.accessUrl.substr(account.accessUrl.length - 1, 1);
        var last4UrlChars = account.accessUrl.substr(account.accessUrl.length -4, 4).toLowerCase();

        if ('/' !== lastUrlChar && '.php' !== last4UrlChars) {
            // append a slash if user entered an url like 'http://demo.piwik.org' . Do not append if user entered an url
            // like 'http://demo.piwik.org/index.php'
            account.accessUrl = account.accessUrl + '/';
        }

        var credentials  = {userLogin:   account.username,
                            md5Password: Ti.Utils.md5HexDigest(account.password)};

        var piwikRequest = Piwik.require('Network/PiwikApiRequest');
        piwikRequest.setMethod('UsersManager.getTokenAuth');
        piwikRequest.setParameter(credentials);
        piwikRequest.setAccount(account);
        piwikRequest.setCallback(this, function (response) {

            if (!response || !(response instanceof Object) || !response.value) {

                var eventResult = {type: 'onReceiveAuthTokenError',
                                   errorMessageSent: piwikRequest.errorMessageSent};

                this.fireEvent('onReceiveAuthTokenError', eventResult);

                return;
            }

            account.tokenAuth = response.value;

            return this.verifyAccess(account);
        });

        piwikRequest.send();
    };

    /**
     * Verify whether the account has at least view access using the method 'SitesManager.getSitesIdWithAtLeastViewAccess', see <a href="http://piwik.org/docs/analytics-api/reference/#SitesManager">SitesManager</a>.
     * Fires an event if the user if the user has not at least view access. Triggers also a version comparison
     * whether the Piwik Server version is outdated or not. If the user has at least view access, it updates or creates
     * the account.
     *
     * @param   {Object}   account
     *
     * @fires   Piwik.Network.AccountRequest#event:onNoViewAccess
     * @fires   Piwik.Network.AccountRequest#event:onload
     */
    this.verifyAccess = function (account) {

        if (!account.accountId) {
            // account doesn't already exist. we have to create the account and activate the account by default
            account.active = 1;
        }

        this.requestVersion();

        var piwikRequest = Piwik.require('Network/PiwikApiRequest');
        piwikRequest.setMethod('SitesManager.getSitesIdWithAtLeastViewAccess');
        piwikRequest.setAccount(account);
        piwikRequest.setCallback(this, function (response) {
            var eventResult = null;

            if (!response || !(response instanceof Array) || 0 == response.length) {

                eventResult = {errorMessageSent: piwikRequest.errorMessageSent,
                               type: 'onNoViewAccess'};

                this.fireEvent('onNoViewAccess', eventResult);

                return;
            }

            var success = false;
            var action  = 'create';

            var accountManager = Piwik.require('App/Accounts');

            if (this.accountId) {
                action         = 'update';
                success        = accountManager.updateAccount(this.accountId, account);
            } else {
                this.accountId = accountManager.createAccount(account);
                success        = Boolean(this.accountId);
            }

            eventResult = {type: 'onload',
                           success: success,
                           action: action};

            this.fireEvent('onload', eventResult);
        });

        piwikRequest.send();
    };

    /**
     * Requests the version number of the user's piwik installation and compares it with the latest version
     * number. Informs the user if there is a newer version available. It does not always work. It is possible
     * that eg. the user has deactivated ExampleApi. Another possible reason is that the request to fetch the
     * latest version number (@link Piwik.Network.AccountRequest#requestLatestVersion) is still running
     * while this request is already finished. We could wait in such a case but we prefer a simpler version at the
     * moment.
     *
     * To compare both version numbers we create an integer for each version. For example Version '1.4.0' is 140.
     * Version '0.7.0' would be interpreted as 70.
     *
     * @todo we should fire an event about version mismatch... instead of directly displaying a message
     */
    this.requestVersion = function () {

        var accountManager = Piwik.require('App/Accounts');
        var that           = this;
        var account        = accountManager.getAccountById(this.accountId);

        var piwikRequest   = Piwik.require('Network/PiwikApiRequest');
        piwikRequest.setMethod('ExampleAPI.getPiwikVersion');
        piwikRequest.setAccount(account);
        piwikRequest.setCallback(this, function (response) {

            if (!response) {

                return;
            }

            if (response && response.result && 'error' == response.result) {
                // in most cases the ExampleApi is deactivated or token_auth is not valid

                Piwik.Log.debug('Compare Version error, message: ' + response.message,
                                'Piwik.Network.AccountRequest::requestVersion');

                return;
            }

            if (!that.latestVersion) {
                // we define a default value if we are not able to fetch the latest available version.
                that.latestVersion = config.piwik.latestServerVersion;
            }

            if (!response || !response.value) {
                
                return;
            }

            // response.value is for example "0.6.4-rc1" or "0.6.3"
            var version       = response.value + '';
            var latestVersion = that.latestVersion + '';

            // compare only first six chars and ignore all dots -> from 0.6.4-rc1 to 064
            // if version was '1.4-rc1', it is '14-rc' now
            version           = version.substr(0, 5).replace(/\./g, '');
            latestVersion     = latestVersion.substr(0, 5).replace(/\./g, '');

            // make sure they contain only numbers.
            version           = version.replace(/[^\d]/g, '');
            latestVersion     = latestVersion.replace(/[^\d]/g, '');

            // version and latestVersion now contains only numbers. We are now going to make sure that each version
            // number contains 3 numbers

            if ((version + '').length == 2) {
                // if version is e.g. '0.7' it would be interpreted as 07 (7), but it should be 0.7.0 = 70.
                // Otherwise we run into a bug where 0.6.4 (64) is greater than 0.7 (7).
                version       = version * 10;
            }
            if ((version + '').length == 1) {
                // if version is e.g. '2' it would be interpreted as 2, but it should be 2.0.0 = 200.
                // Otherwise we run into a bug where 0.6.4 (64) is greater than 2 (2).
                version       = version * 100;
            }

            if ((latestVersion + '').length == 2) {
                // if version is e.g. '0.7' it would be interpreted as 07 (7), but it should be 0.7.0 = 70.
                // Otherwise we run into a bug where 0.6.4 (64) is greater than 0.7 (7).
                latestVersion = latestVersion * 10;
            }
            if ((latestVersion + '').length == 1) {
                // if version is e.g. '2' it would be interpreted as 2, but it should be 2.0.0 = 200.
                // Otherwise we run into a bug where 0.6.4 (64) is greater than 2 (2).
                latestVersion = latestVersion * 100;
            }

            // radix is very important in this case, otherwise eg. 064 octal is 52 decimal
            version           = parseInt(version, 10);
            latestVersion     = parseInt(latestVersion, 10);

            if (version && latestVersion && latestVersion > version) {
                Piwik.Log.debug('Version is out of date: ' + version,
                                'Piwik.Network.AccountRequest::requestVersion#version');

                // @todo create translation key
                var alertDialog = Ti.UI.createAlertDialog({
                    title: _('General_PleaseUpdatePiwik'),
                    message: String.format(_('General_PiwikXIsAvailablePleaseNotifyPiwikAdmin'), '' + that.latestVersion),
                    buttonNames: [_('General_Ok')]
                });

                alertDialog.show();
            }

        });

        /**
         * disable the display of error messages in this case. The worst case will be the user does not get informed
         * if the latest version isn't installed.
         */
        piwikRequest.sendErrors = false;

        piwikRequest.send();
    };

    /**
     * Requests the latest version number of piwik. This value is needed to be able to compare it with the version
     * number of the user's piwik installation.
     */
    this.requestLatestVersion = function () {

        var that    = this;

        var request = Piwik.require('Network/HttpRequest');

        /**
         * disable the display of error messages in this case. the worst case will be the user does not get informed
         * if the latest version isn't installed
         */
        request.sendErrors = false;

        request.setBaseUrl('http://api.piwik.org/1.0/getLatestVersion/');
        request.setParameter({trigger: 'MobileClient-' + Ti.Platform.osname,
                              mobile_version: Ti.Platform.version});

        request.setCallback(this, function (response) {

            if (!response) {
                return;
            }

            that.latestVersion = response;
        });
        
        request.handle();
    };

    /**
     * Prefetching latest version number. Execute request in background and do not wait. We need this value later
     * as soon as the user presses the save button. we are fetching this already here to have a better performance
     * while requesting the users piwik version.
     */
    this.requestLatestVersion();
};