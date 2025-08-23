import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface BpplistDocument extends Document<unknown, Bpplist> {
  _id: Types.ObjectId;
  name: string;
  attended: string;
  attendedAt: Date | null;
  organizer: string;
  invitedFrom: string;
  membersInvited: number;
  hasLeft: boolean;
  isStudent: boolean;
  untilWhen: Date | null;
}

@Schema()
export class Bpplist {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'No', enum: ['No', 'Yes'] })
  attended: string;

  @Prop({ type: Date, default: null })
  attendedAt: Date | null;

  @Prop({
    default: '',
    enum: ['Kourosh', 'Sobhan', 'Mutual'],
    required: true,
  })
  organizer: string;

  @Prop({ default: '' })
  invitedFrom: string;

  @Prop({ default: 0 })
  membersInvited: number;

  @Prop({ default: false })
  hasLeft: boolean;

  @Prop({ default: false })
  isStudent: boolean;

  @Prop({ type: Date, default: null })
  untilWhen: Date | null;
}

export const BpplistSchema = SchemaFactory.createForClass(Bpplist);
