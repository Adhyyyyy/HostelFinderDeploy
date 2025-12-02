import BaseService from '../core/BaseService.js';
import BedRepository from '../repositories/BedRepository.js';

/**
 * Bed Service
 * Handles bed business logic
 */
class BedService extends BaseService {
    constructor() {
        const bedRepository = new BedRepository();
        super(bedRepository);
        this.bedRepository = bedRepository;
    }

    /**
     * Create beds for a room
     */
    async createBedsForRoom(roomId, hostelId, roomType) {
        try {
            this._validateRoomBedCreation(roomId, hostelId, roomType);

            const beds = await this.bedRepository.createBedsForRoom(roomId, hostelId, roomType);
            return beds.map(bed => this._formatResponse(bed));
        } catch (error) {
            throw this._handleError(error, 'createBedsForRoom');
        }
    }

    /**
     * Get beds by room ID
     */
    async getBedsByRoomId(roomId) {
        try {
            this._validateId(roomId);
            const beds = await this.bedRepository.findByRoomId(roomId);
            return beds.map(bed => this._formatResponse(bed));
        } catch (error) {
            throw this._handleError(error, 'getBedsByRoomId');
        }
    }

    /**
     * Get beds by hostel ID
     */
    async getBedsByHostelId(hostelId) {
        try {
            this._validateId(hostelId);
            const beds = await this.bedRepository.findByHostelId(hostelId);
            return beds.map(bed => this._formatResponse(bed));
        } catch (error) {
            throw this._handleError(error, 'getBedsByHostelId');
        }
    }

    /**
     * Get available beds in room
     */
    async getAvailableBedsInRoom(roomId) {
        try {
            this._validateId(roomId);
            const beds = await this.bedRepository.findAvailableBedsInRoom(roomId);
            return beds.map(bed => this._formatResponse(bed));
        } catch (error) {
            throw this._handleError(error, 'getAvailableBedsInRoom');
        }
    }

    /**
     * Get occupied beds in room
     */
    async getOccupiedBedsInRoom(roomId) {
        try {
            this._validateId(roomId);
            const beds = await this.bedRepository.findOccupiedBedsInRoom(roomId);
            return beds.map(bed => this._formatResponse(bed));
        } catch (error) {
            throw this._handleError(error, 'getOccupiedBedsInRoom');
        }
    }

    /**
     * Update bed occupancy status
     */
    async updateBedStatus(bedId, statusData) {
        try {
            this._validateId(bedId);
            this._validateBedStatusData(statusData);

            const { isOccupied, occupantName, occupantPhone } = statusData;
            
            const bed = await this.bedRepository.updateOccupancyStatus(
                bedId, 
                isOccupied, 
                { occupantName, occupantPhone }
            );

            if (!bed) {
                throw new Error('Bed not found');
            }

            return this._formatResponse(bed);
        } catch (error) {
            throw this._handleError(error, 'updateBedStatus');
        }
    }

    /**
     * Occupy bed
     */
    async occupyBed(bedId, occupantData) {
        try {
            this._validateOccupantData(occupantData);

            const statusData = {
                isOccupied: true,
                occupantName: occupantData.occupantName,
                occupantPhone: occupantData.occupantPhone
            };

            return await this.updateBedStatus(bedId, statusData);
        } catch (error) {
            throw this._handleError(error, 'occupyBed');
        }
    }

    /**
     * Vacate bed
     */
    async vacateBed(bedId) {
        try {
            const statusData = {
                isOccupied: false,
                occupantName: null,
                occupantPhone: null
            };

            return await this.updateBedStatus(bedId, statusData);
        } catch (error) {
            throw this._handleError(error, 'vacateBed');
        }
    }

    /**
     * Find bed by room and bed number
     */
    async getBedByRoomAndNumber(roomId, bedNumber) {
        try {
            this._validateId(roomId);
            if (!bedNumber) {
                throw new Error('Bed number is required');
            }

            const bed = await this.bedRepository.findByRoomAndBedNumber(roomId, bedNumber);
            if (!bed) {
                throw new Error('Bed not found');
            }

            return this._formatResponse(bed);
        } catch (error) {
            throw this._handleError(error, 'getBedByRoomAndNumber');
        }
    }

