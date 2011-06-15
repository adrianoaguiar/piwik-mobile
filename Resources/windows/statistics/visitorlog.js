/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 * 
 * @fileOverview window 'statistics/live.js' .
 */

/**
 * @class Displays a log of the visitors. It currently displays the latest 10 visitors on window open (depending
 *        on the current selected date). The list does not display more than 30 visitors cause of performance/memory
 *        impacts (especially on older/slower devices).
 *
 * @param    {Object}      params
 * @param    {Object}      params.site           The current selected site.
 *
 * @this     {Piwik.UI.Window}
 * @augments {Piwik.UI.Window}
 */
function window (params) {

    /**
     * @see Piwik.UI.Window#titleOptions
     */
    this.titleOptions = {title: _('Live_VisitorLog')};

    /**
     * @see Piwik.UI.Window#menuOptions
     */
    this.menuOptions  = {};

    var latestRequestedTimestamp = null;
    var oldestVisitId            = null;

    var request   = Piwik.require('Network/LiveRequest');
    var tableView = Ti.UI.createTableView({id: 'visitorLogTableView'});
    var refresh   = Piwik.UI.createRefresh({tableView: tableView});
    var site      = params.site;

    this.add(tableView);

    if (!site || !site.accountId) {
        //@todo shall we close the window?
        Piwik.Log.warn('Missing site parameter, can not display window', 'statistics/live::window');

        return;
    }
    
    var accountManager   = Piwik.require('App/Accounts');
    var account          = accountManager.getAccountById(site.accountId);

    if (!account) {
        //@todo shall we close the window?
        Piwik.Log.warn('Account not exists, can not display window', 'statistics/live::window');

        return;
    }

    var accessUrl        = ('' + account.accessUrl).formatAccessUrl();

    refresh.addEventListener('onRefresh', function () {

        request.send(params);
    });

    tableView.addEventListener('click', function (event) {
        if (!event || !event.rowData || !event.rowData.visitor) {

            return;
        }

        // open a new window to displayed detailed information about the visitor
        Piwik.UI.createWindow({url: 'statistics/visitor.js',
                               accessUrl: accessUrl,
                               visitor: event.rowData.visitor});
    });

    request.addEventListener('onload', function (event) {

        refresh.refreshDone();

        tableView.setData([]);

        var visitorRows     = [];

        // insert new rows
        var visitorOverview = null;
        var visitorRow      = null;
        var visitor         = null;

        var nextPagerRow    = Ti.UI.createTableViewRow({title: _('General_Next'),
                                                        className: 'visitorlogPagerTableViewRow'});
        nextPagerRow.addEventListener('click', function () {
            params.minTimestamp      = latestRequestedTimestamp;
            params.maxIdVisit        = null;
            params.fetchLiveOverview = false;
            request.send(params);
        });

        visitorRows.push(nextPagerRow);

        if (event.details && event.details.length) {
            for (var index = 0; index < event.details.length; index++) {

               visitor = event.details[index];

                if (!visitor) {
                    continue;
                }

                if (0 == index && visitor.firstActionTimestamp) {
                    // store the timestamp of the first visitor as the latest requested timestamp
                    latestRequestedTimestamp = visitor.firstActionTimestamp;
                }
                
                visitorOverview = Piwik.UI.createVisitorOverview({visitor: visitor,
                                                                  accessUrl: accessUrl,
                                                                  useFirstVisit: true});
                visitorRow      = visitorOverview.getRow();

                // add visitor information to the row. This makes it possibly to access this value when
                // the user clicks on a row within the tableview (click event).
                // we do not do this in VisitorOverview UI widget cause it's a window specific thing.
                visitorRow.visitor   = visitor;

                visitorRows.push(visitorRow);
            }

            if (visitor && visitor.idVisit) {
                // store the id of the last visitor
                oldestVisitId = visitor.idVisit;
            }
        }

        var previousPagerRow  = Ti.UI.createTableViewRow({title: _('General_Previous'),
                                                          className: 'visitorlogPagerTableViewRow'});
        previousPagerRow.addEventListener('click', function () {
            params.minTimestamp      = null;
            params.maxIdVisit        = oldestVisitId;
            params.fetchLiveOverview = false;
            request.send(params);
        });

        visitorRows.push(previousPagerRow);
        
        tableView.setData(visitorRows);
    });

    /**
     * Request real time visitors async.
     *
     * @param  {object} params
     */
    this.open = function (params) {
        
        params.fetchLiveOverview = false;

        request.send(params);
    };
}