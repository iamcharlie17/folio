import mongoose from 'mongoose';

const { Schema } = mongoose;

const progressLogSchema = new Schema({
  book:     { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  page:     { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now },
});

export default mongoose.model('ProgressLog', progressLogSchema);
