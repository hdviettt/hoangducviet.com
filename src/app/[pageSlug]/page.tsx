import Block from "@/components/content/Block";
import Container from "@/components/layout/Container";
import { getPageBySlug } from "@/lib/pages";
import type { Metadata } from "next";

interface PageParams {
  params: {
    pageSlug: string;
  };
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const page = await getPageBySlug(params.pageSlug);
  return {
    title: `${page.title}`,
  };
}

export default async function Post({ params }: PageParams) {
  const data = await getPageBySlug(params.pageSlug);

  return (
    <>
      <section className="bg-slate-50">
        <Container className="prose max-w-4xl -mt-8 py-28">
          <header className="text-center mx-auto mb-16">
            <h1 className="text-5xl leading-none mb-4">{data.title}</h1>
          </header>
          {Array.isArray(data.body?.blocks) && (
            <div>
              {data.body.blocks.map((block) => (
                <Block key={block.id} {...block} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
