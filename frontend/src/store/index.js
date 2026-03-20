import { atom } from 'recoil';

export const complaintStepState = atom({
    key: 'complaintStepState', 
    default: 1, // Step 1: Verification, Step 2: Complaint Details
});

export const complaintDataState = atom({
    key: 'complaintDataState',
    default: {
        email: '',
        category: 'Infrastructure',
        title: '',
        description: ''
    }
});

export const authState = atom({
    key: 'authState',
    default: {
        isAuthenticated: false,
        adminToken: null
    }
});
