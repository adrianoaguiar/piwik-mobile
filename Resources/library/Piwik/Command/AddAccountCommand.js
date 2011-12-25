/**
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */

/**
 * @class   Add a Piwik account command.
 *
 * @augments Piwik.UI.View
 */
Piwik.Command.AddAccountCommand = function () {
    
    /**
     * Returns a unique id for this command.
     * 
     * @returns {string}   The id of the command.
     */
    this.getId = function () {
        return 'addAccountCommand';
    };
    
    /**
     * Get the label/title of the command which is intended to be displayed.
     * 
     * @returns {string}   The label of the command.
     */
    this.getLabel = function () {
        return _('Mobile_AddAccount');
    };
    
    /**
     * Get the buttonBar label definition for this command. It is intended for Ti.UI.ButtonBar
     * 
     * @returns {Object}   The button label of the command.
     */
    this.getButtonLabel = function () {
        return {image: 'images/header_add.png',
                command: this,
                width: 37};
    };
    
    /**
     * Get the Android OptionMenu item definition for this command.
     * 
     * @type Object
     */
    this.getOptionMenuItem = function () {
        return {title: this.getLabel(),
                icon: 'images/menu_add.png'};
    };

    /**
     * Defines the url and title that will be tracked as soon as the user chooses the option.
     * 
     * @type Object
     */
    this.getOptionMenuTrackingEvent = function () {
        return {title: 'Option Menu Add Account',
                url: '/android-option-menu/add-account'};
    };
    
    /**
     * Get the menu icon definitions for this command.
     * 
     * @type Object
     */
    this.getMenuIcon = function () {
        return {id: 'menuAddAccountIcon'};
    };

    /**
     * Defines the url and title that will be tracked as soon as the user taps on the menu icon.
     * 
     * @type Object
     */
    this.getMenuTrackingEvent = function () {
        return {title: 'Menu Click - Add Account',
                url: '/menu-click/add-account'};
    };
    
    /**
     * Execute the command.
     */
    this.execute = function () {
        this.create('Window', {url: 'settings/editaccount.js', target: 'modal'});
    };
    
    /**
     * Undo the executed command.
     */
    this.undo = function () {
        
    };
};

/**
 * Extend Piwik.UI.View
 */
Piwik.Command.AddAccountCommand.prototype = Piwik.require('UI/View');