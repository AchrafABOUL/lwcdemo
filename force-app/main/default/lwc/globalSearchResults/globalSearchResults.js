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

    }

}