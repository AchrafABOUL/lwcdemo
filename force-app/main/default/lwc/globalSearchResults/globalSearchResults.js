import {
    LightningElement,
    wire
} from 'lwc';
import {
    registerListener,
    fireEvent
} from 'c/pubsub';
import {
    CurrentPageReference
} from 'lightning/navigation';
export default class GlobalSearchResults extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    currentObject = "Account";
    results = [];
    columns = [{
            label: 'Id',
            fieldName: 'Id',
            type: 'text'
        },
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'text'
        },
        {
            label: 'Type',
            fieldName: 'Type',
            type: 'text'
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            type: 'text'
        },
        {
            label: 'Billing Country',
            fieldName: 'BillingCountry',
            type: 'text'
        }
    ];
    connectedCallback() {
        registerListener(
            "gotResponse",
            (resp) => {
                this.results = resp;
            },
            this
        );
        registerListener(
            "changeObject",
            (curObject) => {
                if(this.currentObject !== curObject){
                    this.results=[];
                }
                this.currentObject = curObject;
                if(this.currentObject === "Account"){
                    this.columns = [{
                        label: 'Id',
                        fieldName: 'Id',
                        type: 'text'
                    },
                    {
                        label: 'Name',
                        fieldName: 'Name',
                        type: 'text'
                    },
                    {
                        label: 'Type',
                        fieldName: 'Type',
                        type: 'text'
                    },
                    {
                        label: 'Phone',
                        fieldName: 'Phone',
                        type: 'text'
                    },
                    {
                        label: 'Billing Country',
                        fieldName: 'BillingCountry',
                        type: 'text'
                    }
                ];
                }
                else if(this.currentObject === "Contact"){
                    this.columns = [{
                        label: 'Id',
                        fieldName: 'Id',
                        type: 'text'
                    },
                    {
                        label: 'Lastname',
                        fieldName: 'Lastname',
                        type: 'text'
                    },
                    {
                        label: 'Phone',
                        fieldName: 'Phone',
                        type: 'text'
                    },
                    {
                        label: 'Email',
                        fieldName: 'Email',
                        type: 'text'
                    }
                ];
                }
                else if(this.currentObject === "Opportunity"){
                    this.columns = [{
                        label: 'Id',
                        fieldName: 'Id',
                        type: 'text'
                    },
                    {
                        label: 'Name',
                        fieldName: 'Name',
                        type: 'text'
                    },
                    {
                        label: 'Description',
                        fieldName: 'Description',
                        type: 'text'
                    },
                    {
                        label: 'Stage',
                        fieldName: 'StageName',
                        type: 'text'
                    },
                    {
                        label: 'CloseDate',
                        fieldName: 'CloseDate',
                        type: 'date'
                    }
                ];
                }
                console.log('This is the current object : ' + this.currentObject);
            },
            this
        );
    }

}