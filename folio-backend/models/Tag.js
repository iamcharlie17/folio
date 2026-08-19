import mongoose from 'mongoose';

const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    user:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:  { type: String, required: [true, 'Tag name is required'] },
    color: { type: String, default: '#6B7280' },
  },
  { timestamps: true }
);

tagSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('Tag', tagSchema);
