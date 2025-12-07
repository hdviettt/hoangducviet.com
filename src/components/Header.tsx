import { getGlobalMetadata } from "@/lib/directus";
import { getPages } from "@/lib/pages";
import DockControls from "./DockControls";

async function Header() {
  let title = "VIET";
  let pages: any[] = [];

  try {
    const metadata = await getGlobalMetadata();
    title = metadata && metadata.length > 0 ? metadata[0].title || "VIET" : "VIET";
  } catch (error) {
    console.error("Error fetching global metadata:", error);
  }

  try {
    pages = await getPages({
      fields: ["title", "slug", "navigation"],
      filter: {
        navigation: {
          _eq: "yes"
        }
      }
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    pages = [];
  }

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 dock">
      <DockControls pages={pages} title={title} />
    </header>
  );
}

export default Header;
