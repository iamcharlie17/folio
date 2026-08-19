import mongoose from 'mongoose';

const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    book:    { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic:   { type: String, required: [true, 'topic is required'] },
    content: { type: String, required: [true, 'content is required'] },
    tags:    [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true }
);

noteSchema.index({ topic: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
