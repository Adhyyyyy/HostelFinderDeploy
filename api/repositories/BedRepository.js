import BaseRepository from '../core/BaseRepository.js';
import Bed from '../models/Bed.js';

/**
 * Bed Repository
 * Handles all database operations for Bed entity
 */
class BedRepository extends BaseRepository {
    constructor() {
        super(Bed);
    }

    /**
     * Find beds by room ID
     */
    async findByRoomId(roomId) {
        try {
            return await this.findAll({ roomID: roomId }, { sort: { bedNumber: 1 } });
        } catch (error) {
            throw this._handleError(error, 'findByRoomId');
        }
    }

    /**
     * Find beds by hostel ID
     */
    async findByHostelId(hostelId) {
        try {
            return await this.findAll({ hostelID: hostelId }, { sort: { bedNumber: 1 } });
        } catch (error) {
            throw this._handleError(error, 'findByHostelId');
        }
    }

    /**
     * Find available beds in a room
     */
    async findAvailableBedsInRoom(roomId) {
        try {
            return await this.findAll({ 
                roomID: roomId, 
                isOccupied: false 
            });
        } catch (error) {
            throw this._handleError(error, 'findAvailableBedsInRoom');
        }
    }

    /**
     * Find occupied beds in a room
     */
    async findOccupiedBedsInRoom(roomId) {
        try {
            return await this.findAll({ 
                roomID: roomId, 
                isOccupied: true 
            });
        } catch (error) {
            throw this._handleError(error, 'findOccupiedBedsInRoom');
        }
    }

    /**
     * Find bed by room and bed number
     */
    async findByRoomAndBedNumber(roomId, bedNumber) {
        try {
            return await this.findOne({ 
                roomID: roomId, 
                bedNumber: bedNumber 
            });
        } catch (error) {
            throw this._handleError(error, 'findByRoomAndBedNumber');
        }
    }

    /**
     * Update bed occupancy status
     */
    async updateOccupancyStatus(bedId, isOccupied, occupantData = {}) {
        try {
            const updateData = { isOccupied };
            
            if (isOccupied) {
                updateData.occupantName = occupantData.occupantName || null;
                updateData.occupantPhone = occupantData.occupantPhone || null;
            } else {
                updateData.occupantName = null;
                updateData.occupantPhone = null;
            }

            return await this.updateById(bedId, updateData);
        } catch (error) {
            throw this._handleError(error, 'updateOccupancyStatus');
        }
    }

    /**
     * Bulk create beds for a room
     */
    async createBedsForRoom(roomId, hostelId, roomType) {
        try {
            // Define bed count based on room type
            const bedCount = {
                "Single": 1,
                "Double": 2,
                "Triple": 3,
                "Quad": 4,
                "Five": 5,
                "Six": 6
            }[roomType] || 0;

            const beds = [];
            for (let i = 0; i < bedCount; i++) {
                const bedData = {
                    bedNumber: `Bed ${i + 1}`,
                    isOccupied: false,
                    roomID: roomId,
                    hostelID: hostelId
                };
                beds.push(bedData);
            }

            // Use insertMany for bulk creation
            return await this.model.insertMany(beds);
        } catch (error) {
            throw this._handleError(error, 'createBedsForRoom');
        }
    }

    /**
     * Delete all beds for a room
     */
    async deleteBedsForRoom(roomId) {
        try {
            return await this.model.deleteMany({ roomID: roomId });
        } catch (error) {
            throw this._handleError(error, 'deleteBedsForRoom');
        }
    }

    /**
     * Get bed statistics for room
     */
    async getBedStatistics(roomId) {
        try {
            const totalBeds = await this.count({ roomID: roomId });
            const occupiedBeds = await this.count({ 
                roomID: roomId, 
                isOccupied: true 
            });
            const availableBeds = totalBeds - occupiedBeds;

            return {
                totalBeds,
                occupiedBeds,
                availableBeds,
                occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getBedStatistics');
        }
    }

    /**
     * Get bed statistics for hostel
     */
    async getHostelBedStatistics(hostelId) {
        try {
            const totalBeds = await this.count({ hostelID: hostelId });
            const occupiedBeds = await this.count({ 
                hostelID: hostelId, 
                isOccupied: true 
            });
            const availableBeds = totalBeds - occupiedBeds;

            return {
                totalBeds,
                occupiedBeds,
                availableBeds,
                occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getHostelBedStatistics');
        }
    }

    /**
     * Find beds by occupant information
     */
    async findByOccupant(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            return await this.findAll({
                isOccupied: true,
                $or: [
                    { occupantName: regex },
                    { occupantPhone: regex }
                ]
            });
        } catch (error) {
            throw this._handleError(error, 'findByOccupant');
        }
    }
}

export default BedRepository;
