const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const foodRoutes = require('./routes/foodRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

//CREATE SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
// HANDLE CONNECTION
io.on('connection', (socket) => {
  console.log('🔥 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.set('io', io);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Smart Campus Backend is Running!');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Campus API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// --- Custom Error Handling ---
// This should be after all your routes
app.use(notFound);
app.use(errorHandler);
// ---------------------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Server running with Socket.IO on port ${PORT}`);
});
