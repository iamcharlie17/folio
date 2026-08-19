import mongoose from 'mongoose';

const { Schema } = mongoose;

const quoteSchema = new Schema(
  {
    book:     { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text:     { type: String, required: [true, 'text is required'] },
    page:     Number,
    chapter:  String,
    reaction: String,
    tags:     [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true }
);

quoteSchema.index({ text: 'text', reaction: 'text' });

export default mongoose.model('Quote', quoteSchema);
