import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MemberDocument = Member & Document;

@Schema()
export class Member {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'No', enum: ['No', 'Yes'] })
  attended: string;

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
