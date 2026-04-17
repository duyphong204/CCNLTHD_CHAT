import { Document, Model, FilterQuery, UpdateQuery } from "mongoose";

/**
 * Base Repository class providing common CRUD operations
 * Implements the Repository pattern for data access layer
 */
export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string | null): Promise<T | null> {
    if (!id) return null;
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findAll(
    filter: FilterQuery<T>,
    page: number = 1,
    limit: number = 10,
  ): Promise<T[]> {
    return this.model
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findAndPopulate(
    filter: FilterQuery<T>,
    populate: string | string[],
  ): Promise<T | null> {
    return this.model.findOne(filter).populate(populate).exec();
  }
}
