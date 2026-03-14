import PageForm from "@/components/admin/PageForm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  params: { slug: string };
}

export default async function EditPagePage({ params }: Params) {
  const result = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, params.slug))
    .limit(1);

  if (!result.length) {
    notFound();
  }

  const page = result[0];

  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Edit Page</h1>
      <PageForm
        initialData={{
          slug: page.slug,
          title: page.title,
          body: page.body ? JSON.stringify(page.body, null, 2) : "",
          navigation: page.navigation ?? "no",
        }}
        isEdit
      />
    </div>
  );
}
