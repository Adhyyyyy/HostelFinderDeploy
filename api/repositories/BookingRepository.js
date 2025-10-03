import BaseRepository from '../core/BaseRepository.js';
import Booking from '../models/Booking.js';

/**
 * Booking Repository
 * Handles all database operations for Booking entity
 */
class BookingRepository extends BaseRepository {
    constructor() {
        super(Booking);
    }

    /**
     * Find bookings by status
     */
    async findByStatus(status) {
        try {
            return await this.findAll({ status }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByStatus');
        }
    }

    /**
     * Find bookings by hostel ID
     */
    async findByHostelId(hostelId) {
        try {
            return await this.findAll({ hostelID: hostelId }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByHostelId');
        }
    }

    /**
     * Find bookings by room ID
     */
    async findByRoomId(roomId) {
        try {
            return await this.findAll({ roomID: roomId }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByRoomId');
        }
    }

    /**
     * Find bookings by user phone
     */
    async findByUserPhone(phone) {
        try {
            return await this.findAll({ phone }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByUserPhone');
        }
    }

    /**
     * Find pending bookings
     */
    async findPendingBookings() {
        try {
            return await this.findByStatus('pending');
        } catch (error) {
            throw this._handleError(error, 'findPendingBookings');
        }
    }

    /**
     * Find approved bookings
     */
    async findApprovedBookings() {
        try {
            return await this.findByStatus('approved');
        } catch (error) {
            throw this._handleError(error, 'findApprovedBookings');
        }
    }

    /**
     * Find rejected bookings
     */
    async findRejectedBookings() {
        try {
            return await this.findByStatus('rejected');
        } catch (error) {
            throw this._handleError(error, 'findRejectedBookings');
        }
    }

    /**
     * Update booking status
     */
    async updateStatus(bookingId, status) {
        try {
            return await this.updateById(bookingId, { status });
        } catch (error) {
            throw this._handleError(error, 'updateStatus');
        }
    }

    /**
     * Check if bed is already booked
     */
    async isBedBooked(roomId, bedNumber, excludeStatuses = ['rejected']) {
        try {
            const filter = {
                roomID: roomId,
                bedNumber: bedNumber,
                status: { $nin: excludeStatuses }
            };
            return await this.exists(filter);
        } catch (error) {
            throw this._handleError(error, 'isBedBooked');
        }
    }

    /**
     * Find bookings by date range
     */
    async findByDateRange(startDate, endDate) {
        try {
            return await this.findAll({
                bookingDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            }, { sort: { bookingDate: -1 } });
        } catch (error) {
            throw this._handleError(error, 'findByDateRange');
        }
    }

    /**
     * Get booking statistics
     */
    async getBookingStatistics() {
        try {
            const totalBookings = await this.count();
            const pendingBookings = await this.count({ status: 'pending' });
            const approvedBookings = await this.count({ status: 'approved' });
            const rejectedBookings = await this.count({ status: 'rejected' });

            return {
                totalBookings,
                pendingBookings,
                approvedBookings,
                rejectedBookings,
                approvalRate: totalBookings > 0 ? (approvedBookings / totalBookings) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getBookingStatistics');
        }
    }

    /**
     * Get booking statistics by hostel
     */
    async getBookingStatisticsByHostel(hostelId) {
        try {
            const totalBookings = await this.count({ hostelID: hostelId });
            const pendingBookings = await this.count({ 
                hostelID: hostelId, 
                status: 'pending' 
            });
            const approvedBookings = await this.count({ 
                hostelID: hostelId, 
                status: 'approved' 
            });
            const rejectedBookings = await this.count({ 
                hostelID: hostelId, 
                status: 'rejected' 
            });

            return {
                totalBookings,
                pendingBookings,
                approvedBookings,
                rejectedBookings,
                approvalRate: totalBookings > 0 ? (approvedBookings / totalBookings) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getBookingStatisticsByHostel');
        }
    }

    /**
     * Search bookings by user name or phone
     */
    async searchBookings(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            return await this.findAll({
                $or: [
                    { name: regex },
                    { phone: regex },
                    { hostelName: regex }
                ]
            }, { sort: { createdAt: -1 } });
        } catch (error) {
            throw this._handleError(error, 'searchBookings');
        }
    }
}

export default BookingRepository;
