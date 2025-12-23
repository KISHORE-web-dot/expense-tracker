const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (e) {
        console.error("No serviceAccountKey.json found and FIREBASE_CREDENTIALS not set.");
    }
}

// Initialize Firebase
if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const COLLECTION_NAME = 'transactions';

/**
 * Helper to convert Firestore doc to transaction object
 */
const docToTransaction = (doc) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    };
};

const loadData = async () => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(docToTransaction);
    } catch (err) {
        console.error("Error loading data from Firestore:", err);
        return [];
    }
};

const saveData = async (data) => {
    // Not used in Firestore implementation as we save incrementally
    console.warn("saveData called but Firestore saves incrementally.");
};

const addTransaction = async (amount, type, description, date) => {
    if (!date) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        date = `${year}-${month}-${day}`;
    }

    const newTransaction = {
        amount: parseFloat(amount),
        type,
        description,
        date,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newTransaction);

    return {
        id: docRef.id,
        ...newTransaction,
        createdAt: new Date().toISOString() // Approximate for immediate return
    };
};

const getTransactions = async (month, year) => {
    const transactions = await loadData();

    if (month || year) {
        return transactions.filter(t => {
            if (!t.date) return false;
            // Parse "YYYY-MM-DD" string
            const [tYear, tMonth, tDay] = t.date.split('-').map(Number);

            let match = true;
            if (month && parseInt(month) !== tMonth) match = false;
            if (year && parseInt(year) !== tYear) match = false;
            return match;
        });
    }
    return transactions;
};

const clearData = async () => {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.size === 0) return;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

module.exports = {
    loadData,
    saveData,
    addTransaction,
    getTransactions,
    clearData
};
