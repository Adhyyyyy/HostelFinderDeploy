import BaseController from '../core/BaseController.js';
import RoomService from '../services/RoomService.js';

/**
 * Room Controller
 * Handles room HTTP requests
 */
class RoomController extends BaseController {
    constructor() {
        const roomService = new RoomService();
        super(roomService);
        this.roomService = roomService;
    }

    /**
     * Create a new room with beds
     */
    async create(req, res, next) {
        try {
            this.validateParams(req, ['hostelid']);
            this.validateBody(req, ['roomNumber', 'roomType', 'price']);

            const result = await this.roomService.createRoomWithBeds(req.params.hostelid, req.body);
            this.sendResponse(res, 201, result, 'Room created successfully with beds');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get room by ID with beds
     */
    async getById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.roomService.getRoomWithBeds(req.params.id);
            // Return same format as old API for frontend compatibility
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all rooms with optional filtering
     */
    async getAll(req, res, next) {
        try {
            const { roomType, maxPrice, minPrice, isAvailable, ...otherFilters } = req.query;
            
            const filters = {
                ...otherFilters,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                sort: req.query.sort ? JSON.parse(req.query.sort) : { price: 1 }
            };

            if (roomType) filters.roomType = roomType;
            if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
            if (minPrice) filters.minPrice = parseFloat(minPrice);
            if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

            const results = await this.roomService.searchRooms(filters);
            // Return raw data for frontend compatibility
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update room by ID
     */
    async updateById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.roomService.updateById(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'Room updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete room by ID with beds
     */
    async deleteById(req, res, next) {
        try {
            this.validateParams(req, ['id', 'hostelid']);

            const result = await this.roomService.deleteRoomWithBeds(req.params.id, req.params.hostelid);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get rooms by hostel ID
     */
    async getRoomsByHostel(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const { roomType, ...otherFilters } = req.query;
            const filters = { ...otherFilters };
            
            if (roomType) filters.roomType = roomType;

            const results = await this.roomService.getRoomsByHostelId(req.params.hostelId, filters);
            // Return same format as old API for frontend compatibility
            res.status(200).json({ success: true, rooms: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get available rooms
     */
    async getAvailableRooms(req, res, next) {
        try {
            const { hostelId } = req.query;
            
            const results = await this.roomService.getAvailableRooms(hostelId || null);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get rooms by price range
     */
    async getRoomsByPriceRange(req, res, next) {
        try {
            const { minPrice = 0, maxPrice = Number.MAX_VALUE } = req.query;
            
            const results = await this.roomService.getRoomsByPriceRange(
                parseFloat(minPrice), 
                parseFloat(maxPrice)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update room availability status
     */
    async updateRoomStatus(req, res, next) {
        try {
            this.validateParams(req, ['id']);
            this.validateBody(req, ['isAvailable']);

            const { isAvailable } = req.body;
            const result = await this.roomService.updateRoomAvailability(req.params.id, isAvailable);
            
            this.sendResponse(res, 200, result, 'Room status updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update bed status in room
     */
    async updateBedStatus(req, res, next) {
        try {
            this.validateParams(req, ['roomId', 'bedIndex']);
            this.validateBody(req, ['isOccupied']);

            const { roomId, bedIndex } = req.params;
            const { isOccupied, occupantName, occupantPhone } = req.body;

            // For compatibility with old API, we need to find the bed by index
            // In the new system, we'll use bed ID instead
            const roomWithBeds = await this.roomService.getRoomWithBeds(roomId);
            
            if (!roomWithBeds.beds || !roomWithBeds.beds[bedIndex]) {
                return this.sendError(res, 404, 'Bed not found');
            }

            const bedId = roomWithBeds.beds[bedIndex].id || roomWithBeds.beds[bedIndex]._id;
            const bedData = { isOccupied, occupantName, occupantPhone };

            const result = await this.roomService.updateBedStatus(roomId, bedId, bedData);
            this.sendResponse(res, 200, result, 'Bed status updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get room statistics for hostel
     */
    async getRoomStatistics(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const stats = await this.roomService.getRoomStatistics(req.params.hostelId);
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all room statistics
     */
    async getAllRoomStatistics(req, res, next) {
        try {
            const stats = await this.roomService.getAllRoomStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search rooms with advanced filters
     */
    async searchRooms(req, res, next) {
        try {
            const filters = { ...req.query };
            
            // Convert string parameters to appropriate types
            if (filters.limit) filters.limit = parseInt(filters.limit);
            if (filters.maxPrice) filters.maxPrice = parseFloat(filters.maxPrice);
            if (filters.minPrice) filters.minPrice = parseFloat(filters.minPrice);
            if (filters.isAvailable) filters.isAvailable = filters.isAvailable === 'true';

            const results = await this.roomService.searchRooms(filters);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get room types available in hostel
     */
    async getRoomTypes(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const rooms = await this.roomService.getRoomsByHostelId(req.params.hostelId);
            const roomTypes = [...new Set(rooms.map(room => room.roomType))];
            
            this.sendResponse(res, 200, roomTypes);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get room occupancy status
     */
    async getRoomOccupancy(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const roomWithBeds = await this.roomService.getRoomWithBeds(req.params.id);
            
            const totalBeds = roomWithBeds.beds ? roomWithBeds.beds.length : 0;
            const occupiedBeds = roomWithBeds.beds ? 
                roomWithBeds.beds.filter(bed => bed.isOccupied).length : 0;
            const availableBeds = totalBeds - occupiedBeds;

            const occupancyData = {
                roomId: roomWithBeds.id || roomWithBeds._id,
                roomNumber: roomWithBeds.roomNumber,
                roomType: roomWithBeds.roomType,
                totalBeds,
                occupiedBeds,
                availableBeds,
                occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
                isAvailable: roomWithBeds.isAvailable,
                beds: roomWithBeds.beds
            };

            this.sendResponse(res, 200, occupancyData);
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default RoomController;
