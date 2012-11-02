/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'settings/editaccount.js' .
 */

/** @private */
var Piwik = require('library/Piwik');
/** @private */
var _     = require('library/underscore');

/**
 * @class     Provides the ability to add a new account or edit an already existing Piwik account. The user has to enter
 *            the website url of the Piwik server installation as well as the credentials in order to add or edit an
 *            account.
 *
 * @exports   window as WindowSettingsEditaccount
 * @this      Piwik.UI.Window
 * @augments  Piwik.UI.Window
 */
function window (params) {

    /**
     * @see  Piwik.UI.Window#titleOptions
     */
    this.titleOptions = {title: _('UsersManager_ManageAccess')};

    /**
     * @see  Piwik.UI.Window#menuOptions
     */
    this.menuOptions  = {commands: [this.createCommand('OpenFaqCommand')]};
    
    var that          = this;

    // we'll display an activity indicator while verifying the entered account url+credentials.
    var activityIndicator = this.create('ActivityIndicator');
    var request           = Piwik.require('Network/AccountRequest');
    
    var piwikUrl  = Ti.UI.createTextField({
        className: 'editAccountTextField',
        value: '',
        hintText: _('General_ForExampleShort') + ' http(s)://demo.piwik.org/',
        keyboardType: Ti.UI.KEYBOARD_URL,
        returnKeyType: Ti.UI.RETURNKEY_NEXT,
        autocorrect: false,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_NONE,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE
    });

    var piwikAnonymous = Ti.UI.createSwitch({value: false, className: 'editAccountSwitch'});

    var piwikUser = Ti.UI.createTextField({
        className: 'editAccountTextField',
        value: '',
        autocorrect: false,
        hintText: _('Login_Login'),
        keyboardType: Piwik.getPlatform().isAndroid ? Ti.UI.KEYBOARD_URL : Ti.UI.KEYBOARD_DEFAULT,
        returnKeyType: Ti.UI.RETURNKEY_NEXT,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_NONE,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE
    });
    // use keyboard url above on android, otherwise it is not possible to deactivate autocorrect,
    // that's a bug in Titanium

    var piwikPassword = Ti.UI.createTextField({
        className: 'editAccountTextField',
        value: '',
        passwordMask: true,
        autocorrect: false,
        hintText: _('Login_Password'),
        keyboardType: Ti.UI.KEYBOARD_DEFAULT,
        returnKeyType: Ti.UI.RETURNKEY_DONE,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_NONE,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE
    });
    
    var save          = Ti.UI.createButton({title:  _('General_Save'), className: 'editAccountSaveButton'});
    var addDemoLabel  = Ti.UI.createLabel({text: _('Mobile_NoPiwikAccount'), className: 'editAccountNoPiwikAccountLabel'});
    var addDemoButton = Ti.UI.createButton({title:  _('Mobile_AddPiwikDemo'), className: 'editAccountSaveButton'});

    var tableView  = null;
    var scrollView = null;
    var tableData  = null;
    var row        = null;
    var piwikUserRow     = null;
    var piwikPasswordRow = null;
    
    if (Piwik.getPlatform().isIos) {

        tableView = this.create('TableView', {id: 'editAccountTableView'});
        tableData = [];
        tableData.push(this.create('TableViewSection', {title: _('Mobile_AccessUrlLabel'), style: 'native'}));

        row = Ti.UI.createTableViewRow({className: 'editAccountControlRow1', id: 'editAccountControlRow'});
        row.add(piwikUrl);
        tableData.push(row);
        row = null;
        
        tableData.push(this.create('TableViewSection', {title: _('Mobile_AnonymousAccess'), style: 'native'}));
    
        row = Ti.UI.createTableViewRow({className: 'editAccountControlRow2', id: 'editAccountControlRow'});
        row.add(piwikAnonymous);
        tableData.push(row);
        row = null;
        
        tableData.push(this.create('TableViewSection', {title: _('Mobile_LoginCredentials'), style: 'native'}));
    
        piwikUserRow = Ti.UI.createTableViewRow({className: 'editAccountControlRow3', id: 'editAccountControlRow'});
        piwikUserRow.add(piwikUser);
        tableData.push(piwikUserRow);
        
        piwikPasswordRow = Ti.UI.createTableViewRow({className: 'editAccountControlRow4', id: 'editAccountControlRow'});
        piwikPasswordRow.add(piwikPassword);
        tableData.push(piwikPasswordRow);
        
        var footerView = Ti.UI.createView({className: 'editAccountTableFooterView', layout: 'vertical'});
        footerView.add(save);
        footerView.add(addDemoLabel);
        footerView.add(addDemoButton); 
        tableView.setFooterView(footerView);
        footerView = null;
        
    } else {
        // we cannot use a TableView on Android because of weird textfield focus issues, see 
        // http://dev.piwik.org/trac/ticket/3501 and http://jira.appcelerator.org/browse/TIMOB-8332
        
        scrollView = Ti.UI.createScrollView({id: 'editAccountScrollView'});
        
        var headerView = Ti.UI.createView({className: 'tableViewSection'});
        headerView.add(Ti.UI.createLabel({text: _('Mobile_AccessUrlLabel'), id: 'tableViewSectionHeaderLabel'}));
        scrollView.add(headerView);
        headerView  = null;
        
        scrollView.add(piwikUrl);
        
        headerView = Ti.UI.createView({className: 'tableViewSection'});
        headerView.add(Ti.UI.createLabel({text: _('Mobile_AnonymousAccess'), id: 'tableViewSectionHeaderLabel'}));
        scrollView.add(headerView);
        headerView = null;
        
        scrollView.add(piwikAnonymous);
        
        headerView = Ti.UI.createView({className: 'tableViewSection'});
        headerView.add(Ti.UI.createLabel({text: _('Mobile_LoginCredentials'), id: 'tableViewSectionHeaderLabel'}));
        scrollView.add(headerView);
        headerView = null;
        
        scrollView.add(piwikUser);
        scrollView.add(piwikPassword);
       
        scrollView.add(save);
        scrollView.add(addDemoLabel);
        scrollView.add(addDemoButton); 
    }
    
    addDemoButton.addEventListener('click', function () {
        
        piwikUrl.value       = 'http://demo.piwik.org/';
        piwikUser.value      = '';
        piwikPassword.value  = '';
        piwikAnonymous.value = true

        saveAccount();
    }); 
    
    addDemoButton = null;  
    addDemoLabel  = null;
    
    piwikAnonymous.addEventListener('change', function (event) {

        if (!event) {
            Piwik.getLog().warn('Missing piwikAnonymous change event', 'settings/editaccount::change');

            return;
        }

        // forces hide keyboard
        piwikUser.blur();
        piwikUrl.blur();
        piwikPassword.blur();

        if (event.value) {
            // anonymous was activated and is deactivated now
            piwikUser.value     = '';
            piwikPassword.value = '';
        }
        
        // we need to visualize that textfields are enbabled/disabled on iOS. On Android this happens automatically.
        if (event.value && Piwik.getPlatform().isIos) {
            piwikUserRow.backgroundColor     = '#dddddd';
            piwikPasswordRow.backgroundColor = '#dddddd';
        } else if (Piwik.getPlatform().isIos) {
           piwikUserRow.backgroundColor      = '#ffffff';
           piwikPasswordRow.backgroundColor  = '#ffffff';
        }

        // turn textfields on/off
        piwikUser.enabled      = !event.value;
        piwikUser.editable     = !event.value;
        piwikPassword.enabled  = !event.value;
        piwikPassword.editable = !event.value;
    });
    
    if (Piwik.getPlatform().isIos) {
        // on Android the user removes/hides the keyboard by pressing the hardware return button.
        // on iOS we have to handle that ourselves when the user presses outside of the current keyboard
        this.addEventListener('click', function () {
            piwikUrl.blur();
            piwikUser.blur();
            piwikPassword.blur();
        });
    }

    /**
     * Tries to save the account using the previous entered values. Triggers the activityIndicator show method.
     * We have to make sure the activityIndicator hide method will be triggered later.
     */
    var saveAccount = function () {
        if (activityIndicator) {
            activityIndicator.show(_('Mobile_VerifyAccount'));
        }

        var account = {accessUrl: piwikUrl.value,
                       username:  piwikUser.value,
                       anonymous: piwikAnonymous.value,
                       password:  piwikPassword.value,
                       name:      piwikAnonymous.value ? _('Mobile_AnonymousAccess') : piwikUser.value};

        if (params && params.accountId) {
            account.id = params.accountId;
        }

        // send the request to verify the entered account values.
        request.send({account: account});
    };

    save.addEventListener('click', function ()
    {
        // forces hide keyboard
        piwikUser.blur();
        piwikUrl.blur();
        piwikPassword.blur();
        
        var accessUrl = '';
        if (piwikUrl.value) {
            accessUrl = ('' + piwikUrl.value).toLowerCase();
        }

        if (accessUrl && -1 === accessUrl.indexOf('http')) {
            // user has not specified any http protocol. automatically prepend 'http'.
            piwikUrl.value = 'http://' + piwikUrl.value;
            accessUrl      = piwikUrl.value;
        }

        if (!accessUrl || 0 !== accessUrl.indexOf('http://')) {
            // save directly without confirmation if user has entered any other protocol than http, eg https.
            saveAccount();
            
            return;
        }
        
        // accessUrl starts with http://
        var alertDialog = Ti.UI.createAlertDialog({
            message: _('Mobile_HttpIsNotSecureWarning'),
            buttonNames: [_('General_Yes'), _('Mobile_LoginUseHttps')]
        });

        alertDialog.show();

        alertDialog.addEventListener('click', function (event) {
            if (!event || (event.cancel === event.index) || (true === event.cancel)) {
                // user pressed hardware back button or cancel button
                return;
            }

            if (1 === event.index) {
                // user pressed 'use secure https' button. replace http:// by https://
                piwikUrl.value = 'https://' + piwikUrl.value.substr(7);
                saveAccount();
            } else if (0 === event.index) {
                saveAccount();
            }
            
        });

        return;
    });

    piwikUrl.addEventListener('return', function(event) {
        if (piwikAnonymous.value) {

            // forces hide keyboard. Anonymous is enabled, user does not have to enter credentials. we can save the
            // account now
            piwikUrl.blur();

            // simulate save button click
            var myEvent = {};
            save.fireEvent('click', myEvent);

            return;
        }

        // automatically focus next text field
        piwikUser.focus();
    });

    piwikUser.addEventListener('return', function(event) {
        // automatically focus next text field
        piwikPassword.focus();
    });

    piwikPassword.addEventListener('return', function(event) {
        // forces hide keyboard
        piwikPassword.blur();

        // simulate a click on the save button.
        var myEvent = {};
        save.fireEvent('click', myEvent);
    });

    request.addEventListener('onInvalidUrl', function (event) {
        if (activityIndicator) {
            activityIndicator.hide();
        }

        Piwik.getTracker().trackEvent({title: 'Account Invalid Url', url: '/account/edit/invalid-url'});

        var url = '';
        if (event && event.url) {
            url = '' + event.url;
        }

        var alertDialog = Ti.UI.createAlertDialog({
            title: _('General_Error'),
            message: String.format(_('SitesManager_ExceptionInvalidUrl'), '' + url),
            buttonNames: [_('General_Ok')]
        });

        alertDialog.show();
    });

    request.addEventListener('onMissingUsername', function () {
        activityIndicator.hide();

        Piwik.getTracker().trackEvent({title: 'Account Missing Username', url: '/account/edit/missing-username'});

        var alertDialog = Ti.UI.createAlertDialog({
            title: _('General_Error'),
            message: String.format(_('General_Required'), _('Login_Login')),
            buttonNames: [_('General_Ok')]
        });

        alertDialog.show();
    });

    request.addEventListener('onMissingPassword', function () {
        if (activityIndicator) {
            activityIndicator.hide();
        }

        Piwik.getTracker().trackEvent({title: 'Account Missing Password', url: '/account/edit/missing-password'});

        var alertDialog = Ti.UI.createAlertDialog({
            title: _('General_Error'),
            message: String.format(_('General_Required'), _('Login_Password')),
            buttonNames: [_('General_Ok')]
        });

        alertDialog.show();
    });

    request.addEventListener('onReceiveAuthTokenError', function (event) {
        if (activityIndicator) {
            activityIndicator.hide();
        }

        Piwik.getTracker().trackEvent({title: 'Account Receive Token Error', url: '/account/edit/receive-token-error'});

        if (event && !event.errorMessageSent) {

            var alertDialog = Ti.UI.createAlertDialog({
                title: _('General_Error'),
                message: _('Mobile_SaveSuccessError'),
                buttonNames: [_('General_Ok')]
            });

            alertDialog.show();
        }
    });

    request.addEventListener('onNoViewAccess', function (event) {
        if (activityIndicator) {
            activityIndicator.hide();
        }

        Piwik.getTracker().trackEvent({title: 'Account No View Access', url: '/account/edit/no-view-access'});

        if (event && !event.errorMessageSent) {
            var loginErrorMessage = String.format(_('General_ExceptionPrivilegeAtLeastOneWebsite'), _('UsersManager_PrivView'));
            loginErrorMessage    += ' ' + _('Mobile_VerifyLoginData');
            
            var alertDialog = Ti.UI.createAlertDialog({
                title: _('General_Error'),
                message: loginErrorMessage,
                buttonNames: [_('General_Ok')]
            });

            alertDialog.show();
        }
    });

    request.addEventListener('onload', function (event) {

        if (activityIndicator) {
            activityIndicator.hide();
        }

        if (event) {
            var trackingUrl = '/account/' + event.action + '/' + (event.success ? 'success' : 'error');
            Piwik.getTracker().trackEvent({title: 'Account ' + event.action, url: trackingUrl});
        }
        
        Piwik.getTracker().prepareVisitCustomVariables();

        // save and verify account was successful
        var alertDialog = Ti.UI.createAlertDialog({
            title: _('General_Done'),
            message: _('General_YourChangesHaveBeenSaved'),
            buttonNames: [_('General_Ok')]
        });

        // @todo display a notification instead of an alert dialog on Android (if supported by titanium)

        alertDialog.addEventListener('click', function () {

            if (that && Piwik.getPlatform().isIpad) {
                
                // update list of available websites and close currentwindow
                that.create('Window', {url: 'index/index', closeWindow: that});
                
            } else if (that && 1 === Piwik.getUI().layout.windows.length) {
                // this screen is the first Piwik window (in most cases the user started the app the first time),
                // open websites overview instead of closing this window.
                that.create('Window', {url: 'index/index', closeWindow: that});
                
            } else if (that) {

                // close this window, so user has the possibility to add another account or
                // something else. settings/manageaccounts will be visible afterwards.
                that.close();
            }
        });

        alertDialog.show();
    });

    if (Piwik.getPlatform().isIos) {
        
        this.add(tableView.get());
        tableView.setData(tableData);
        
    } else {
        this.add(scrollView);
    }

    /**
     * Pre fill previous created text fields with values if accountId is given and if this account exists.
     *
     * @param  {Object}  params
     * @param  {string}  [params.accountId]  Optional accountId in case of edit an account.
     */
    this.open = function (params) {
        if (!params || !params.accountId) {

            return;
        }

        var accountId      = params.accountId;
        
        var accountManager = Piwik.require('App/Accounts');
        var account        = accountManager.getAccountById(accountId);
        accountManager     = null;

        if (!account) {
            // @todo error alert message: the selected account is currently not editable or already deleted

            return;
        }

        // restore values
        if (account.tokenAuth && 'anonymous' == account.tokenAuth) {
            piwikAnonymous.fireEvent('change', {value: true});
            piwikAnonymous.value = true;
        }

        if (account.accessUrl) {
            piwikUrl.value  = account.accessUrl;
        }

        if (account.username) {
            piwikUser.value = account.username;
        }
    };
    
    this.cleanup = function () {

        if (tableView && tableView.get()) {
            // iOS
            this.remove(tableView.get());
        } 
        
        if (scrollView) {
            // not iOS
            this.remove(scrollView);
        }

        scrollView  = null;
        tableData   = null;
        tableView   = null;
        that        = null;
        request     = null;
        saveAccount = null;
        piwikUrl    = null;
        piwikUser   = null;
        save        = null;
        
        piwikPassword     = null;
        piwikAnonymous    = null;
        piwikPasswordRow  = null;
        piwikUserRow      = null;
        activityIndicator = null;
        
        this.menuOptions  = null;
        this.titleOptions = null;
    };
}

module.exports = window;