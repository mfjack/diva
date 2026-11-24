import "server-only";

import path from "node:path";
import {
  Document,
  Font,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";
import type { RichTextNode } from "@/lib/rich-text";
import { UNTITLED_STUDY_NOTE } from "../labels";
import type { StudyNote } from "../types";

const COLORS = {
  text: "#1f1b2e",
  muted: "#6b6680",
  primary: "#6d5bd0",
  border: "#e4e0f2",
} as const;

const FONT_FAMILY = "Poppins";
const REGULAR_WEIGHT = 400;
const SEMIBOLD_WEIGHT = 600;

const FONT_FILES_DIRECTORY = path.join(
  process.cwd(),
  "node_modules",
  "@fontsource",
  "poppins",
  "files",
);

function getFontFile(weight: number, style: "normal" | "italic"): string {
  return path.join(
    FONT_FILES_DIRECTORY,
    `poppins-latin-${weight}-${style}.woff`,
  );
}

Font.register({
  family: FONT_FAMILY,
  fonts: [REGULAR_WEIGHT, SEMIBOLD_WEIGHT].flatMap((fontWeight) =>
    (["normal", "italic"] as const).map((fontStyle) => ({
      src: getFontFile(fontWeight, fontStyle),
      fontWeight,
      fontStyle,
    })),
  ),
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingVertical: 48,
    paddingHorizontal: 52,
    fontFamily: FONT_FAMILY,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: COLORS.text,
  },
  header: {
    gap: 4,
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontWeight: SEMIBOLD_WEIGHT, fontSize: 19, lineHeight: 1.25 },
  details: { fontSize: 9, color: COLORS.muted },
  source: { fontSize: 9 },
  sourceLabel: { fontWeight: SEMIBOLD_WEIGHT },
  paragraph: { marginBottom: 8 },
  headingLarge: {
    fontWeight: SEMIBOLD_WEIGHT,
    fontSize: 13.5,
    marginTop: 8,
    marginBottom: 6,
  },
  headingSmall: {
    fontWeight: SEMIBOLD_WEIGHT,
    fontSize: 11.5,
    marginTop: 6,
    marginBottom: 4,
  },
  list: { marginBottom: 8 },
  listItem: { flexDirection: "row", marginBottom: 2 },
  listMarker: { width: 18 },
  listContent: { flex: 1 },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
    marginBottom: 8,
    color: COLORS.muted,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 52,
    right: 52,
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "right",
  },
});

function getTextStyle(node: RichTextNode, isBaseBold: boolean) {
  const markTypes = new Set(node.marks?.map(({ type }) => type));
  return {
    fontWeight:
      isBaseBold || markTypes.has("bold") ? SEMIBOLD_WEIGHT : REGULAR_WEIGHT,
    fontStyle: markTypes.has("italic") ? "italic" : "normal",
  } as const;
}

function renderInline(
  nodes: readonly RichTextNode[] = [],
  isBaseBold = false,
): ReactNode {
  return nodes.map((node, index) =>
    node.type === "hardBreak" ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: document nodes have no stable id and never reorder
      <Text key={index}>{"\n"}</Text>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: document nodes have no stable id and never reorder
      <Text key={index} style={getTextStyle(node, isBaseBold)}>
        {node.text ?? ""}
      </Text>
    ),
  );
}

function renderList(node: RichTextNode, isOrdered: boolean): ReactNode {
  return (
    <View style={styles.list}>
      {(node.content ?? []).map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable id and never reorder
        <View key={index} style={styles.listItem} wrap={false}>
          <Text style={styles.listMarker}>
            {isOrdered ? `${index + 1}.` : "•"}
          </Text>
          <View style={styles.listContent}>
            {renderBlocks(item.content, true)}
          </View>
        </View>
      ))}
    </View>
  );
}

function renderBlock(node: RichTextNode, isCompact: boolean): ReactNode {
  switch (node.type) {
    case "heading":
      return (
        <Text
          style={
            node.attrs?.level === 3 ? styles.headingSmall : styles.headingLarge
          }
        >
          {renderInline(node.content, true)}
        </Text>
      );
    case "bulletList":
      return renderList(node, false);
    case "orderedList":
      return renderList(node, true);
    case "blockquote":
      return (
        <View style={styles.blockquote}>{renderBlocks(node.content)}</View>
      );
    case "paragraph":
      return (
        <Text style={isCompact ? undefined : styles.paragraph}>
          {renderInline(node.content)}
        </Text>
      );
    default:
      return renderBlocks(node.content, isCompact);
  }
}

function renderBlocks(
  nodes: readonly RichTextNode[] = [],
  isCompact = false,
): ReactNode {
  return nodes.map((node, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: document nodes have no stable id and never reorder
    <View key={index}>{renderBlock(node, isCompact)}</View>
  ));
}

function StudyNoteDocument({ note }: { note: StudyNote }) {
  const title = note.title || UNTITLED_STUDY_NOTE;
  const details = [
    note.kind,
    `Atualizada em ${formatDate(note.updatedAt)}`,
    ...note.tags,
  ].join("  ·  ");
  const sourceText = note.source
    ? [note.source.title, note.source.author].filter(Boolean).join(", ")
    : "";

  return (
    <Document title={title} language="pt-BR">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.details}>{details}</Text>
          {note.source && (
            <Text style={styles.source}>
              <Text style={styles.sourceLabel}>Fonte: </Text>
              {sourceText}
              {note.source.url ? `\n${note.source.url}` : ""}
            </Text>
          )}
        </View>
        {renderBlocks(note.content.content)}
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}

export function renderStudyNotePdf(note: StudyNote): Promise<Buffer> {
  return renderToBuffer(<StudyNoteDocument note={note} />);
}
