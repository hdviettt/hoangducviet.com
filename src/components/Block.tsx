import type { Block } from '@/types/fields';
import Image from 'next/image';

const Block = (props: Block) => {
  if (props.type === "header") {
    const level = props.data.level || 2;
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    const sizeClasses = {
      1: 'text-2xl',
      2: 'text-xl',
      3: 'text-lg',
      4: 'text-base',
      5: 'text-sm',
      6: 'text-sm',
    };

    return (
      <HeadingTag
        key={props.id}
        className={`${sizeClasses[level as keyof typeof sizeClasses]} font-bold text-foreground mb-4 mt-8 uppercase`}
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
        className="text-sm text-foreground leading-relaxed mb-4"
        dangerouslySetInnerHTML={{
          __html: props.data.text || '',
        }}
      />
    );
  }
  if (props.type === "list") {
    const ListTag = props.data.style === "ordered" ? "ol" : "ul";
    return (
      <ListTag
        key={props.id}
        className="text-sm text-foreground mb-4 ml-6 space-y-1"
      >
        {props.data.items?.map((item: string, index: number) => (
          <li key={index} className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ListTag>
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