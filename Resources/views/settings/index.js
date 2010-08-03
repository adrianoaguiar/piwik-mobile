/*
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview View template settings/index.
 */

/**
 * View template. 
 *
 * @this {View}
 */
function template () {
    
    var left            = 20;
    var windowWidthHalf = Math.round(parseInt(this.size.width, 10) / 2);
    var labelWidth      = 'auto';
    
    if ('android' === Titanium.Platform.osname) {
        // there is a bug since Titanium Mobile SDK 1.4 which forces labels to wrap even if there is enough space left.
        // setting a width is a workaround to fix this bug.
        // @see http://appcelerator.lighthouseapp.com/projects/32238/tickets/1304-android-strange-wrapping-in-tableview-on-higher-res-screens
        // @todo set this to auto as soon as this bug is completely fixed #wrapbug
        labelWidth      = parseInt(this.size.width, 10) - left - left - 30;
    }
    
    var box             = this.helper('borderedContainer', {});
    
    var headline        = this.helper('headline', {headline: _('General_Settings'),
                                                  settingsButtonHidden: true});
    
    box.subView.add(headline.subView);
    
    var top         = headline.subView.height;;
    
    top = top + 10;
    var labelUrl    = Titanium.UI.createLabel({
        text: _('Mobile_AccessUrlLabel'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    top = top + 25;
    var piwikUrl    = Titanium.UI.createTextField({
        color: config.theme.textColor,
        height: 35,
        top: top,
        left: left,
        right: left,
        value: '',
        hintText: _('General_ForExampleShort') + ' http(s)://demo.piwik.org/',
        keyboardType: Titanium.UI.KEYBOARD_URL,
        returnKeyType: Titanium.UI.RETURNKEY_NEXT,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    // @todo set autocapitalization to Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE will work in post 1.4
    // There's a bug in Titanium 1.4 and previous versions when using autocapitalizations UrlKeyboard will not work
    
    top = top + 40;
    var labelAnonymous  = Titanium.UI.createLabel({
        text: _('Mobile_AnonymousAccess'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize:config.theme.fontSizeNormal}
    });
    
    var piwikAnonymous = Titanium.UI.createSwitch({
        top:  top,
        height: 25,
        right: left,
        value: false
    });
    
    piwikAnonymous.addEventListener('change', function (event) {
    
        if (event.value) {
            // anonymous is activated
        
            piwikUser.value       = '';
            piwikUser.enabled     = false;
            piwikPassword.value   = '';
            piwikPassword.enabled = false;
        
        } else {
            // anonymous is deactivated
            
            piwikUser.enabled     = true;
            piwikPassword.enabled = true;
        
        }
    });
    
    top = top + 25;
    var labelUser  = Titanium.UI.createLabel({
        text: _('Login_Login'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    top = top + 25;
    var piwikUser = Titanium.UI.createTextField({
        color: config.theme.textColor,
        height: 35,
        value: '',
        top: top,
        left: left,
        right: left,
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_NEXT,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    top = top + 40;
    var labelPassword  = Titanium.UI.createLabel({
        text: _('Login_Password'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    top = top + 25;
    var piwikPassword = Titanium.UI.createTextField({
        value: '',
        color: config.theme.textColor,
        height: 35,
        top: top,
        left: left,
        right: left,
        passwordMask: true,
        clearOnEdit: true,
        returnKeyType: Titanium.UI.RETURNKEY_NEXT,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    // @todo set keyboard: Titanium.UI.KEYBOARD_PASSWORD should be supported in Titanium Mobile 1.4.0
    
    top = top + 40;
    var labelLanguage  = Titanium.UI.createLabel({
        text: _('General_Language'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    top = top + 25;
    var language = Titanium.UI.createButton({
        color: config.theme.textColor,
        height: 35,
        top: top,
        left: left,
        right: left,
        font: {fontSize: config.theme.fontSizeNormal}
    });
    
    var options = [];
    var name;
    for(var langCode in this.availableLanguages) {
        
        name = this.availableLanguages[langCode];
        
        options.push(name);
        
        if((this.piwikLanguage && this.piwikLanguage == langCode) || 
          (!this.piwikLanguage && Translation.getPlatformLocale() == langCode)) {
            language.title = name;
        }
        
    }
    
    options.sort();
    
    var langDialog = Titanium.UI.createOptionDialog({
        title: _('General_ChooseLanguage'),
        options: options
    });
    
    language.addEventListener('click', function () {
    
        langDialog.show();
    });
    
    var win = this.view;
    
    langDialog.addEventListener('click', function (event) {
        
        if (event.cancel && -1 !== event.cancel) {
            return;
        }
        
        language.title = options[event.index];
    });
    
    top = top + 40;
    var labelMultiCharts  = Titanium.UI.createLabel({
        text: _('Mobile_MultiChartLabel'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize:config.theme.fontSizeNormal}
    });
    
    var piwikMultiCharts = Titanium.UI.createSwitch({
        top:  top,
        right: left,
        height: 25,
        value: false
    });
    
    top = top + 15;
    var labelMultiChartsInfo  = Titanium.UI.createLabel({
        text: _('Mobile_MultiChartInfo'),
        height: 'auto',
        left: left,
        top: top,
        width: windowWidthHalf,
        color: config.theme.textColor,
        font: {fontSize: config.theme.fontSizeSmall}
    });
    
    top = top + 25;
    var labelGraphs  = Titanium.UI.createLabel({
        text: _('Mobile_EnableGraphsLabel'),
        height: 20,
        left: left,
        top: top,
        width: labelWidth,
        color: config.theme.titleColor,
        font: {fontSize:config.theme.fontSizeNormal}
    });
    
    var piwikGraphs = Titanium.UI.createSwitch({
        top:  top,
        height: 25,
        right: left,
        value: false
    });
            
    top = top + 45;
    var separator = Titanium.UI.createView({
        height: 1,
        left: 1,
        right: 1,
        top: top,
        borderWidth: 0,
        backgroundColor: '#908A7C',
        zIndex: 3
    });
    
    top = top + 10;
    var save  = Titanium.UI.createButton({
        title:  _('General_Save'),
        height: 35,
        width:  205,
        left:   left,
        top:    top,
        color: '#D17D2A',
        backgroundColor: '#F6F6F6',
        borderRadius: config.theme.borderRadius,
        borderColor: '#ECEDEC',
        borderWidth: 1,
        font: {fontSize:config.theme.fontSizeNormal, fontWeight: 'bold'}
    });
    
    // restore values
    if ('anonymous' === Settings.getPiwikUserAuthToken()) {
        piwikAnonymous.fireEvent('change', {value: true});
        piwikAnonymous.value = true;
    }
    
    if (this.piwikUrl) {
        piwikUrl.value = this.piwikUrl;
    }
    
    if (this.piwikUser) {
        piwikUser.value = this.piwikUser;
    }
    
    if (this.piwikPassword) {
        piwikPassword.value = this.piwikPassword;
    }
    
    if (this.piwikMultiCharts) {
        piwikMultiCharts.value = this.piwikMultiCharts;
    }
    
    if (this.graphsEnabled) {
        piwikGraphs.value = this.graphsEnabled;
    }
    
    var _this = this;
    
    save.addEventListener('click', function ()
    {
        if (!piwikUrl.value || 'http' !== piwikUrl.value.substr(0, 4).toLowerCase()) {
            
            var url = piwikUrl.value;
            if (!url) {
                url = '';
            }
            
            var alertDialog = Titanium.UI.createAlertDialog({
                title: _('General_Error'),
                message: _('SitesManager_ExceptionInvalidUrl').replace('%s', url),
                buttonNames: [_('General_Ok')]
            });
            
            alertDialog.show();
            
            return;
        }
        
        if ((!piwikUser.value || '' == piwikUser.value) && !piwikAnonymous.value) {

            var alertDialog = Titanium.UI.createAlertDialog({
                title: _('General_Error'),
                message: _('General_Required').replace('%s', _('Login_Login')),
                buttonNames: [_('General_Ok')]
            });

            alertDialog.show();
            
            return;
        }
        
        if ((!piwikPassword.value || '' == piwikPassword.value) && !piwikAnonymous.value) {

            var alertDialog = Titanium.UI.createAlertDialog({
                title: _('General_Error'),
                message: _('General_Required').replace('%s', _('Login_Password')),
                buttonNames: [_('General_Ok')]
            });

            alertDialog.show();
            
            return;
        }
        
        if (piwikUrl.value) {
            var lastUrlChar = piwikUrl.value.substr(piwikUrl.value.length - 1, 1);
            
            if ('/' !== lastUrlChar) {
                piwikUrl.value = piwikUrl.value + '/';
            }
        }
        
        _this.showWaitIndicator();
    
        Settings.setPiwikUrl(piwikUrl.value);
        Settings.setPiwikUser(piwikUser.value);
        Settings.setPiwikPassword(piwikPassword.value);
        Settings.setPiwikMultiChart(piwikMultiCharts.value);
        Settings.setGraphsEnabled(piwikGraphs.value);
        
        for(var langCode in _this.availableLanguages) {
            if(language.title == _this.availableLanguages[langCode]) {
                Settings.setLanguage(langCode);
                break;
            }
        }
    
        // is called when auth token is successfully received. -> we do receive an auth_token even if user credentials
        // are not valid. we have to verify the token with another request therefore.
        var onReceiveAuthTokenSuccess = function (token) {
            
            // this is allowed and we save the default token in such a case.
            Settings.setPiwikUserAuthToken(token);
            
            // we have to init piwimodel again after setting token auth
            _this.piwik.init();
            
            /**
             * trigger piwik version compare only if save auth token was successful. it is possible that the window is 
             * already closed or in background till the possible information - alert - is displayed.
             */
            _this.comparePiwikVersion();
    
            Translation.fetchTranslations();
            
            // verify token_auth, user should have at least view access
            _this.piwik.send('SitesManager.getSitesIdWithAtLeastViewAccess', {}, function (response) {

                _this.hideWaitIndicator();
            
                if (!response || !(response instanceof Array) || 0 == response.length) {
            
                    if (!_this.piwik.errorMessageSent) {
                        var alertDialog = Titanium.UI.createAlertDialog({
                            title: _('General_Error'),
                            message: _('General_ExceptionPrivilegeAtLeastOneWebsite').replace('%s', _('UsersManager_PrivView')),
                            buttonNames: [_('General_Ok')]
                        });
            
                        alertDialog.show();
                    }
                    
                    return;
                    
                } 
            
                var alertDialog = Titanium.UI.createAlertDialog({
                    title: _('General_Done'),
                    message: _('General_YourChangesHaveBeenSaved'),
                    buttonNames: [_('General_Ok')]
                });
                
                alertDialog.addEventListener('click', function (event) {
                    Window.createMvcWindow({jsController: 'index',
                                            jsAction:     'index',
                                            closeAllPreviousOpenedWindows: true,
                                            exitOnClose:  true});
                });
                
                alertDialog.show();
            });
        };
        
        // is called on any error while trying to fetchAuthToken
        var onReceiveAuthTokenError = function () {
        
            _this.hideWaitIndicator();
            
            // we save the default token in such a case.
            Settings.setPiwikUserAuthToken('');
            
            if (!_this.piwik.errorMessageSent) {
    
                var alertDialog = Titanium.UI.createAlertDialog({
                    title: _('General_Error'),
                    message: _('Mobile_SaveSuccessError'),
                    buttonNames: [_('General_Ok')]
                });
    
                alertDialog.show();
            }
        };
        
        if (piwikAnonymous.value) {
            
            onReceiveAuthTokenSuccess('anonymous');
            
            return;
        }
        
        var parameter = {userLogin:   piwikUser.value,
                         md5Password: Titanium.Utils.md5HexDigest(piwikPassword.value)};
    
        _this.piwik.init();
        
        _this.piwik.send('UsersManager.getTokenAuth', parameter, function (response) {
        
            if (!response || !(response instanceof Object) || !response.value) {
    
                onReceiveAuthTokenError();
                
                return;
            }
            
            onReceiveAuthTokenSuccess(response.value);
        });
    });
    
    box.subView.add(labelUrl);
    box.subView.add(piwikUrl);
    box.subView.add(labelAnonymous);
    box.subView.add(piwikAnonymous);
    box.subView.add(labelUser);
    box.subView.add(piwikUser);
    box.subView.add(labelPassword);
    box.subView.add(piwikPassword);
    box.subView.add(labelLanguage);
    box.subView.add(language);
    box.subView.add(labelMultiCharts);
    box.subView.add(labelMultiChartsInfo);
    box.subView.add(piwikMultiCharts);
    box.subView.add(labelGraphs);
    box.subView.add(piwikGraphs);
    box.subView.add(separator);
    box.subView.add(save);
    
    box.subView.height = save.top + save.height + 10;
    
    var scrollView = Titanium.UI.createScrollView({
        contentWidth: 'auto',
        contentHeight: 'auto',
        top: 0,
        left: 0,
        right: 0,
        showVerticalScrollIndicator: false,
        showHorizontalScrollIndicator: false
    });
    
    scrollView.add(box.subView);
    
    this.add(scrollView);
}
