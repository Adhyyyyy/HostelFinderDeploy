import BaseController from '../core/BaseController.js';
import BedService from '../services/BedService.js';

/**
 * Bed Controller
 * Handles bed HTTP requests
 */
class BedController extends BaseController {
    constructor() {
        const bedService = new BedService();
        super(bedService);
        this.bedService = bedService;
    }

    /**
     * Get beds by room ID
     */
    async getBedsByRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);

            const results = await this.bedService.getBedsByRoomId(req.params.roomId);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get beds by hostel ID
     */
    async getBedsByHostel(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const results = await this.bedService.getBedsByHostelId(req.params.hostelId);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get available beds in room
     */
    async getAvailableBedsInRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);

            const results = await this.bedService.getAvailableBedsInRoom(req.params.roomId);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get occupied beds in room
     */
    async getOccupiedBedsInRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);

            const results = await this.bedService.getOccupiedBedsInRoom(req.params.roomId);
            this.sendResponse(res, 200, { success: true, data: results });
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update bed status
     */
    async updateBedStatus(req, res, next) {
        try {
            this.validateParams(req, ['roomId', 'bedId']);
            this.validateBody(req, ['isOccupied']);

            const { bedId } = req.params;
            const { isOccupied, occupantName, occupantPhone } = req.body;

            const statusData = { isOccupied, occupantName, occupantPhone };
            const result = await this.bedService.updateBedStatus(bedId, statusData);

            // Get updated room with all beds for response
            const roomWithBeds = await this.bedService.getBedsByRoomId(req.params.roomId);
            
            this.sendResponse(res, 200, { 
                success: true, 
                data: { 
                    updatedBed: result,
                    allBeds: roomWithBeds
                }
            }, 'Bed status updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Occupy bed
     */
    async occupyBed(req, res, next) {
        try {
            this.validateParams(req, ['bedId']);
            this.validateBody(req, ['occupantName', 'occupantPhone']);

            const { occupantName, occupantPhone } = req.body;
            const result = await this.bedService.occupyBed(req.params.bedId, {
                occupantName,
                occupantPhone
            });

            this.sendResponse(res, 200, result, 'Bed occupied successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Vacate bed
     */
    async vacateBed(req, res, next) {
        try {
            this.validateParams(req, ['bedId']);

            const result = await this.bedService.vacateBed(req.params.bedId);
            this.sendResponse(res, 200, result, 'Bed vacated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bed by room and bed number
     */
    async getBedByRoomAndNumber(req, res, next) {
        try {
            this.validateParams(req, ['roomId', 'bedNumber']);

            const result = await this.bedService.getBedByRoomAndNumber(
                req.params.roomId, 
                req.params.bedNumber
            );
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bed statistics for room
     */
    async getBedStatisticsForRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);

            const stats = await this.bedService.getBedStatisticsForRoom(req.params.roomId);
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bed statistics for hostel
     */
    async getBedStatisticsForHostel(req, res, next) {
        try {
            this.validateParams(req, ['hostelId']);

            const stats = await this.bedService.getBedStatisticsForHostel(req.params.hostelId);
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all bed statistics
     */
    async getAllBedStatistics(req, res, next) {
        try {
            const stats = await this.bedService.getAllBedStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search beds by occupant
     */
    async searchBedsByOccupant(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm) {
                return this.sendError(res, 400, 'Search term is required');
            }

            const results = await this.bedService.searchBedsByOccupant(searchTerm);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Create beds for room (admin function)
     */
    async createBedsForRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);
            this.validateBody(req, ['hostelId', 'roomType']);

            const { roomId } = req.params;
            const { hostelId, roomType } = req.body;

            const results = await this.bedService.createBedsForRoom(roomId, hostelId, roomType);
            this.sendResponse(res, 201, results, 'Beds created successfully for room');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete all beds for room (admin function)
     */
    async deleteBedsForRoom(req, res, next) {
        try {
            this.validateParams(req, ['roomId']);

            const result = await this.bedService.deleteBedsForRoom(req.params.roomId);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get bed occupancy report
     */
    async getBedOccupancyReport(req, res, next) {
        try {
            const { hostelId, roomId } = req.query;
            
            let stats;
            if (roomId) {
                stats = await this.bedService.getBedStatisticsForRoom(roomId);
                stats.scope = 'room';
                stats.roomId = roomId;
            } else if (hostelId) {
                stats = await this.bedService.getBedStatisticsForHostel(hostelId);
                stats.scope = 'hostel';
                stats.hostelId = hostelId;
            } else {
                stats = await this.bedService.getAllBedStatistics();
                stats.scope = 'all';
            }

            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Bulk update bed status (admin function)
     */
    async bulkUpdateBedStatus(req, res, next) {
        try {
            this.validateBody(req, ['bedUpdates']);

            const { bedUpdates } = req.body;
            
            if (!Array.isArray(bedUpdates) || bedUpdates.length === 0) {
                return this.sendError(res, 400, 'bedUpdates must be a non-empty array');
            }

            const results = [];
            const errors = [];

            for (const update of bedUpdates) {
                try {
                    const { bedId, ...statusData } = update;
                    const result = await this.bedService.updateBedStatus(bedId, statusData);
                    results.push({ bedId, success: true, data: result });
                } catch (error) {
                    errors.push({ bedId: update.bedId, success: false, error: error.message });
                }
            }

            const response = {
                totalUpdates: bedUpdates.length,
                successful: results.length,
                failed: errors.length,
                results,
                errors
            };

            this.sendResponse(res, 200, response, 'Bulk bed status update completed');
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default BedController;
