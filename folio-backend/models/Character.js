import mongoose from 'mongoose';

const { Schema } = mongoose;

const characterSchema = new Schema(
  {
    book:          { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:          { type: String, required: [true, 'Character name is required'] },
    role:          String,
    traits:        [String],
    relationships: [
      {
        character:   String,
        description: String,
      },
    ],
  },
  { timestamps: true }
);

characterSchema.index({ name: 'text', traits: 'text' });

export default mongoose.model('Character', characterSchema);
