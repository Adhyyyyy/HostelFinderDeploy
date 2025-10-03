import BaseService from '../core/BaseService.js';
import BookingRepository from '../repositories/BookingRepository.js';
import BedService from './BedService.js';
import RoomService from './RoomService.js';
import HostelService from './HostelService.js';

/**
 * Booking Service
 * Handles booking business logic
 */
class BookingService extends BaseService {
    constructor() {
        const bookingRepository = new BookingRepository();
        super(bookingRepository);
        this.bookingRepository = bookingRepository;
        this.bedService = new BedService();
        this.roomService = new RoomService();
        this.hostelService = new HostelService();
    }

    /**
     * Create a new booking
     */
    async createBooking(bookingData) {
        try {
            await this._validateBookingCreation(bookingData);

            const { roomID, hostelID, bedNumber } = bookingData;

            // Validate entities exist
            const hostel = await this.hostelService.getById(hostelID);
            const room = await this.roomService.getById(roomID);

            // Check if bed is already booked
            const isBedBooked = await this.bookingRepository.isBedBooked(roomID, bedNumber);
            if (isBedBooked) {
                throw new Error('This bed is already booked or has a pending booking');
            }

            // Create booking with additional data
            const bookingCreateData = {
                ...bookingData,
                hostelName: hostel.name,
                roomNumber: room.roomNumber,
                status: 'pending'
            };

            const booking = await this.repository.create(bookingCreateData);
            return this._formatResponse(booking);
        } catch (error) {
            throw this._handleError(error, 'createBooking');
        }
    }

    /**
     * Get all bookings with optional filtering
     */
    async getAllBookings(filters = {}) {
        try {
            let bookings;

            if (filters.status) {
                bookings = await this.bookingRepository.findByStatus(filters.status);
            } else if (filters.hostelId) {
                bookings = await this.bookingRepository.findByHostelId(filters.hostelId);
            } else if (filters.roomId) {
                bookings = await this.bookingRepository.findByRoomId(filters.roomId);
            } else if (filters.phone) {
                bookings = await this.bookingRepository.findByUserPhone(filters.phone);
            } else {
                bookings = await this.repository.findAll({}, { sort: { createdAt: -1 } });
            }

            return bookings.map(booking => this._formatResponse(booking));
        } catch (error) {
            throw this._handleError(error, 'getAllBookings');
        }
    }

    /**
     * Get pending bookings
     */
    async getPendingBookings() {
        try {
            const bookings = await this.bookingRepository.findPendingBookings();
            return bookings.map(booking => this._formatResponse(booking));
        } catch (error) {
            throw this._handleError(error, 'getPendingBookings');
        }
    }

    /**
     * Get approved bookings
     */
    async getApprovedBookings() {
        try {
            const bookings = await this.bookingRepository.findApprovedBookings();
            return bookings.map(booking => this._formatResponse(booking));
        } catch (error) {
            throw this._handleError(error, 'getApprovedBookings');
        }
    }

    /**
     * Update booking status
     */
    async updateBookingStatus(bookingId, status) {
        try {
            this._validateBookingStatus(status);

            const booking = await this.getById(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }

            // Update booking status
            const updatedBooking = await this.bookingRepository.updateStatus(bookingId, status);

            // Handle bed occupancy based on status
            if (status === 'approved') {
                await this._handleBookingApproval(booking);
            } else if (status === 'rejected') {
                await this._handleBookingRejection(booking);
            }

            return this._formatResponse(updatedBooking);
        } catch (error) {
            throw this._handleError(error, 'updateBookingStatus');
        }
    }

    /**
     * Approve booking
     */
    async approveBooking(bookingId) {
        try {
            return await this.updateBookingStatus(bookingId, 'approved');
        } catch (error) {
            throw this._handleError(error, 'approveBooking');
        }
    }

    /**
     * Reject booking
     */
    async rejectBooking(bookingId) {
        try {
            return await this.updateBookingStatus(bookingId, 'rejected');
        } catch (error) {
            throw this._handleError(error, 'rejectBooking');
        }
    }

