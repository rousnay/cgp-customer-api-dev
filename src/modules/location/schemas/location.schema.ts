import { Schema, Document } from 'mongoose';

export const LocationSchema = new Schema({
  riderId: { type: Number, unique: true, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon'],
      default: 'Point',
      required: true,
    },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  updatedAt: { type: Date, default: Date.now },
});

// Create a 2dsphere index on the location field
LocationSchema.index({ location: '2dsphere' });

export interface Location extends Document {
  riderId: number;
  location: {
    type: string;
    coordinates: number[];
  };
  updatedAt: Date;
}
