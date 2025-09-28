import express from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import routes from './routes';
import errorHandler from './middleware/errorHandler';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        const PORT = config.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

export default app;