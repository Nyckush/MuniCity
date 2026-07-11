import React, { useEffect } from "react";
import {
    Bold,
    Heading1,
    Heading2,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Underline as UnderlineIcon,
    Undo2,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

import { Button } from "@/components/ui/button";

const toolbarItems = [
    {
        key: "bold",
        label: "Negrita",
        icon: Bold,
        isActive: (editor) => editor.isActive("bold"),
        action: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
        key: "italic",
        label: "Itálica",
        icon: Italic,
        isActive: (editor) => editor.isActive("italic"),
        action: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    {
        key: "underline",
        label: "Subrayado",
        icon: UnderlineIcon,
        isActive: (editor) => editor.isActive("underline"),
        action: (editor) => editor.chain().focus().toggleUnderline().run(),
    },
    {
        key: "h1",
        label: "Título",
        icon: Heading1,
        isActive: (editor) => editor.isActive("heading", { level: 1 }),
        action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
        key: "h2",
        label: "Subtítulo",
        icon: Heading2,
        isActive: (editor) => editor.isActive("heading", { level: 2 }),
        action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        key: "bullet",
        label: "Lista",
        icon: List,
        isActive: (editor) => editor.isActive("bulletList"),
        action: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        key: "ordered",
        label: "Numerada",
        icon: ListOrdered,
        isActive: (editor) => editor.isActive("orderedList"),
        action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
        key: "quote",
        label: "Cita",
        icon: Quote,
        isActive: (editor) => editor.isActive("blockquote"),
        action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
];

export default function TiptapEditor({
    value,
    onChange,
    placeholder = "Escribí aquí...",
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
            Underline,
        ],
        content: value || "",
        editorProps: {
            attributes: {
                class:
                    "min-h-40 rounded-b-2xl bg-white px-4 py-3 text-sm text-slate-700 outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-4 [&_ol]:list-decimal [&_p.is-editor-empty:first-child::before]:text-slate-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_ul]:list-disc",
                "data-placeholder": placeholder,
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            const plainText = currentEditor.getText().trim();
            onChange?.(plainText ? currentEditor.getHTML() : "");
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const currentHtml = editor.getHTML();
        if ((value || "") !== currentHtml) {
            editor.commands.setContent(value || "", false);
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/80 p-3">
                {toolbarItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.isActive(editor);

                    return (
                        <Button
                            key={item.key}
                            type="button"
                            variant="outline"
                            onClick={() => item.action(editor)}
                            className={`h-9 rounded-xl bg-white ${
                                active ? "border-sky-200 bg-sky-50 text-sky-700" : ""
                            }`}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Button>
                    );
                })}

                <div className="ml-auto flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        className="h-9 rounded-xl bg-white"
                    >
                        <Undo2 size={16} />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        className="h-9 rounded-xl bg-white"
                    >
                        <Redo2 size={16} />
                    </Button>
                </div>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
