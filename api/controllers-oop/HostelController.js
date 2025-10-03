import BaseController from '../core/BaseController.js';
import HostelService from '../services/HostelService.js';

/**
 * Hostel Controller
 * Handles hostel HTTP requests
 */
class HostelController extends BaseController {
    constructor() {
        const hostelService = new HostelService();
        super(hostelService);
        this.hostelService = hostelService;
    }

    /**
     * Create a new hostel
     */
    async create(req, res, next) {
        try {
            const requiredFields = [
                'name', 'category', 'genderType', 'distanceFromCollege',
                'address', 'vacancy', 'capacity', 'contact', 'ownerName', 'ownerContact'
            ];
            this.validateBody(req, requiredFields);

            const result = await this.hostelService.create(req.body);
            this.sendResponse(res, 201, result, 'Hostel created successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostel by ID
     */
    async getById(req, res, next) {
        try {
            // Basic validation - check if ID exists
            if (!req.params.id) {
                return res.status(400).json({ error: 'Hostel ID is required' });
            }

            const result = await this.hostelService.getById(req.params.id);
            
            // Handle case where hostel is not found
            if (!result) {
                return res.status(404).json({ error: 'Hostel not found' });
            }
            
            // Return same format as old API for frontend compatibility
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in HostelController.getById:', error);
            
            // Handle specific validation errors
            if (error.message === 'Invalid ID format' || error.message === 'Valid ID is required') {
                return res.status(400).json({ error: error.message });
            }
            
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: 'Hostel not found' });
            }
            
            this.handleError(error, next);
        }
    }

    /**
     * Get all hostels with filtering
     */
    async getAll(req, res, next) {
        try {
            const { 
                name, category, genderType, messType, pricing, 
                limit, skip, sort, minVacancy, maxDistance,
                ...otherFilters 
            } = req.query;

            // Build search criteria
            const searchCriteria = {
                ...otherFilters,
                limit: limit ? parseInt(limit) : 10,
                sort: sort ? JSON.parse(sort) : { distanceFromCollege: 1 }
            };

            if (name) searchCriteria.name = name;
            if (category) searchCriteria.category = category;
            if (genderType) searchCriteria.genderType = genderType;
            if (messType !== undefined) searchCriteria.messType = messType === 'true';
            if (pricing) searchCriteria.pricing = pricing;
            if (minVacancy) searchCriteria.minVacancy = parseInt(minVacancy);
            if (maxDistance) searchCriteria.maxDistance = parseFloat(maxDistance);

            const results = await this.hostelService.searchHostels(searchCriteria);
            // Return raw data for frontend compatibility
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update hostel by ID
     */
    async updateById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.hostelService.updateById(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'Hostel updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete hostel by ID
     */
    async deleteById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.hostelService.deleteById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostels by gender type
     */
    async getHostelsByGender(req, res, next) {
        try {
            this.validateParams(req, ['genderType']);

            const results = await this.hostelService.getHostelsByGender(req.params.genderType);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostels by category
     */
    async getHostelsByCategory(req, res, next) {
        try {
            this.validateParams(req, ['category']);

            const results = await this.hostelService.getHostelsByCategory(req.params.category);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Count hostels by gender
     */
    async countByGender(req, res, next) {
        try {
            const { gender } = req.query;
            
            if (!gender) {
                return this.sendError(res, 400, 'Gender parameter is required');
            }

            const results = await this.hostelService.countHostelsByGender(gender);
            // Return raw data for frontend compatibility
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Count hostels by category
     */
    async countByCategory(req, res, next) {
        try {
            const results = await this.hostelService.countHostelsByCategory();
            // Return raw data for frontend compatibility
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get available hostels
     */
    async getAvailableHostels(req, res, next) {
        try {
            const { minVacancy = 1 } = req.query;
            
            const results = await this.hostelService.getAvailableHostels(parseInt(minVacancy));
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search hostels
     */
    async searchHostels(req, res, next) {
        try {
            const searchCriteria = { ...req.query };
            
            // Convert string parameters to appropriate types
            if (searchCriteria.limit) searchCriteria.limit = parseInt(searchCriteria.limit);
            if (searchCriteria.maxDistance) searchCriteria.maxDistance = parseFloat(searchCriteria.maxDistance);
            if (searchCriteria.minVacancy) searchCriteria.minVacancy = parseInt(searchCriteria.minVacancy);
            if (searchCriteria.messType) searchCriteria.messType = searchCriteria.messType === 'true';

            const results = await this.hostelService.searchHostels(searchCriteria);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostels within distance
     */
    async getHostelsWithinDistance(req, res, next) {
        try {
            const { maxDistance } = req.query;
            
            if (!maxDistance) {
                return this.sendError(res, 400, 'maxDistance parameter is required');
            }

            const results = await this.hostelService.getHostelsWithinDistance(parseFloat(maxDistance));
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostels by location
     */
    async getHostelsByLocation(req, res, next) {
        try {
            const { lat, lng, maxDistance = 5000 } = req.query;
            
            if (!lat || !lng) {
                return this.sendError(res, 400, 'Latitude and longitude are required');
            }

            const results = await this.hostelService.getHostelsByLocation(
                parseFloat(lat), 
                parseFloat(lng), 
                parseFloat(maxDistance)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update hostel vacancy
     */
    async updateVacancy(req, res, next) {
        try {
            this.validateParams(req, ['id']);
            this.validateBody(req, ['vacancyChange']);

            const { vacancyChange } = req.body;
            const result = await this.hostelService.updateVacancy(req.params.id, vacancyChange);
            
            this.sendResponse(res, 200, result, 'Vacancy updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostel statistics
     */
    async getHostelStatistics(req, res, next) {
        try {
            const stats = await this.hostelService.getHostelStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get hostel details with additional information
     */
    async getHostelDetails(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.hostelService.getHostelDetails(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get featured hostels (top-rated or recommended)
     */
    async getFeaturedHostels(req, res, next) {
        try {
            const { limit = 5 } = req.query;
            
            // For now, get available hostels sorted by capacity (most popular)
            const searchCriteria = {
                minVacancy: 1,
                limit: parseInt(limit),
                sort: { capacity: -1, distanceFromCollege: 1 }
            };

            const results = await this.hostelService.searchHostels(searchCriteria);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default HostelController;