    /**
     * Delete booking
     */
    async deleteBooking(bookingId) {
        try {
            const booking = await this.getById(bookingId);
            if (!booking) {
                throw new Error('Booking not found');
            }

            // If booking was approved, vacate the bed
            if (booking.status === 'approved') {
                const bed = await this.bedService.getBedByRoomAndNumber(
                    booking.roomID, 
                    booking.bedNumber
                );
                await this.bedService.vacateBed(bed.id);
            }

            // Delete the booking
            await this.repository.deleteById(bookingId);

            return {
                success: true,
                message: 'Booking deleted successfully'
            };
        } catch (error) {
            throw this._handleError(error, 'deleteBooking');
        }
    }

    /**
     * Get bookings by date range
     */
    async getBookingsByDateRange(startDate, endDate) {
        try {
            const bookings = await this.bookingRepository.findByDateRange(startDate, endDate);
            return bookings.map(booking => this._formatResponse(booking));
        } catch (error) {
            throw this._handleError(error, 'getBookingsByDateRange');
        }
    }

    /**
     * Search bookings
     */
    async searchBookings(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new Error('Search term is required');
            }

            const bookings = await this.bookingRepository.searchBookings(searchTerm);
            return bookings.map(booking => this._formatResponse(booking));
        } catch (error) {
            throw this._handleError(error, 'searchBookings');
        }
    }

    /**
     * Get booking statistics
     */
    async getBookingStatistics() {
        try {
            return await this.bookingRepository.getBookingStatistics();
        } catch (error) {
            throw this._handleError(error, 'getBookingStatistics');
        }
    }

    /**
     * Get booking statistics by hostel
     */
    async getBookingStatisticsByHostel(hostelId) {
        try {
            this._validateId(hostelId);
            return await this.bookingRepository.getBookingStatisticsByHostel(hostelId);
        } catch (error) {
            throw this._handleError(error, 'getBookingStatisticsByHostel');
        }
    }

    /**
     * Handle booking approval
     */
    async _handleBookingApproval(booking) {
        try {
            // Find the bed and occupy it
            const bed = await this.bedService.getBedByRoomAndNumber(
                booking.roomID, 
                booking.bedNumber
            );

            await this.bedService.occupyBed(bed.id, {
                occupantName: booking.name,
                occupantPhone: booking.phone
            });

            // Update hostel vacancy (decrease by 1)
            await this.hostelService.updateVacancy(booking.hostelID, -1);
        } catch (error) {
            console.error('Error handling booking approval:', error);
            // Don't throw error here to avoid breaking the booking approval
        }
    }

    /**
     * Handle booking rejection
     */
    async _handleBookingRejection(booking) {
        try {
            // If the bed was previously occupied due to this booking, vacate it
            const bed = await this.bedService.getBedByRoomAndNumber(
                booking.roomID, 
                booking.bedNumber
            );

            if (bed.isOccupied && bed.occupantPhone === booking.phone) {
                await this.bedService.vacateBed(bed.id);
                // Update hostel vacancy (increase by 1)
                await this.hostelService.updateVacancy(booking.hostelID, 1);
            }
        } catch (error) {
            console.error('Error handling booking rejection:', error);
            // Don't throw error here to avoid breaking the booking rejection
        }
    }

    /**
     * Validate booking creation data
     */
    async _validateBookingCreation(data) {
        const { name, phone, roomID, hostelID, bedNumber } = data;

        if (!name || name.trim().length === 0) {
            throw new Error('Name is required');
        }

        if (!phone || phone.trim().length === 0) {
            throw new Error('Phone number is required');
        }

        if (!this._isValidPhone(phone)) {
            throw new Error('Invalid phone number format');
        }

        if (!roomID) {
            throw new Error('Room ID is required');
        }

        if (!hostelID) {
            throw new Error('Hostel ID is required');
        }

        if (!bedNumber || bedNumber.trim().length === 0) {
            throw new Error('Bed number is required');
        }
    }

    /**
     * Validate booking status
     */
    _validateBookingStatus(status) {
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid booking status. Must be one of: ' + validStatuses.join(', '));
        }
    }

    /**
     * Validate phone number
     */
    _isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
}

export default BookingService;
