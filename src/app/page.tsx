import Image from "next/image";
import { getHdviet } from "@/lib/directus";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch Hdviet data
  let hdvietData: any[] = [];
  
  try {
    hdvietData = await getHdviet();
  } catch (error) {
    console.error("Error fetching Hdviet data:", error);
    // Return a simple error page for production
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-2 text-white uppercase">Connection Error</h1>
          <p className="text-white font-mono text-xs">Unable to fetch data</p>
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (hdvietData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-2 text-white uppercase">No Data</h1>
          <p className="text-white font-mono text-xs">Empty collection</p>
        </div>
      </div>
    );
  }

  // Get the first entry as the main profile
  const mainProfile = hdvietData[0];
  
  // Construct image URL - handle different possible formats
  const directusUrl = 'https://directus-production-b969.up.railway.app';
  let imageUrl = null;
  if (mainProfile.image) {
    if (typeof mainProfile.image === 'object' && mainProfile.image.filename_disk) {
      imageUrl = `${directusUrl}/assets/${mainProfile.image.filename_disk}`;
    } else if (typeof mainProfile.image === 'string') {
      // If it's a UUID string
      imageUrl = `${directusUrl}/assets/${mainProfile.image}`;
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full p-4 md:p-8 lg:p-16 animate-fadeIn">
        {/* Main Profile Section - Deskfolio Style */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Side - Content */}
            <div className="order-2 lg:order-1">
              {/* Name */}
              {mainProfile.name && (
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-foreground leading-tight uppercase">
                  {mainProfile.name}
                </h1>
              )}
              
              {/* Description (HTML) */}
              {mainProfile.description && (
                <div 
                  className="prose prose-invert prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-foreground prose-headings:mb-4 prose-headings:mt-6
                    prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                    prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:text-muted-foreground prose-ul:mb-4 prose-ul:ml-4
                    prose-ol:text-muted-foreground prose-ol:mb-4 prose-ol:ml-4
                    prose-li:text-muted-foreground prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-400/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
                    prose-code:text-blue-400 prose-code:bg-secondary/50 prose-code:px-1 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-secondary/30 prose-pre:border prose-pre:border-border/20 prose-pre:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: mainProfile.description }}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-0 mt-6 md:mt-8">
                <a 
                  href="/posts" 
                  className="px-4 md:px-6 py-2 md:py-3 bg-black text-white border md:border-2 border-white font-bold uppercase text-[10px] md:text-xs hover:bg-white hover:text-black transition-colors"
                >
                  [Articles]
                </a>
                <a 
                  href="/projects" 
                  className="px-4 md:px-6 py-2 md:py-3 bg-black text-white border md:border-2 border-white border-l-0 font-bold uppercase text-[10px] md:text-xs hover:bg-white hover:text-black transition-colors"
                >
                  [Projects]
                </a>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="order-1 lg:order-2">
              {imageUrl ? (
                <div className="w-full max-w-md mx-auto lg:max-w-none">
                  <div className="aspect-square overflow-hidden border-2 md:border-4 border-white bg-black">
                    <Image
                      src={imageUrl}
                      alt={mainProfile.name || 'Profile'}
                      width={600}
                      height={600}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-black border-2 md:border-4 border-white flex items-center justify-center">
                  <div className="text-white font-mono text-sm md:text-lg uppercase">No Image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Profiles Section if there are more */}
        {hdvietData.length > 1 && (
          <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-border/20">
            <h2 className="text-3xl font-bold mb-8 text-foreground">More Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hdvietData.slice(1).map((item, index) => {
                let itemImageUrl = null;
                if (item.image) {
                  if (typeof item.image === 'object' && item.image.filename_disk) {
                    itemImageUrl = `${directusUrl}/assets/${item.image.filename_disk}`;
                  } else if (typeof item.image === 'string') {
                    itemImageUrl = `${directusUrl}/assets/${item.image}`;
                  }
                }

                return (
                  <div key={item.id || index} className="flex gap-6 p-6 bg-secondary/10 rounded-xl border border-border/20 hover:bg-secondary/20 transition-all duration-300">
                    {/* Small Image */}
                    {itemImageUrl && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden">
                          <Image
                            src={itemImageUrl}
                            alt={item.name || 'Profile'}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1">
                      {item.name && (
                        <h3 className="text-xl font-bold mb-2 text-foreground">
                          {item.name}
                        </h3>
                      )}
                      
                      {item.description && (
                        <div 
                          className="prose prose-invert prose-sm max-w-none
                            prose-p:text-muted-foreground prose-p:line-clamp-3
                            prose-a:text-blue-400"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}