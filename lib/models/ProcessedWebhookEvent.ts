import mongoose from 'mongoose';

const ProcessedWebhookEventSchema = new mongoose.Schema({
  stripeEventId: { type: String, unique: true, required: true },
  processedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ProcessedWebhookEvent ||
  mongoose.model('ProcessedWebhookEvent', ProcessedWebhookEventSchema);
