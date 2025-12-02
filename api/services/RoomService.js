import BaseService from '../core/BaseService.js';
import RoomRepository from '../repositories/RoomRepository.js';
import BedService from './BedService.js';
import BookingRepository from '../repositories/BookingRepository.js';
import HostelService from './HostelService.js';

/**
 * Room Service
 * Handles room business logic
 */
class RoomService extends BaseService {
    constructor() {
        const roomRepository = new RoomRepository();
        super(roomRepository);
        this.roomRepository = roomRepository;
        this.bedService = new BedService();
        this.bookingRepository = new BookingRepository();
        this.hostelService = new HostelService();
    }

    /**
     * Create a new room with beds
     */
    async createRoomWithBeds(hostelId, roomData) {
        try {
            // Validate hostel exists
            await this.hostelService.getById(hostelId);

            // Validate room data
            await this._validateRoomCreation(roomData, hostelId);

            // Check for duplicate room number in hostel
            const roomExists = await this.roomRepository.roomNumberExists(
                hostelId, 
                roomData.roomNumber
            );
            if (roomExists) {
                throw new Error(`Room number ${roomData.roomNumber} already exists in this hostel`);
            }

            // Create room
            const roomCreateData = {
                ...roomData,
                hostelID: hostelId,
                isAvailable: roomData.isAvailable ?? true
            };

            const room = await this.repository.create(roomCreateData);

            // Create beds for the room
            const beds = await this.bedService.createBedsForRoom(
                room._id, 
                hostelId, 
                roomData.roomType
            );

            // Return room with beds
            const roomResponse = this._formatResponse(room);
            roomResponse.beds = beds;

            return roomResponse;
        } catch (error) {
            throw this._handleError(error, 'createRoomWithBeds');
        }
    }

    /**
     * Get room with beds
     */
    async getRoomWithBeds(roomId) {
        try {
            const room = await this.getById(roomId);
            const beds = await this.bedService.getBedsByRoomId(roomId);

            // For each bed, check if there's any non-rejected booking (pending/approved)
            // and mark the bed as reserved if so. This keeps the frontend in sync
            // with booking state (beds with pending bookings should appear unavailable).
            const bedsWithReservation = await Promise.all(
                beds.map(async (bed) => {
                    try {
                        // Ensure bed is a plain object with bedNumber accessible
                        const bedObj = bed && typeof bed === 'object' ? bed : {};
                        const bedNumber = bedObj.bedNumber || bedObj._doc?.bedNumber;
                        
                        if (!bedNumber) {
                            console.error('Bed missing bedNumber:', bedObj);
                            return { ...bedObj, reserved: false };
                        }
                        
                        const hasBooking = await this.bookingRepository.isBedBooked(roomId, bedNumber);
                        return { ...bedObj, reserved: !!hasBooking };
                    } catch (err) {
                        // On error, default to not reserved to avoid blocking UI completely
                        const bedObj = bed && typeof bed === 'object' ? bed : {};
                        console.error('Error checking booking for bed', bedObj.bedNumber || bedObj._doc?.bedNumber, err);
                        return { ...bedObj, reserved: false };
                    }
                })
            );

            const roomResponse = { ...room };
            roomResponse.beds = bedsWithReservation;

            return roomResponse;
        } catch (error) {
            throw this._handleError(error, 'getRoomWithBeds');
        }
    }

    /**
     * Get rooms by hostel ID
     */
    async getRoomsByHostelId(hostelId, filters = {}) {
        try {
            const searchFilters = { ...filters, hostelId };
            const rooms = await this.roomRepository.findWithFilters(searchFilters);
            return rooms.map(room => this._formatResponse(room));
        } catch (error) {
            throw this._handleError(error, 'getRoomsByHostelId');
        }
    }

    /**
     * Get available rooms
     */
    async getAvailableRooms(hostelId = null) {
        try {
            const rooms = await this.roomRepository.findAvailableRooms(hostelId);
            return rooms.map(room => this._formatResponse(room));
        } catch (error) {
            throw this._handleError(error, 'getAvailableRooms');
        }
    }

    /**
     * Get rooms by price range
     */
    async getRoomsByPriceRange(minPrice = 0, maxPrice = Number.MAX_VALUE) {
        try {
            const rooms = await this.roomRepository.findByPriceRange(minPrice, maxPrice);
            return rooms.map(room => this._formatResponse(room));
        } catch (error) {
            throw this._handleError(error, 'getRoomsByPriceRange');
        }
    }

