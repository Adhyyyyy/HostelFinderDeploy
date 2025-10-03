import BaseRepository from '../core/BaseRepository.js';
import Restaurant from '../models/Restaurant.js';

/**
 * Restaurant Repository
 * Handles all database operations for Restaurant entity
 */
class RestaurantRepository extends BaseRepository {
    constructor() {
        super(Restaurant);
    }

    /**
     * Find restaurants by delivery availability
     */
    async findByDeliveryAvailability(deliveryAvailable = true) {
        try {
            return await this.findAll({ deliveryAvailable });
        } catch (error) {
            throw this._handleError(error, 'findByDeliveryAvailability');
        }
    }

    /**
     * Count restaurants by delivery availability
     */
    async countByDeliveryAvailability() {
        try {
            const deliveryAvailableCount = await this.count({ deliveryAvailable: true });
            const deliveryNotAvailableCount = await this.count({ deliveryAvailable: false });

            return [
                { type: "Delivery Available", count: deliveryAvailableCount },
                { type: "No Delivery", count: deliveryNotAvailableCount }
            ];
        } catch (error) {
            throw this._handleError(error, 'countByDeliveryAvailability');
        }
    }

    /**
     * Find restaurants by location proximity
     */
    async findByLocationProximity(lat, lng, maxDistance = 5000) {
        try {
            return await this.model.find({
                'location.latitude': {
                    $gte: lat - (maxDistance / 111000), // Rough conversion to degrees
                    $lte: lat + (maxDistance / 111000)
                },
                'location.longitude': {
                    $gte: lng - (maxDistance / 111000),
                    $lte: lng + (maxDistance / 111000)
                }
            });
        } catch (error) {
            throw this._handleError(error, 'findByLocationProximity');
        }
    }

    /**
     * Search restaurants by name
     */
    async searchByName(searchTerm) {
        try {
            const regex = new RegExp(searchTerm, 'i');
            return await this.findAll({ name: regex });
        } catch (error) {
            throw this._handleError(error, 'searchByName');
        }
    }

    /**
     * Find restaurants by distance range
     */
    async findByDistanceRange(maxDistance) {
        try {
            // Assuming distance is stored as a string like "2.5 km"
            // This is a simplified search - in production, you'd want proper distance calculation
            const regex = new RegExp(`^[0-${maxDistance}]`, 'i');
            return await this.findAll({ distance: regex });
        } catch (error) {
            throw this._handleError(error, 'findByDistanceRange');
        }
    }

    /**
     * Get restaurant statistics
     */
    async getRestaurantStatistics() {
        try {
            const totalRestaurants = await this.count();
            const deliveryAvailable = await this.count({ deliveryAvailable: true });
            const noDelivery = totalRestaurants - deliveryAvailable;

            return {
                totalRestaurants,
                deliveryAvailable,
                noDelivery,
                deliveryPercentage: totalRestaurants > 0 ? (deliveryAvailable / totalRestaurants) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getRestaurantStatistics');
        }
    }

    /**
     * Find restaurants with filters
     */
    async findWithFilters(filters = {}) {
        try {
            const query = {};

            if (filters.name) {
                query.name = { $regex: filters.name, $options: 'i' };
            }
            if (filters.deliveryAvailable !== undefined) {
                query.deliveryAvailable = filters.deliveryAvailable;
            }
            if (filters.maxDistance) {
                // Simple distance filtering - in production, use proper geospatial queries
                const regex = new RegExp(`^[0-${filters.maxDistance}]`, 'i');
                query.distance = regex;
            }

            const options = {
                limit: filters.limit ? parseInt(filters.limit) : 10,
                sort: filters.sort || { name: 1 }
            };

            return await this.findAll(query, options);
        } catch (error) {
            throw this._handleError(error, 'findWithFilters');
        }
    }

    /**
     * Update restaurant location
     */
    async updateLocation(restaurantId, latitude, longitude) {
        try {
            return await this.updateById(restaurantId, {
                'location.latitude': latitude,
                'location.longitude': longitude
            });
        } catch (error) {
            throw this._handleError(error, 'updateLocation');
        }
    }

    /**
     * Toggle delivery availability
     */
    async toggleDeliveryAvailability(restaurantId) {
        try {
            const restaurant = await this.findById(restaurantId);
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            return await this.updateById(restaurantId, {
                deliveryAvailable: !restaurant.deliveryAvailable
            });
        } catch (error) {
            throw this._handleError(error, 'toggleDeliveryAvailability');
        }
    }
}

export default RestaurantRepository;
