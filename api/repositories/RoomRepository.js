import BaseRepository from '../core/BaseRepository.js';
import Room from '../models/Room.js';

/**
 * Room Repository
 * Handles all database operations for Room entity
 */
class RoomRepository extends BaseRepository {
    constructor() {
        super(Room);
    }

    /**
     * Find rooms by hostel ID
     */
    async findByHostelId(hostelId, options = {}) {
        try {
            return await this.findAll({ hostelID: hostelId }, options);
        } catch (error) {
            throw this._handleError(error, 'findByHostelId');
        }
    }

    /**
     * Find rooms by room type
     */
    async findByRoomType(roomType, options = {}) {
        try {
            return await this.findAll({ roomType }, options);
        } catch (error) {
            throw this._handleError(error, 'findByRoomType');
        }
    }

    /**
     * Find available rooms
     */
    async findAvailableRooms(hostelId = null) {
        try {
            const filter = { isAvailable: true };
            if (hostelId) {
                filter.hostelID = hostelId;
            }
            return await this.findAll(filter);
        } catch (error) {
            throw this._handleError(error, 'findAvailableRooms');
        }
    }

    /**
     * Find rooms by price range
     */
    async findByPriceRange(minPrice = 0, maxPrice = Number.MAX_VALUE) {
        try {
            return await this.findAll({
                price: { $gte: minPrice, $lte: maxPrice }
            });
        } catch (error) {
            throw this._handleError(error, 'findByPriceRange');
        }
    }

    /**
     * Check if room number exists in hostel
     */
    async roomNumberExists(hostelId, roomNumber, excludeId = null) {
        try {
            const filter = { 
                hostelID: hostelId, 
                roomNumber: roomNumber 
            };
            if (excludeId) {
                filter._id = { $ne: excludeId };
            }
            return await this.exists(filter);
        } catch (error) {
            throw this._handleError(error, 'roomNumberExists');
        }
    }

    /**
     * Find rooms with filters
     */
    async findWithFilters(filters = {}) {
        try {
            const query = {};

            if (filters.hostelId) {
                query.hostelID = filters.hostelId;
            }
            if (filters.roomType) {
                query.roomType = { $regex: new RegExp(`^${filters.roomType}$`, "i") };
            }
            if (filters.maxPrice) {
                query.price = { $lte: Number(filters.maxPrice) };
            }
            if (filters.minPrice) {
                query.price = { ...query.price, $gte: Number(filters.minPrice) };
            }
            if (filters.isAvailable !== undefined) {
                query.isAvailable = filters.isAvailable;
            }

            const options = {
                limit: filters.limit ? parseInt(filters.limit) : undefined,
                sort: filters.sort || { price: 1 }
            };

            return await this.findAll(query, options);
        } catch (error) {
            throw this._handleError(error, 'findWithFilters');
        }
    }

    /**
     * Update room availability status
     */
    async updateAvailability(roomId, isAvailable) {
        try {
            const updateData = { isAvailable };
            // Reset occupied beds when marking as available
            if (isAvailable) {
                updateData.occupiedBeds = 0;
            }
            
            return await this.updateById(roomId, updateData);
        } catch (error) {
            throw this._handleError(error, 'updateAvailability');
        }
    }

    /**
     * Get room statistics for hostel
     */
    async getRoomStatistics(hostelId) {
        try {
            const totalRooms = await this.count({ hostelID: hostelId });
            const availableRooms = await this.count({ 
                hostelID: hostelId, 
                isAvailable: true 
            });
            const occupiedRooms = totalRooms - availableRooms;

            // Get room type distribution
            const roomTypes = await this.model.aggregate([
                { $match: { hostelID: hostelId } },
                { $group: { _id: "$roomType", count: { $sum: 1 } } }
            ]);

            return {
                totalRooms,
                availableRooms,
                occupiedRooms,
                roomTypes: roomTypes.map(rt => ({ type: rt._id, count: rt.count }))
            };
        } catch (error) {
            throw this._handleError(error, 'getRoomStatistics');
        }
    }

    /**
     * Find rooms with bed information
     */
    async findWithBeds(roomId) {
        try {
            return await this.model.findById(roomId).populate('beds');
        } catch (error) {
            throw this._handleError(error, 'findWithBeds');
        }
    }
}

export default RoomRepository;
