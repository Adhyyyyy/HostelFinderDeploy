import BaseController from '../core/BaseController.js';
import BookingService from '../services/BookingService.js';

/**
 * Booking Controller
 * Handles booking HTTP requests
 */
class BookingController extends BaseController {
    constructor() {
        const bookingService = new BookingService();
        super(bookingService);
        this.bookingService = bookingService;
    }

    /**
     * Create a new booking
     */
    async create(req, res, next) {
        try {
            this.validateBody(req, ['name', 'phone', 'roomID', 'hostelID', 'bedNumber']);

            const result = await this.bookingService.createBooking(req.body);
            this.sendResponse(res, 201, result, 'Booking created successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all bookings with optional filtering
     */
    async getAll(req, res, next) {
        try {
            const { status, hostelId, roomId, phone, ...otherFilters } = req.query;
            
            const filters = { ...otherFilters };
            if (status) filters.status = status;
            if (hostelId) filters.hostelId = hostelId;
            if (roomId) filters.roomId = roomId;
            if (phone) filters.phone = phone;

            const results = await this.bookingService.getAllBookings(filters);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get booking by ID
     */
    async getById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.bookingService.getById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update booking status
     */
    async updateBookingStatus(req, res, next) {
        try {
            this.validateParams(req, ['id']);
            this.validateBody(req, ['status']);

            const { status } = req.body;
            const result = await this.bookingService.updateBookingStatus(req.params.id, status);
            
            this.sendResponse(res, 200, result, `Booking ${status} successfully`);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Approve booking
     */
    async approveBooking(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.bookingService.approveBooking(req.params.id);
            this.sendResponse(res, 200, result, 'Booking approved successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Reject booking
     */
    async rejectBooking(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.bookingService.rejectBooking(req.params.id);
            this.sendResponse(res, 200, result, 'Booking rejected successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete booking
     */
    async deleteById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.bookingService.deleteBooking(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get pending bookings
     */
    async getPendingBookings(req, res, next) {
        try {
            const results = await this.bookingService.getPendingBookings();
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get approved bookings
     */
    async getApprovedBookings(req, res, next) {
        try {
            const results = await this.bookingService.getApprovedBookings();
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bookings by status
     */
    async getBookingsByStatus(req, res, next) {
        try {
            this.validateParams(req, ['status']);

            const results = await this.bookingService.getAllBookings({ 
                status: req.params.status 
            });
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bookings by hostel
     */
    async getBookingsByHostel(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const results = await this.bookingService.getAllBookings({ 
                hostelId: req.params.hostelId 
            });
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bookings by room
     */
    async getBookingsByRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);

            const results = await this.bookingService.getAllBookings({ 
                roomId: req.params.roomId 
            });
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bookings by user phone
     */
    async getBookingsByPhone(req, res, next) {
        try {
            this.validateParams(req, ['phone']);

            const results = await this.bookingService.getAllBookings({ 
                phone: req.params.phone 
            });
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search bookings
     */
    async searchBookings(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm) {
                return this.sendError(res, 400, 'Search term is required');
            }

            const results = await this.bookingService.searchBookings(searchTerm);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bookings by date range
     */
    async getBookingsByDateRange(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return this.sendError(res, 400, 'Start date and end date are required');
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return this.sendError(res, 400, 'Invalid date format');
            }

            const results = await this.bookingService.getBookingsByDateRange(start, end);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get booking statistics
     */
    async getBookingStatistics(req, res, next) {
        try {
            const stats = await this.bookingService.getBookingStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get booking statistics by hostel
     */
    async getBookingStatisticsByHostel(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const stats = await this.bookingService.getBookingStatisticsByHostel(req.params.hostelId);
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Bulk approve bookings
     */
    async bulkApproveBookings(req, res, next) {
        try {
            this.validateBody(req, ['bookingIds']);

            const { bookingIds } = req.body;
            
            if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
                return this.sendError(res, 400, 'bookingIds must be a non-empty array');
            }

            const results = [];
            const errors = [];

            for (const bookingId of bookingIds) {
                try {
                    const result = await this.bookingService.approveBooking(bookingId);
                    results.push({ bookingId, success: true, data: result });
                } catch (error) {
                    errors.push({ bookingId, success: false, error: error.message });
                }
            }

            const response = {
                totalBookings: bookingIds.length,
                approved: results.length,
                failed: errors.length,
                results,
                errors
            };

            this.sendResponse(res, 200, response, 'Bulk booking approval completed');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Bulk reject bookings
     */
    async bulkRejectBookings(req, res, next) {
        try {
            this.validateBody(req, ['bookingIds']);

            const { bookingIds } = req.body;
            
            if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
                return this.sendError(res, 400, 'bookingIds must be a non-empty array');
            }

            const results = [];
            const errors = [];

            for (const bookingId of bookingIds) {
                try {
                    const result = await this.bookingService.rejectBooking(bookingId);
                    results.push({ bookingId, success: true, data: result });
                } catch (error) {
                    errors.push({ bookingId, success: false, error: error.message });
                }
            }

            const response = {
                totalBookings: bookingIds.length,
                rejected: results.length,
                failed: errors.length,
                results,
                errors
            };

            this.sendResponse(res, 200, response, 'Bulk booking rejection completed');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get booking dashboard data
     */
    async getBookingDashboard(req, res, next) {
        try {
            const [
                stats,
                pendingBookings,
                recentBookings
            ] = await Promise.all([
                this.bookingService.getBookingStatistics(),
                this.bookingService.getPendingBookings(),
                this.bookingService.getAllBookings({ limit: 10 })
            ]);

            const dashboardData = {
                statistics: stats,
                pendingBookings: pendingBookings.slice(0, 5), // Latest 5 pending
                recentBookings: recentBookings.slice(0, 10), // Latest 10 bookings
                pendingCount: pendingBookings.length
            };

            this.sendResponse(res, 200, dashboardData);
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default BookingController;
