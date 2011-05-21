/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */
 
/**
 * @class   Provides a simple profiler. The profiler logs all profiling information to the standard iOS/Android SDK log
 *          which is accessible for example in Titanium Developer.
 * @static
 */
Piwik.Profiler = new function ()  {

    /**
     * Enables/disables profiling. If enabled, it logs the elapsed time in ms between two logging calls and the current
     * available memory. Should be disabled in a production release (for performance reasons).
     *
     * @type boolean
     */
    this.ENABLED = config.profileEnabled;

    /**
     * Holds the number of milliseconds since 1/1/1970. Will be updated on each step() call if profiling is enabled.
     *
     * @type null|int
     */
    this.time    = null;

    /**
     * Logs the elapsed time since the last step() call as well as the current available free memory if profiling is
     * enabled.
     *
     * @type void
     *
     * @todo instead of simply logging the 'now available memory' we could additionally log the used memory since
     * the start call. 
     */
    this.step = function () {
        if (!this.ENABLED) {
            
            return;
        }

        if (!this.time) {
            this.time = new Date().getTime();

            return;
        }

        var now = new Date().getTime();

        Ti.API.debug("Time: " + (now - this.time) + 'ms');
        Ti.API.debug("Free mem: " + (Ti.Platform.availableMemory / 1000) + 'kb');

        this.time = now;
    };

    /**
     * Start profiling. Just for debugging purposes and to measure performance. Start the profiling by calling
     * start() and finish the profiling by calling end(). The used key to start and to end the profiling has to be the
     * same.
     *
     * @example
     * Piwik.Profiler.start('renderStatisticList');
     * Piwik.Profiler.start('renderHeaderRow');
     * Piwik.Profiler.end('renderHeaderRow');
     * Piwik.Profiler.end('renderStatisticList');
     *
     * @param {string}  key    A key which describes the current profiling
     *
     * @type void
     */
    this.start = function (key) {
        if (!this.ENABLED) {

            return;
        }
        
        Piwik.Profiler['profiling' + key] = new Date().getTime();
    };

    /**
     * Finishes a previous started profiling. Logs needed time in ms and currently available free memory to console
     * using warning level.
     *
     * @see Piwik.Profiler#start
     *
     * @param {string}  key    A key which describes the current profiling and which was used in the start method.
     *
     * @type void
     *
     * @todo instead of simply logging the 'now available memory' we could log the used memory since the start call.
     */
    this.end = function (key) {
        if (!this.ENABLED) {

            return;
        }
        
        var now = new Date().getTime();

        if ('undefined' === (typeof Piwik.Profiler['profiling' + key]) || !Piwik.Profiler['profiling' + key]) {
            Ti.API.warn('You have to call this.start("' + key + '")');

            return;
        }

        var startTime = Piwik.Profiler['profiling' + key];

        delete Piwik.Profiler['profiling' + key];

        Ti.API.warn('' + key + ': ' + (now - startTime) + 'ms');
        Ti.API.warn('' + key + ' Free mem: ' + (Ti.Platform.availableMemory / 1000) + 'kb');
    };
};