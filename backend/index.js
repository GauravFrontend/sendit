import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import ollamaRoutes from './routes/ollama.js';
import n8nRoutes from './routes/n8n.js';
import sheetRoutes from './routes/sheets.js';

const app = express();
app.use(cors());
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

connectDB();

app.use('/api', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api', ollamaRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/sheets', sheetRoutes);
app.get('/api/health', (req, res) => res.status(200).send('OK'));

app.listen(5000, () => console.log('Server running on 5000'));