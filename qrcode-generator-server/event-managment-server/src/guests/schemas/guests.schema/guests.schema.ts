import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface GuestDocument extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  name: string;
  alreadyPaid: boolean;
  freeEntry: boolean;
  drinksCoupon: number;
  attended: string;
  invitedFrom: string;
  isStudent: boolean;
  isLady: boolean;
  untilWhen: Date | null;
}

@Schema()
export class Guest {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  alreadyPaid: boolean;

  @Prop({ default: false })
  freeEntry: boolean;

  @Prop({ default: 0 })
  drinksCoupon: number;

  @Prop({ default: 'Still Not', enum: ['Still Not', 'Yes'] })
  attended: string;

  @Prop({ default: '' })
  invitedFrom: string;

  @Prop({ default: false })
  isStudent: boolean;

  @Prop({ default: false })
  isLady: boolean;

  @Prop({ type: Date, default: null })
  untilWhen: Date | null;

  @Prop({ required: false })
  addedBy: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
