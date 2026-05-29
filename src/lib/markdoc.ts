import Markdoc, { type Node } from "@markdoc/markdoc";

// Render a Keystatic markdoc field to an HTML string. External links (absolute
// http(s) URLs) are given target/rel so they open in a new tab, matching how
// the hand-written bio behaved before it became editable.
export function renderMarkdoc(node: Node): string {
  const transformed = Markdoc.transform(node, {
    nodes: {
      link: {
        ...Markdoc.nodes.link,
        transform(astNode, config) {
          const attributes = astNode.transformAttributes(config);
          const children = astNode.transformChildren(config);
          const href = typeof attributes.href === "string" ? attributes.href : "";
          const external = /^https?:\/\//i.test(href);
          return new Markdoc.Tag(
            "a",
            external
              ? { ...attributes, target: "_blank", rel: "noopener noreferrer" }
              : attributes,
            children
          );
        },
      },
    },
  });
  return Markdoc.renderers.html(transformed);
}
