import BaseRepository from '../core/BaseRepository.js';
import User from '../models/Users.js';

/**
 * User Repository
 * Handles all database operations for User entity
 */
class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        try {
            return await this.model.findOne({ email: email.toLowerCase() });
        } catch (error) {
            throw this._handleError(error, 'findByEmail');
        }
    }

    /**
     * Find users by admin status
     */
    async findByAdminStatus(isAdmin = false) {
        try {
            return await this.model.find({ isAdmin });
        } catch (error) {
            throw this._handleError(error, 'findByAdminStatus');
        }
    }

    /**
     * Check if email already exists
     */
    async emailExists(email, excludeId = null) {
        try {
            const filter = { email: email.toLowerCase() };
            if (excludeId) {
                filter._id = { $ne: excludeId };
            }
            return await this.exists(filter);
        } catch (error) {
            throw this._handleError(error, 'emailExists');
        }
    }

    /**
     * Find users with bookings
     */
    async findUsersWithBookings() {
        try {
            return await this.model.find({ 
                'bookings.0': { $exists: true } 
            }).populate('bookings.room');
        } catch (error) {
            throw this._handleError(error, 'findUsersWithBookings');
        }
    }

    /**
     * Add booking to user
     */
    async addBooking(userId, bookingData) {
        try {
            return await this.model.findByIdAndUpdate(
                userId,
                { $push: { bookings: bookingData } },
                { new: true }
            );
        } catch (error) {
            throw this._handleError(error, 'addBooking');
        }
    }

    /**
     * Remove booking from user
     */
    async removeBooking(userId, bookingId) {
        try {
            return await this.model.findByIdAndUpdate(
                userId,
                { $pull: { bookings: { _id: bookingId } } },
                { new: true }
            );
        } catch (error) {
            throw this._handleError(error, 'removeBooking');
        }
    }

    /**
     * Search users by name or email
     */
    async search(searchTerm, options = {}) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            const filter = {
                $or: [
                    { name: regex },
                    { email: regex }
                ]
            };
            return await this.findAll(filter, options);
        } catch (error) {
            throw this._handleError(error, 'search');
        }
    }
}

export default UserRepository;
