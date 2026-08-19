import mongoose from 'mongoose';

const { Schema } = mongoose;

const linkSchema = new Schema(
  {
    user:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceType: { type: String, enum: ['note', 'quote'], required: true },
    sourceId:   { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['note', 'quote'], required: true },
    targetId:   { type: Schema.Types.ObjectId, required: true },
    note:       String,
  },
  { timestamps: true }
);

export default mongoose.model('Link', linkSchema);