    /**
     * Delete all beds for a room
     */
    async deleteBedsForRoom(roomId) {
        try {
            this._validateId(roomId);
            const result = await this.bedRepository.deleteBedsForRoom(roomId);
            return {
                success: true,
                message: `Deleted ${result.deletedCount} beds for room`,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            throw this._handleError(error, 'deleteBedsForRoom');
        }
    }

    /**
     * Get bed statistics for room
     */
    async getBedStatisticsForRoom(roomId) {
        try {
            this._validateId(roomId);
            return await this.bedRepository.getBedStatistics(roomId);
        } catch (error) {
            throw this._handleError(error, 'getBedStatisticsForRoom');
        }
    }

    /**
     * Get bed statistics for hostel
     */
    async getBedStatisticsForHostel(hostelId) {
        try {
            this._validateId(hostelId);
            return await this.bedRepository.getHostelBedStatistics(hostelId);
        } catch (error) {
            throw this._handleError(error, 'getBedStatisticsForHostel');
        }
    }

    /**
     * Search beds by occupant information
     */
    async searchBedsByOccupant(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new Error('Search term is required');
            }

            const beds = await this.bedRepository.findByOccupant(searchTerm);
            return beds.map(bed => this._formatResponse(bed));
        } catch (error) {
            throw this._handleError(error, 'searchBedsByOccupant');
        }
    }

    /**
     * Get all bed statistics
     */
    async getAllBedStatistics() {
        try {
            const totalBeds = await this.repository.count();
            const occupiedBeds = await this.repository.count({ isOccupied: true });
            const availableBeds = totalBeds - occupiedBeds;

            // Get bed distribution by room type (would need room data)
            const bedsByHostel = await this.repository.model.aggregate([
                { $group: { _id: "$hostelID", count: { $sum: 1 } } }
            ]);

            return {
                totalBeds,
                occupiedBeds,
                availableBeds,
                occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
                bedsByHostel: bedsByHostel.map(item => ({
                    hostelId: item._id,
                    count: item.count
                }))
            };
        } catch (error) {
            throw this._handleError(error, 'getAllBedStatistics');
        }
    }

    /**
     * Validate room bed creation data
     */
    _validateRoomBedCreation(roomId, hostelId, roomType) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        if (!hostelId) {
            throw new Error('Hostel ID is required');
        }

        if (!roomType) {
            throw new Error('Room type is required');
        }

        const validRoomTypes = ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six'];
        if (!validRoomTypes.includes(roomType)) {
            throw new Error('Invalid room type');
        }
    }

    /**
     * Validate bed status data
     */
    _validateBedStatusData(statusData) {
        const { isOccupied, occupantName, occupantPhone } = statusData;

        if (typeof isOccupied !== 'boolean') {
            throw new Error('isOccupied must be a boolean value');
        }

        if (isOccupied) {
            if (!occupantName || occupantName.trim().length === 0) {
                throw new Error('Occupant name is required when bed is occupied');
            }

            if (!occupantPhone || occupantPhone.trim().length === 0) {
                throw new Error('Occupant phone is required when bed is occupied');
            }

            if (!this._isValidPhone(occupantPhone)) {
                throw new Error('Invalid occupant phone number');
            }
        }
    }

    /**
     * Validate occupant data
     */
    _validateOccupantData(occupantData) {
        const { occupantName, occupantPhone } = occupantData;

        if (!occupantName || occupantName.trim().length === 0) {
            throw new Error('Occupant name is required');
        }

        if (!occupantPhone || occupantPhone.trim().length === 0) {
            throw new Error('Occupant phone is required');
        }

        if (!this._isValidPhone(occupantPhone)) {
            throw new Error('Invalid occupant phone number');
        }
    }

    /**
     * Validate phone number
     */
    _isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Format bed response - convert Mongoose document to plain object
     */
    _formatResponse(bed) {
        if (!bed) return null;
        
        // Convert Mongoose document to plain object if needed
        const bedObj = bed.toObject ? bed.toObject() : bed;
        
        // Ensure all fields are accessible at the top level
        return {
            ...bedObj,
            id: bedObj._id || bedObj.id,
            bedNumber: bedObj.bedNumber || bedObj._doc?.bedNumber,
            isOccupied: bedObj.isOccupied || false,
            occupantName: bedObj.occupantName || null,
            occupantPhone: bedObj.occupantPhone || null,
            roomID: bedObj.roomID || bedObj.roomId,
            hostelID: bedObj.hostelID || bedObj.hostelId
        };
    }
}

export default BedService;
