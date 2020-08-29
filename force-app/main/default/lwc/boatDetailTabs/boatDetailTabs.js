import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { unsubscribe, APPLICATION_SCOPE, MessageContext, subscribe } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    boatId;
    wiredRecord;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };
    @wire(MessageContext)
    messageContext;
    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord && this.wiredRecord.data  ? 'utility:anchor':null
     }
    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
     }

    // Private
    subscription = null;


    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wiredRecord


    // Subscribe to the message channel
    subscribeMC() {
        if (this.subscription || this.recordId) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => this.handleMessage(message),
            { scope: APPLICATION_SCOPE }
        );
     }

    handleMessage(message) {
        this.boatId = message.recordId;
    }

    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC()
     }

    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                actionName: 'view',
            },
        });
     }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() {
        this.template.querySelector('lightning-tabset').activeTabValue = 'two';
        this.template.querySelector('c-boat-reviews').refresh()
        
     }
}