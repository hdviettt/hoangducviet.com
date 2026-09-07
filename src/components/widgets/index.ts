import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const registry: Record<string, ComponentType<any>> = {
  counter: dynamic(() => import("./Counter")),
  video: dynamic(() => import("./Video")),
  carousel: dynamic(() => import("./MediaCarousel")),
  credentials: dynamic(() => import("../about/Credentials")),
};

export default registry;
