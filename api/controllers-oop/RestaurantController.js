import BaseController from '../core/BaseController.js';
import RestaurantService from '../services/RestaurantService.js';

/**
 * Restaurant Controller
 * Handles restaurant HTTP requests
 */
class RestaurantController extends BaseController {
    constructor() {
        const restaurantService = new RestaurantService();
        super(restaurantService);
        this.restaurantService = restaurantService;
    }

    /**
     * Create a new restaurant
     */
    async create(req, res, next) {
        try {
            const requiredFields = ['name', 'image', 'map', 'distance', 'contactNumber', 'location'];
            this.validateBody(req, requiredFields);

            const result = await this.restaurantService.create(req.body);
            this.sendResponse(res, 201, result, 'Restaurant created successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurant by ID
     */
    async getById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.restaurantService.getById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get all restaurants with optional filtering
     */
    async getAll(req, res, next) {
        try {
            const { 
                name, deliveryAvailable, maxDistance, 
                limit, sort, ...otherFilters 
            } = req.query;

            const filters = { ...otherFilters };
            
            if (name) filters.name = name;
            if (deliveryAvailable !== undefined) {
                filters.deliveryAvailable = deliveryAvailable === 'true';
            }
            if (maxDistance) filters.maxDistance = parseFloat(maxDistance);
            if (limit) filters.limit = parseInt(limit);
            if (sort) filters.sort = JSON.parse(sort);

            const results = await this.restaurantService.searchRestaurants(filters);
            // Return raw data for frontend compatibility  
            res.status(200).json(results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update restaurant by ID
     */
    async updateById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.restaurantService.updateById(req.params.id, req.body);
            this.sendResponse(res, 200, result, 'Restaurant updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Delete restaurant by ID
     */
    async deleteById(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.restaurantService.deleteById(req.params.id);
            this.sendResponse(res, 200, result);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurants by delivery availability
     */
    async getRestaurantsByDelivery(req, res, next) {
        try {
            const { available = 'true' } = req.query;
            const deliveryAvailable = available === 'true';

            const results = await this.restaurantService.getRestaurantsByDelivery(deliveryAvailable);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Count restaurants by delivery availability
     */
    async countByDeliveryAvailability(req, res, next) {
        try {
            const results = await this.restaurantService.countRestaurantsByDelivery();
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurants by location proximity
     */
    async getRestaurantsByLocation(req, res, next) {
        try {
            const { lat, lng, maxDistance = 5000 } = req.query;
            
            if (!lat || !lng) {
                return this.sendError(res, 400, 'Latitude and longitude are required');
            }

            const results = await this.restaurantService.getRestaurantsByLocation(
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
     * Search restaurants by name
     */
    async searchRestaurantsByName(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm) {
                return this.sendError(res, 400, 'Search term is required');
            }

            const results = await this.restaurantService.searchRestaurantsByName(searchTerm);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurants within distance
     */
    async getRestaurantsWithinDistance(req, res, next) {
        try {
            const { maxDistance } = req.query;
            
            if (!maxDistance) {
                return this.sendError(res, 400, 'maxDistance parameter is required');
            }

            const results = await this.restaurantService.getRestaurantsWithinDistance(
                parseFloat(maxDistance)
            );
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Search restaurants with advanced filters
     */
    async searchRestaurants(req, res, next) {
        try {
            const filters = { ...req.query };
            
            // Convert string parameters to appropriate types
            if (filters.deliveryAvailable) {
                filters.deliveryAvailable = filters.deliveryAvailable === 'true';
            }
            if (filters.maxDistance) {
                filters.maxDistance = parseFloat(filters.maxDistance);
            }
            if (filters.limit) {
                filters.limit = parseInt(filters.limit);
            }
            if (filters.sort) {
                filters.sort = JSON.parse(filters.sort);
            }

            const results = await this.restaurantService.searchRestaurants(filters);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Update restaurant location
     */
    async updateRestaurantLocation(req, res, next) {
        try {
            this.validateParams(req, ['id']);
            this.validateBody(req, ['latitude', 'longitude']);

            const { latitude, longitude } = req.body;
            const result = await this.restaurantService.updateRestaurantLocation(
                req.params.id, 
                latitude, 
                longitude
            );

            this.sendResponse(res, 200, result, 'Restaurant location updated successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Toggle delivery availability
     */
    async toggleDeliveryAvailability(req, res, next) {
        try {
            this.validateParams(req, ['id']);

            const result = await this.restaurantService.toggleDeliveryAvailability(req.params.id);
            this.sendResponse(res, 200, result, 'Delivery availability toggled successfully');
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurant statistics
     */
    async getRestaurantStatistics(req, res, next) {
        try {
            const stats = await this.restaurantService.getRestaurantStatistics();
            this.sendResponse(res, 200, stats);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurants with enhanced details
     */
    async getRestaurantsWithDetails(req, res, next) {
        try {
            const { limit = 10 } = req.query;
            
            const results = await this.restaurantService.getRestaurantsWithDetails(parseInt(limit));
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get nearby restaurants with delivery
     */
    async getNearbyRestaurantsWithDelivery(req, res, next) {
        try {
            const { lat, lng, maxDistance = 5000 } = req.query;
            
            if (!lat || !lng) {
                return this.sendError(res, 400, 'Latitude and longitude are required');
            }

            const results = await this.restaurantService.getNearbyRestaurantsWithDelivery(
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
     * Get featured restaurants
     */
    async getFeaturedRestaurants(req, res, next) {
        try {
            const { limit = 5 } = req.query;
            
            // For now, get restaurants with delivery available, sorted by name
            const filters = {
                deliveryAvailable: true,
                limit: parseInt(limit),
                sort: { name: 1 }
            };

            const results = await this.restaurantService.searchRestaurants(filters);
            this.sendResponse(res, 200, results);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Get restaurant dashboard data
     */
    async getRestaurantDashboard(req, res, next) {
        try {
            const [
                stats,
                deliveryStats,
                recentRestaurants
            ] = await Promise.all([
                this.restaurantService.getRestaurantStatistics(),
                this.restaurantService.countRestaurantsByDelivery(),
                this.restaurantService.getAll({}, { limit: 5, sort: { createdAt: -1 } })
            ]);

            const dashboardData = {
                statistics: stats,
                deliveryStats,
                recentRestaurants
            };

            this.sendResponse(res, 200, dashboardData);
        } catch (error) {
            this.handleError(error, next);
        }
    }

    /**
     * Bulk update delivery availability
     */
    async bulkUpdateDeliveryAvailability(req, res, next) {
        try {
            this.validateBody(req, ['restaurantIds', 'deliveryAvailable']);

            const { restaurantIds, deliveryAvailable } = req.body;
            
            if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
                return this.sendError(res, 400, 'restaurantIds must be a non-empty array');
            }

            const results = [];
            const errors = [];

            for (const restaurantId of restaurantIds) {
                try {
                    const result = await this.restaurantService.updateById(restaurantId, {
                        deliveryAvailable
                    });
                    results.push({ restaurantId, success: true, data: result });
                } catch (error) {
                    errors.push({ restaurantId, success: false, error: error.message });
                }
            }

            const response = {
                totalRestaurants: restaurantIds.length,
                updated: results.length,
                failed: errors.length,
                results,
                errors
            };

            this.sendResponse(res, 200, response, 'Bulk delivery availability update completed');
        } catch (error) {
            this.handleError(error, next);
        }
    }
}

export default RestaurantController;
