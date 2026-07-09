import ImageRenderer from "./ImageRenderer";
import VideoRenderer from "./VideoRenderer";
import QuoteRenderer from "./QuoteRenderer";

export const MEDIA_REGISTRY = {
  image: ImageRenderer,
  video: VideoRenderer,
  quote: QuoteRenderer,
};