import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AppVersion extends Document {
  @Prop({ type: Object, required: true }) // Use Object type to store any structure
  data: Record<string, any>;
}

export const AppVersionSchema = SchemaFactory.createForClass(AppVersion);
