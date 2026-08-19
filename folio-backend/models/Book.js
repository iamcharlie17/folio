import mongoose from 'mongoose';

const { Schema } = mongoose;

const bookSchema = new Schema(
  {
    user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: [true, 'Book title is required'] },
    author:      String,
    genre:       String,
    coverImage:  String,
    totalPages:  { type: Number, min: [1, 'totalPages must be at least 1'] },
    currentPage: { type: Number, default: 0, min: 0 },
    status:      { type: String, enum: ['to-read', 'reading', 'completed'], default: 'to-read' },
  },
  { timestamps: true }
);

bookSchema.virtual('completionPercent').get(function () {
  if (!this.totalPages || this.totalPages === 0) return 0;
  return Math.round((this.currentPage / this.totalPages) * 100);
});

bookSchema.set('toJSON',   { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

export default mongoose.model('Book', bookSchema);
