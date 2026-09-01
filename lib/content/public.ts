import { readContent } from "@/lib/content/store";
import type { SiteContent } from "@/types/content";

export async function readPublicContent(): Promise<SiteContent> {
  const content = await readContent();
  return {
    ...content,
    advantages: {
      ...content.advantages,
      items: content.advantages.items.filter((item) => item.visible).sort((a, b) => a.order - b.order),
    },
    products: {
      ...content.products,
      items: content.products.items.filter((item) => item.visible).sort((a, b) => a.order - b.order),
    },
    documentation: {
      ...content.documentation,
      documents: content.documentation.documents
        .filter((doc) => doc.published)
        .sort((a, b) => a.order - b.order),
    },
  };
}
