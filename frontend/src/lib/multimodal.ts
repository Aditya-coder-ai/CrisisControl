export type MultiModalPayload = {
  type: 'text' | 'audio' | 'image';
  content: string; // Text, Base64 Audio, or Base64 Image
  metadata?: Record<string, unknown>;
};

/**
 * Normalizes standard text strings into the multi-modal payload structure.
 */
export function normalizeTextEvent(text: string): MultiModalPayload {
  return {
    type: 'text',
    content: text.trim(),
    metadata: {
      length: text.length,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Simulates processing a Blob (like from MediaRecorder) into a base64 string
 * ready to be ingested by the Go backend's SyncService.
 */
export async function normalizeAudioInput(audioBlob: Blob): Promise<MultiModalPayload> {
  const base64 = await blobToBase64(audioBlob);
  return {
    type: 'audio',
    content: base64,
    metadata: {
      mimeType: audioBlob.type,
      size: audioBlob.size,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Normalizes an image File/Blob for transport.
 * In a production environment, this would also include resizing/compression algorithms via canvas.
 */
export async function normalizeImageInput(imageFile: File): Promise<MultiModalPayload> {
  const base64 = await blobToBase64(imageFile);
  return {
    type: 'image',
    content: base64,
    metadata: {
      name: imageFile.name,
      mimeType: imageFile.type,
      size: imageFile.size,
      timestamp: new Date().toISOString()
    }
  };
}

// Utility function to convert Blob/File to Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Content = reader.result.split(',')[1];
        resolve(base64Content);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
