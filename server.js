const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const storage = require('./storage');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// GET /api/transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const { month, year } = req.query;
        const transactions = await storage.getTransactions(month, year);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/transactions
app.post('/api/transactions', async (req, res) => {
    const { amount, type, description, date } = req.body;

    if (!amount || !type || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newTransaction = await storage.addTransaction(amount, type, description, date);
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/transactions
app.delete('/api/transactions', async (req, res) => {
    try {
        await storage.clearData();
        res.json({ message: "All data cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/balance
app.get('/api/balance', async (req, res) => {
    try {
        const { month, year } = req.query;
        const transactions = await storage.getTransactions(month, year);

        let total_credit = 0;
        let total_debit = 0;

        transactions.forEach(t => {
            if (t.type.toLowerCase() === 'credit') {
                total_credit += t.amount;
            } else if (t.type.toLowerCase() === 'debit') {
                total_debit += t.amount;
            }
        });

        const balance = total_credit - total_debit;

        res.json({
            total_credit,
            total_debit,
            balance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/export
app.get('/api/export', async (req, res) => {
    try {
        const transactions = await storage.loadData();

        let lines = [];
        lines.push("EXPENSE TRACKER REPORT");
        lines.push("=======================");

        const now = new Date();
        const formattedDate = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        lines.push(`Generated on: ${formattedDate}`);
        lines.push("");

        const pad = (str, len) => (str + ' '.repeat(len)).slice(0, len);

        lines.push(`${pad('Date', 12)} | ${pad('Type', 8)} | ${pad('Amount', 10)} | Description`);
        lines.push("-".repeat(60));

        transactions.forEach(t => {
            lines.push(`${pad(t.date || '', 12)} | ${pad(t.type || '', 8)} | $${pad((t.amount || 0).toFixed(2), 9)} | ${t.description}`);
        });

        const reportContent = lines.join("\n");
        const reportPath = path.join(__dirname, 'report.txt');

        fs.writeFileSync(reportPath, reportContent);

        res.download(reportPath, 'expenses.txt', (err) => {
            if (err) {
                console.error("Error downloading file:", err);
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Connected to Firebase Project`);
});
