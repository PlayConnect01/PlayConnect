const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Controllers
const authController = require('../controllers/admin/authController');
const dashboardController = require('../controllers/admin/dashboardController');
const userManagementController = require('../controllers/admin/userManagementController');
const reportManagementController = require('../controllers/admin/reportManagementController');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// Protected routes
router.use(adminAuth);

// Dashboard routes
router.get('/users', dashboardController.getAllUsers);
router.get('/events', dashboardController.getAllEvents);
router.get('/competitions', dashboardController.getAllCompetitions);
router.get('/products', dashboardController.getAllProducts);
router.get('/reports', dashboardController.getAllReports);
router.get('/events/today', dashboardController.getEventsOfDay);
router.get('/competitions/today', dashboardController.getCompetitionsOfDay);
router.get('/users/top', dashboardController.getTopUsers);
router.get('/stats', dashboardController.getDashboardStats);

// User management routes
router.post('/users/:userId/ban', userManagementController.banUser);
router.post('/users/:userId/unban', userManagementController.unbanUser);
router.post('/users/:userId/block', userManagementController.blockUser);
router.post('/users/:userId/unblock', userManagementController.unblockUser);

// Report management routes
router.post('/reports/:reportId/handle', reportManagementController.handleReport);
router.get('/reports/pending', reportManagementController.getPendingReports);

module.exports = router;