    /**
     * Search rooms with filters
     */
    async searchRooms(filters) {
        try {
            const rooms = await this.roomRepository.findWithFilters(filters);
            return rooms.map(room => this._formatResponse(room));
        } catch (error) {
            throw this._handleError(error, 'searchRooms');
        }
    }

    /**
     * Update room availability
     */
    async updateRoomAvailability(roomId, isAvailable) {
        try {
            const room = await this.roomRepository.updateAvailability(roomId, isAvailable);
            if (!room) {
                throw new Error('Room not found');
            }
            return this._formatResponse(room);
        } catch (error) {
            throw this._handleError(error, 'updateRoomAvailability');
        }
    }

    /**
     * Delete room and its beds
     */
    async deleteRoomWithBeds(roomId, hostelId) {
        try {
            // Delete all beds for the room
            await this.bedService.deleteBedsForRoom(roomId);

            // Delete the room
            const result = await this.deleteById(roomId);

            return {
                success: true,
                message: 'Room and associated beds deleted successfully'
            };
        } catch (error) {
            throw this._handleError(error, 'deleteRoomWithBeds');
        }
    }

    /**
     * Get room statistics for hostel
     */
    async getRoomStatistics(hostelId) {
        try {
            return await this.roomRepository.getRoomStatistics(hostelId);
        } catch (error) {
            throw this._handleError(error, 'getRoomStatistics');
        }
    }

    /**
     * Get all room statistics
     */
    async getAllRoomStatistics() {
        try {
            const totalRooms = await this.repository.count();
            const availableRooms = await this.repository.count({ isAvailable: true });
            const occupiedRooms = totalRooms - availableRooms;

            // Get room type distribution
            const roomTypeStats = await this.repository.model.aggregate([
                { $group: { _id: "$roomType", count: { $sum: 1 } } }
            ]);

            // Get price statistics
            const priceStats = await this.repository.model.aggregate([
                { 
                    $group: { 
                        _id: null, 
                        avgPrice: { $avg: "$price" },
                        minPrice: { $min: "$price" },
                        maxPrice: { $max: "$price" }
                    } 
                }
            ]);

            return {
                totalRooms,
                availableRooms,
                occupiedRooms,
                occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
                roomTypes: roomTypeStats.map(rt => ({ type: rt._id, count: rt.count })),
                priceStats: priceStats.length > 0 ? priceStats[0] : null
            };
        } catch (error) {
            throw this._handleError(error, 'getAllRoomStatistics');
        }
    }

    /**
     * Update bed status in room
     */
    async updateBedStatus(roomId, bedId, bedData) {
        try {
            // Validate room exists
            await this.getById(roomId);

            // Update bed status
            const updatedBed = await this.bedService.updateBedStatus(bedId, bedData);

            // Get updated room with beds
            return await this.getRoomWithBeds(roomId);
        } catch (error) {
            throw this._handleError(error, 'updateBedStatus');
        }
    }

    /**
     * Validate room creation data
     */
    async _validateRoomCreation(roomData, hostelId) {
        const { roomNumber, roomType, price } = roomData;

        if (!roomNumber || roomNumber.trim().length === 0) {
            throw new Error('Room number is required');
        }

        if (!roomType) {
            throw new Error('Room type is required');
        }

        // Validate room type
        const validRoomTypes = ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'];
        if (!validRoomTypes.includes(roomType)) {
            throw new Error('Invalid room type. Must be one of: ' + validRoomTypes.join(', '));
        }

        if (price === undefined || price === null) {
            throw new Error('Room price is required');
        }

        if (price < 0) {
            throw new Error('Room price cannot be negative');
        }

        if (!hostelId) {
            throw new Error('Hostel ID is required');
        }
    }

    /**
     * Validate room update data
     */
    async _validateUpdate(data) {
        if (data.roomNumber && data.roomNumber.trim().length === 0) {
            throw new Error('Room number cannot be empty');
        }

        if (data.roomType) {
            const validRoomTypes = ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'];
            if (!validRoomTypes.includes(data.roomType)) {
                throw new Error('Invalid room type. Must be one of: ' + validRoomTypes.join(', '));
            }
        }

        if (data.price !== undefined && data.price < 0) {
            throw new Error('Room price cannot be negative');
        }
    }
}

export default RoomService;
