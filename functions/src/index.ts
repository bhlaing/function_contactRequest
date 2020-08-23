import * as functions from 'firebase-functions';
import admin = require('firebase-admin');
admin.initializeApp()

export const requestContact = functions.firestore.document('users/{userId}/contacts/{contactId}')
    .onWrite(async (change, context) => {

        const updatedContactRequest = change?.after?.data() ?? null
        console.log('updatedContactRequest:', updatedContactRequest);
        try {
            if(updatedContactRequest!= null && updatedContactRequest.status == 'PENDING') {
                const writeResult = await admin.firestore().collection('users')
                .doc(updatedContactRequest.userId)
                .collection('contacts')
                .doc(context.params.userId)
                .set(createContactRequest(context.params.userId))
                console.log('Created friend request:', writeResult);
                return;
            }
        } catch(err) {
            console.log('request friend failed');
            if(updatedContactRequest != null && change?.before?.data() != null) {
                const writeResult = await admin.firestore().collection('users')
                .doc(context.params.userId)
                .collection('contacts')
                .doc(updatedContactRequest.userId)
                .delete()

                console.log('Contact request reverted:', writeResult);
            }
  
        }


    });


    interface ContactRequest {
        userId: string;
        status: string;
    }

    function createContactRequest(id: string): ContactRequest {
        const request: ContactRequest = {
            userId: id,
            status: 'REQUEST'
        }

        return request
    }
