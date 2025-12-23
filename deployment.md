# Deployment Guide

This guide will help you deploy your **Expense Tracker** to the internet.

## Prerequisites
- A **GitHub** account.
- A **Render** account (for Backend).
- A **Vercel** account (for Frontend).

---

## Part 1: Push Code to GitHub

1.  **Initialize Git** in your project folder:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Create a New Repository** on GitHub (name it `expense-tracker`).
3.  **Push your code**:
    ```bash
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin main
    ```

---

## Part 2: Deploy Backend (Render)

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `backend-node`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables** (Scroll down to "Environment Variables"):
    *   Key: `FIREBASE_CREDENTIALS`
    *   Value: *(Paste the entire content of your `serviceAccountKey.json` file here)*
6.  Click **Create Web Service**.
7.  Wait for it to deploy. Copy the **onrender.com URL** (e.g., `https://expense-tracker-backend.onrender.com`).

---

## Part 3: Deploy Frontend (Vercel)

1.  Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Settings**:
    *   **Root Directory**: `frontend` (Click "Edit" and select the `frontend` folder).
    *   **Framework**: `Vite` (Should be auto-detected).
5.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: *(Paste your Render Backend URL here, e.g., `https://expense-tracker-backend.onrender.com/api`)* -> **Important**: Add `/api` at the end!
6.  Click **Deploy**.

---

## Part 4: Done!

Vercel will give you a link (e.g., `https://expense-tracker.vercel.app`). Open it on your phone, share it with friends, or use it anywhere!
