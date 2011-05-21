/*
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    Fetches a list of all available websites where the user has at least view access. Requests all available
 *           websites for all configured accounts.
 */
Piwik.Network.WebsitesRequest = function () {

    /**
     * This event will be fired as soon as all requests are finished.
     *
     * @name    Piwik.Network.WebsitesRequest#event:onload
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type               The name of the event.
     * @param   {Array}     event.sites              See {@link Piwik.Network.WebsitesRequest#sites}.
     * @param   {boolean}   event.showMultiChart     See {@link Piwik.Network.WebsitesRequest#showMultiChart}.
     */

    /**
     * Holds an array of all available websites where the user has at least view access.
     *
     * @type Array
     */
    this.sites          = [];

    /**
     * True if multichart is enabled, false otherwise. Multicharts are the sparklines displayed beside the website name.
     *
     * @defaults false
     *
     * @type boolean
     */
    this.showMultiChart = false;

    /**
     * An array of all available accounts.
     *
     * @see Piwik.App.Accounts#getAccounts
     *
     * @type Array
     */
    this.accounts       = [];

    /**
     * Initialize / reset all previous defined or fetched values. We have to do this cause it is possible to call the
     * 'send' method multiple times.
     */
    this.init = function () {
        this.sites          = [];

        var settings        = Piwik.require('App/Settings');
        this.showMultiChart = settings.getPiwikMultiChart();

        var accountManager  = Piwik.require('App/Accounts');
        this.accounts       = accountManager.getAccounts();
    };

    /**
     * Add an event listener to receive triggered events. The callback will be executed in the
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
     * Sends a request for each configured account to determine all websites the user has at least view access. Executes
     * the {@link Piwik.Network.WebsitesRequest#loaded} method as soon as all responses are received. Executes the
     * {@link Piwik.Network.WebsitesRequest#onReceiveSitesWithAtLeastViewAccess} for each received request result (for
     * each account).
     */
    this.send = function () {
        this.init();

        var piwikRequest    = null;
        var requestPool     = Piwik.require('Network/RequestPool');
        requestPool.setContext(this);

        if (!this.accounts || !this.accounts.length) {
            // no accounts configured
            this.loaded();

            return;
        }

        for (var index = 0; index < this.accounts.length; index++) {
        
            if (!this.accounts[index] || !Boolean(this.accounts[index].active)) {
                // account is not set or not active
                continue;
            }

            // create a request to fetch all sites the user has at least view access
            piwikRequest = Piwik.require('Network/PiwikApiRequest');
            piwikRequest.setMethod('SitesManager.getSitesWithAtLeastViewAccess');
            piwikRequest.setParameter({accountId: this.accounts[index].id});
            piwikRequest.setAccount(this.accounts[index]);
            piwikRequest.setCallback(this, this.onReceiveSitesWithAtLeastViewAccess);

            // attach the request to the request pool. So all attached requests will be send in parallel
            requestPool.attach(piwikRequest);
        }

        requestPool.send(this.loaded);
    };

    /**
     * Will be called for each "SitesManager.getSitesWithAtLeastViewAccess" response. See <a href="http://piwik.org/docs/analytics-api/reference/#SitesManager">SitesManager</a> for more
     * information. Adds each allowed website to the {@link Piwik.Network.WebsitesRequest#sites} Array.
     *
     * @param   {Array}   response    The received response of the request.
     * @param   {Object}  parameter   The used parameters to send the request.
     */
    this.onReceiveSitesWithAtLeastViewAccess = function (response, parameter) {

        var allowedSites    = response;

        if (!allowedSites || !(allowedSites instanceof Array) || 0 == allowedSites.length) {
            // the user has no access to any website

            return;
        }

        // try to find the account that was used to send the request, depending on the accountId. we need the account
        // information only if showMultiChart is enabled at the moment.
        var account = {};
        if (this.showMultiChart) {
            for (var index = 0; index < this.accounts.length; index++) {
                if (this.accounts[index] && this.accounts[index].id == parameter.accountId) {
                    // this account was used to send the request
                    account = this.accounts[index];

                    break;
                }
            }
        }

        for (var sitesIndex = 0; sitesIndex < allowedSites.length; sitesIndex++) {

            var site = allowedSites[sitesIndex];

            if (!site) {
                continue;
            }

            site.sparklineUrl     = '';
            if (this.showMultiChart) {
                var graph         = Piwik.require('Graph');
                
                site.sparklineUrl = graph.getSparklineUrl(site.idsite, account.accessUrl, account.tokenAuth);
            }

            site.accountId = parameter.accountId;

            this.sites.push(site);
        }

        return;
    };

    /**
     * Will be called as soon as all requests have received and processed their result/callbacks. We can now fire an
     * event containing all sites the user has at least view access and other additional information.
     *
     * @fires Piwik.Network.WebsitesRequest#event:onload
     */
    this.loaded = function () {

        var cache = Piwik.require('App/Cache');
        cache.set('piwik_sites_allowed', this.sites);

        var eventResult = {type: 'onload',
                           sites: this.sites,
                           showMultiChart: this.showMultiChart};

        this.fireEvent('onload', eventResult);
    };
};