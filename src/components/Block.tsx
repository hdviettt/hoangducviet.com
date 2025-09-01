import type { Block } from '@/types/fields';
import Image from 'next/image';

const Block = (props: Block) => {
  if (props.type === "header") {
    return (
      <h2
        key={props.id}
        dangerouslySetInnerHTML={{
          __html: props.data.text || '',
        }}
      />
    );
  }
  if (props.type === "paragraph") {
    return (
      <p
        key={props.id}
        dangerouslySetInnerHTML={{
          __html: props.data.text || '',
        }}
      />
    );
  }
  if (props.type === "image" && props.data.file) {
    let imageUrl = props.data.file.url;
    
    // Handle different URL formats
    if (imageUrl.startsWith('http')) {
      // Already a full URL
    } else if (imageUrl.startsWith('/assets/') || imageUrl.startsWith('/files/')) {
      // Relative path from Directus
      imageUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}${imageUrl}`;
    } else {
      // Just the file ID
      imageUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT}/assets/${imageUrl}`;
    }
    
    return (
      <figure key={props.id} className={props.data.stretched ? 'w-full' : ''}>
        <Image
          src={imageUrl}
          alt={props.data.caption || ''}
          width={props.data.file.width || 800}
          height={props.data.file.height || 600}
          className={`w-full h-auto ${props.data.withBorder ? 'border' : ''} ${props.data.withBackground ? 'bg-gray-100 p-4' : ''}`}
        />
        {props.data.caption && (
          <figcaption className="text-center text-sm text-gray-600 mt-2">
            {props.data.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return null;
}

export default Block;