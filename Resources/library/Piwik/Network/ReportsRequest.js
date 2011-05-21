/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class    Fetches a list of all available reports for a given site using the metadata API.
 */
Piwik.Network.ReportsRequest = function () {

    /**
     * This event will be fired as soon as all available reports are fetched.
     *
     * @name    Piwik.Network.ReportsRequest#event:onload
     * @event
     *
     * @param   {Object}    event
     * @param   {string}    event.type                The name of the event.
     * @param   {Array}     event.site                See {@link Piwik.Network.ReportsRequest#site}.
     * @param   {boolean}   event.availableReports    See {@link Piwik.Network.ReportsRequest#availableReports}.
     */

    /**
     * An object containing the result of the Piwik 'API.getReportMetadata' method.
     *
     * @type Object
     */
    this.availableReports = null;

    /**
     * The list of available reports that shall be requested for this site.
     *
     * @type Object
     */
    this.site             = null;

    /**
     * The key used to cache the response. Once the response is cached we do not have to send the request again.
     *
     * @type string
     */
    this.sessionKey       = null;

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
     * Initialize / reset all previous defined or fetched values. We have to do this cause it is possible to call the
     * 'send' method multiple times.
     */
    this.init = function () {
        this.availableReports = null;
        this.site             = null;
        this.sessionKey       = null;
    };
    
    /**
     * Sends a request to the Piwik API using the method 'API.getReportMetadata' (see <a href="http://piwik.org/docs/analytics-api/metadata/#toc-listing-all-the-metadata-api-functions">Metadata API</a>)
     * to get a list of all available reports which the Server version does support. This list of available reports
     * depends on the Piwik Server version and on the installed plugins.
     * Executes the {@link Piwik.Network.ReportsRequest#loaded} method as soon as the result is received.
     *
     * @param   {object}    params
     * @param   {object}    params.site             The site object you want to receive a list of all available results.
     * @param   {boolean}   [params.reload="false"] If true, it will not use an already cached result. 
     */
    this.send = function (params) {
        this.init();

        this.site    = params.site;

        var settings = Piwik.require('App/Settings');
        var session  = Piwik.require('App/Session');
        
        var language = settings.getLanguage();

        // the report contains text/translations, therefore we have to add the language to the cache key.
        this.sessionKey      = 'piwik_report_metadata_' + this.site.accountId + '_' + language;
        var cachedReportData = session.get(this.sessionKey);
        
        if (!params.reload
            && cachedReportData
            && (cachedReportData instanceof Array) 
            && 0 < cachedReportData.length) {
            // we already have a cached result

            this.availableReports = cachedReportData;

            // fire the result without sending a network request
            this.fire();
            
            return;
        }

        var accountManager = Piwik.require('App/Accounts');
        var account        = accountManager.getAccountById(this.site.accountId);
        var piwik          = Piwik.require('Network/PiwikApiRequest');

        piwik.setMethod('API.getReportMetadata');
        piwik.setAccount(account);
        piwik.setParameter({idSites: this.site.idsite});
        piwik.setCallback(this, this.loaded);
        piwik.send();
    };

    /**
     * Caches the reportMetaData and triggers the onload event.
     *
     * @param    {Object}     reportMetaData   See {@link Piwik.Network.ReportsRequest#send}
     */
    this.loaded = function (reportMetaData) {

        if (!reportMetaData) {
            reportMetaData = [];
        }

        this.availableReports = reportMetaData;

        // do not cache an empty result
        if (reportMetaData && (reportMetaData instanceof Array) && 0 < reportMetaData.length) {
            var session = Piwik.require('App/Session');
            session.set(this.sessionKey, reportMetaData);
        }

        this.fire();
    };

    /**
     * Fires an 'onload' event containing the result of the ReportsRequest.
     *
     * @fires Piwik.Network.ReportsRequest#event:onload
     */
    this.fire = function () {

        var eventResult = {type: 'onload',
                           availableReports: this.availableReports,
                           site: this.site};

        this.fireEvent('onload', eventResult);
    };
};