# Firestore Security Rules

## Problem
You're getting "Missing or insufficient permissions" error when trying to save/read user data from Firestore.

## Solution
You need to update your Firestore Security Rules in Firebase Console.

## Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **authapp-2af47**
3. Click on **Firestore Database** in the left menu
4. Click on **Rules** tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Donors collection - authenticated users can read, only owner can write
    match /donors/{donorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == donorId;
    }
    
    // Chats collection - users can read/write their own chats
    match /chats/{chatId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
    }
    
    // Messages subcollection - users can read/write messages in their chats
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Blood Requests - authenticated users can read, only requester can write
    match /bloodRequests/{requestId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.requesterId;
      allow create: if request.auth != null;
    }
    
    // Notifications - users can read their own notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }
  }
}
```

6. Click **Publish** to save the rules

## Temporary Development Rules (Less Secure - For Testing Only)

If you want to allow all authenticated users to read/write everything (for development only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Warning**: The temporary rules above are less secure. Use them only for development/testing. For production, use the detailed rules above.

## After Updating Rules

1. Wait 1-2 minutes for rules to propagate
2. Restart your app
3. Try signup/login again

