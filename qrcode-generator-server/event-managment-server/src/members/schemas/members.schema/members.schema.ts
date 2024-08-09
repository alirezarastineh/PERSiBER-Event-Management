import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MemberDocument = Member & Document;

@Schema()
export class Member {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'No', enum: ['No', 'Yes'] })
  attended: string;

  @Prop({ default: '' })
  organizer: string;

  @Prop({ default: '' })
  invitedFrom: string;

  @Prop({ default: 0 })
  membersInvited: number;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
