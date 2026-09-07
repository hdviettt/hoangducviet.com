import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const registry: Record<string, ComponentType<any>> = {
  counter: dynamic(() => import("./Counter")),
  video: dynamic(() => import("./Video")),
  carousel: dynamic(() => import("./MediaCarousel")),
  career: dynamic(() => import("../about/CareerShape")),
  record: dynamic(() => import("../about/Record")),
};

export default registry;
