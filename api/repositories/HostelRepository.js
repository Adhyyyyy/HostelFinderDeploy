import BaseRepository from '../core/BaseRepository.js';
import Hostel from '../models/Hostel.js';

/**
 * Hostel Repository
 * Handles all database operations for Hostel entity
 */
class HostelRepository extends BaseRepository {
    constructor() {
        super(Hostel);
    }

    /**
     * Find hostels by gender type
     */
    async findByGenderType(genderType) {
        try {
            return await this.findAll({ genderType });
        } catch (error) {
            throw this._handleError(error, 'findByGenderType');
        }
    }

    /**
     * Find hostels by category
     */
    async findByCategory(category) {
        try {
            return await this.findAll({ category });
        } catch (error) {
            throw this._handleError(error, 'findByCategory');
        }
    }

    /**
     * Count hostels by gender type
     */
    async countByGender(genders) {
        try {
            const counts = await Promise.all(
                genders.map(gender => this.count({ genderType: gender }))
            );
            return counts;
        } catch (error) {
            throw this._handleError(error, 'countByGender');
        }
    }

    /**
     * Count hostels by category
     */
    async countByCategory() {
        try {
            const pgCount = await this.count({ category: "PG" });
            const hostelCount = await this.count({ category: "Hostel" });
            
            return [
                { type: "PG", count: pgCount },
                { type: "Hostel", count: hostelCount }
            ];
        } catch (error) {
            throw this._handleError(error, 'countByCategory');
        }
    }

    /**
     * Find hostels with available vacancy
     */
    async findAvailableHostels(minVacancy = 1) {
        try {
            return await this.findAll({ vacancy: { $gte: minVacancy } });
        } catch (error) {
            throw this._handleError(error, 'findAvailableHostels');
        }
    }

    /**
     * Find hostels within distance range
     */
    async findByDistanceRange(maxDistance) {
        try {
            return await this.findAll({ 
                distanceFromCollege: { $lte: maxDistance } 
            });
        } catch (error) {
            throw this._handleError(error, 'findByDistanceRange');
        }
    }

    /**
     * Search hostels by multiple criteria
     */
    async searchHostels(criteria) {
        try {
            const filter = {};
            
            if (criteria.name) {
                filter.name = { $regex: criteria.name, $options: "i" };
            }
            if (criteria.category) {
                filter.category = criteria.category;
            }
            if (criteria.genderType) {
                filter.genderType = criteria.genderType;
            }
            if (criteria.messType !== undefined) {
                filter.messType = criteria.messType;
            }
            if (criteria.maxDistance) {
                filter.distanceFromCollege = { $lte: criteria.maxDistance };
            }
            if (criteria.minVacancy) {
                filter.vacancy = { $gte: criteria.minVacancy };
            }

            const options = {
                limit: criteria.limit || 10,
                sort: criteria.sort || { distanceFromCollege: 1 }
            };

            return await this.findAll(filter, options);
        } catch (error) {
            throw this._handleError(error, 'searchHostels');
        }
    }

    /**
     * Update hostel vacancy
     */
    async updateVacancy(hostelId, vacancyChange) {
        try {
            return await this.model.findByIdAndUpdate(
                hostelId,
                { $inc: { vacancy: vacancyChange } },
                { new: true }
            );
        } catch (error) {
            throw this._handleError(error, 'updateVacancy');
        }
    }

    /**
     * Find hostels by location proximity
     */
    async findByLocationProximity(lat, lng, maxDistance = 5000) {
        try {
            return await this.model.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lng, lat]
                        },
                        $maxDistance: maxDistance
                    }
                }
            });
        } catch (error) {
            throw this._handleError(error, 'findByLocationProximity');
        }
    }
}

export default HostelRepository;
