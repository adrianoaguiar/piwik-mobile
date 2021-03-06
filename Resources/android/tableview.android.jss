/*
 * Piwik - Web Analytics
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 * @version $Id$
 */
tableview {
   backgroundColor: '#ffffff';
   separatorColor: '#eeedeb';
   visible: true;
   focusable: true;
}

tableviewrow {
    color: '#333333';
    font-size: '18sp';
    font-weight: 'normal';
    left: 0;
    width: 'fill';
}

.tableViewSection {
    backgroundColor: '#B5B0A7';
    selectedBackgroundColor: '#B5B0A7';
    height: '24dp';
    focusable: false;
    left: 0;
    width: '100%';
}

.tableViewRowSelectable {
    backgroundColor: '#eae4d9';
}

#tableViewSectionHeaderLabel {
    textAlign: 'left';
    color: '#ffffff';
    left: '16dp';
    right: '16dp';
    font-size: '14sp';
    font-weight: 'bold';
    ellipsize: true;
    wordWrap: false;
}

#tableViewRowTitleLabelWithDescription {
    textAlign: 'left';
    height: 'size';
    left: '16dp';
    right: '16dp';
    top: '10dp';
    color: '#333333';
    ellipsize: true;
    wordWrap: false;
    font-size: '16sp';
    font-weight: 'normal';
    zIndex: 2;
}

#tableViewRowTitleLabel {
    textAlign: 'left';
    height: 'size';
    left: '16dp';
    right: '16dp';
    top: '10dp';
    bottom: '10dp';
    color: '#333333';
    ellipsize: true;
    wordWrap: false;
    font-size: '16sp';
    font-weight: 'normal';
    zIndex: 2;
}

#tableViewRowDescriptionLabel {
    font-size: '12sp';
    textAlign: 'left';
    width: 'size';
    height: 'size';
    left: '16dp';
    right: '16dp';
    top: '34dp';
    bottom: '10dp';
    color: '#808080';
    ellipsize: false;
    wordWrap: true;
    zIndex: 3;
}

#tableViewRowDescriptionLabelvertical {
    font-size: '12sp';
    textAlign: 'left';
    width: 'size';
    height: 'size';
    left: '16dp';
    right: '16dp';
    top: '4dp';
    bottom: '10dp';
    color: '#808080';
    ellipsize: false;
    wordWrap: true;
    zIndex: 3;
}

#tableViewRowValueLabel {
    right: '16dp';
    font-size: '16sp';
    font-weight: 'normal';
    textAlign: 'right';
    width: 'size';
    height: 'size';
    color: '#0099CC';
    backgroundColor: 'white';
    zIndex: 5;
}

.tableViewRowArrowRightImage {
    image: '/images/ic_action_arrow_right.png';
    right: '2dp';
    width: '32dp';
    height: '32dp';
    zIndex: 7;
}

.tableViewRowArrowDownImage {
    image: '/images/spinner_default_holo_light.png';
    right: '8dp';
    width: '24dp';
    height: '34dp';
    bottom: '0dp';
    zIndex: 8;
}

.tableViewRowCheckOn {
    image: '/images/btn_check_on_holo_light.png';
    backgroundColor: 'white';
    width: '32dp'; 
    height: '32dp';
    right: '12dp';
    visible: false;
    zIndex: 9;
}

.tableViewRowCheckOff {
    image: '/images/btn_check_off_holo_light.png';
    backgroundColor: 'white';
    width: '32dp'; 
    height: '32dp';
    right: '12dp';
    visible: false;
    zIndex: 10;
}

#tableViewRowRightImage {
    right: '5dp';
}