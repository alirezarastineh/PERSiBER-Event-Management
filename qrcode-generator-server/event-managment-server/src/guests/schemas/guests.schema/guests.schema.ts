import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GuestDocument = Guest & Document;

@Schema()
export class Guest {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
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

  @Prop({ type: Date, default: null })
  untilWhen: Date | null;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
