require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const dbRouter = require('./src/config/db');
const seedAdmin = require('./src/config/seed');
const { protectApi } = require('./src/middlewares/auth');
const enforceOwnership = require('./src/middlewares/ownership');
const { notFound, errorHandler } = require('./src/middlewares/error');

const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const linkRoutes = require('./src/routes/linkRoutes');
const songRoutes = require('./src/routes/songRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const reactionRoutes = require('./src/routes/reactionRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Yuzu Creation API', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);
app.use('/api', linkRoutes);
app.use('/api', songRoutes);
app.use('/api', videoRoutes);
app.use('/api', commentRoutes);
app.use('/api', reactionRoutes);
app.use('/api', statsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res, next) => {
  if (req.path === '/users' || req.path.startsWith('/users/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return next();
});

app.use('/api', protectApi);

app.use('/api', enforceOwnership);

app.use('/api', dbRouter);

app.use(notFound);
app.use(errorHandler);

seedAdmin();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Yuzu Creation is running at http://localhost:${PORT}`);
  console.log('  JSON Server CRUD     ->  /api/projects | /api/links | /api/songs');
  console.log('  Auth API             ->  /api/auth/register | /api/auth/login | /api/auth/me');
  console.log('  Public profile       ->  /api/profile');
});