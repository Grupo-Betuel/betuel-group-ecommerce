import axios from 'axios';
import sizeOf from 'image-size';

export const imageKitUrl = 'https://ik.imagekit.io/q8ymapdfm/';

export const gcloidUrl = 'https://storage.googleapis.com/betuel-tech-photos/';

export const parseGcloudUrlToImageKit = (url: string) => {
  const name = url.split(gcloidUrl).pop();
  return `${imageKitUrl}${name}`;
};

export const getImageDimensionsFromUrl = async (url: string) => {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const dimensions = sizeOf(data);
    return {
      width: dimensions.width || 1200,
      height: dimensions.height || 630,
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return {
      width: 1200,
      height: 630,
    };
  }
};
