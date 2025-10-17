import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface MemberDocument extends Document<unknown, Member> {
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
export class Member {
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

export const MemberSchema = SchemaFactory.createForClass(Member);

// Add indexes for frequently queried fields to improve performance
MemberSchema.index({ name: 1 });
MemberSchema.index({ attended: 1 });
MemberSchema.index({ organizer: 1 });
MemberSchema.index({ invitedFrom: 1 });
MemberSchema.index({ hasLeft: 1 });
MemberSchema.index({ isStudent: 1 });
MemberSchema.index({ attendedAt: 1 });
