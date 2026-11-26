"use client";

import { Placeholder } from "@tiptap/extensions";
import {
  type Editor,
  EditorContent,
  type JSONContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  type LucideIcon,
  Quote,
} from "lucide-react";
import type { FieldValues } from "react-hook-form";
import { Toggle } from "@/components/ui/toggle";
import type { RichTextDocument, RichTextNode } from "@/lib/rich-text";
import { ControlledFormField } from "./controlled-form-field";
import type { FormFieldProps } from "./form-field-types";

type FormattingAction = {
  label: string;
  icon: LucideIcon;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

const FORMATTING_ACTIONS = [
  {
    label: "Negrito",
    icon: Bold,
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: "Itálico",
    icon: Italic,
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: "Título",
    icon: Heading2,
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Subtítulo",
    icon: Heading3,
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Lista",
    icon: List,
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Lista numerada",
    icon: ListOrdered,
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Citação",
    icon: Quote,
    isActive: (editor) => editor.isActive("blockquote"),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
] as const satisfies readonly FormattingAction[];

function toRichTextDocument(content: JSONContent): RichTextDocument {
  return { type: "doc", content: (content.content ?? []) as RichTextNode[] };
}

type FormattingToolbarProps = {
  editor: Editor;
};

function FormattingToolbar({ editor }: FormattingToolbarProps) {
  const activeLabels = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) =>
      FORMATTING_ACTIONS.filter(({ isActive }) => isActive(currentEditor)).map(
        ({ label }) => label,
      ),
  });

  return (
    <div
      role="toolbar"
      aria-label="Formatação"
      className="flex flex-wrap gap-1 border-b p-1.5"
    >
      {FORMATTING_ACTIONS.map(({ label, icon: Icon, run }) => (
        <Toggle
          key={label}
          size="sm"
          aria-label={label}
          title={label}
          pressed={activeLabels.includes(label)}
          onPressedChange={() => run(editor)}
        >
          <Icon aria-hidden />
        </Toggle>
      ))}
    </div>
  );
}

type RichTextEditorProps = {
  inputId: string;
  label: string;
  value: RichTextDocument;
  placeholder: string;
  onChange: (value: RichTextDocument) => void;
};

function RichTextEditor({
  inputId,
  label,
  value,
  placeholder,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: inputId,
        "aria-label": label,
        class: "rich-text min-h-64 px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) =>
      onChange(toRichTextDocument(currentEditor.getJSON())),
  });

  return (
    <div className="overflow-hidden rounded-lg border bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15">
      {editor && <FormattingToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

type RichTextFieldProps<TFieldValues extends FieldValues> = Omit<
  FormFieldProps<TFieldValues>,
  "autoComplete"
>;

export function RichTextField<TFieldValues extends FieldValues>({
  placeholder = "Comece a escrever…",
  ...fieldProps
}: RichTextFieldProps<TFieldValues>) {
  return (
    <ControlledFormField {...fieldProps}>
      {({ field, controlProps }) => (
        <RichTextEditor
          inputId={controlProps.id}
          label={fieldProps.label}
          value={field.value}
          placeholder={placeholder}
          onChange={field.onChange}
        />
      )}
    </ControlledFormField>
  );
}
