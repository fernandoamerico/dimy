'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ value, onChange, placeholder = 'Escreva seu texto aqui...' }: WysiwygEditorProps) {
  // Custom toolbar configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'] // remove formatting button
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image', 'video'
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800">
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid var(--quill-border, #e5e7eb) !important;
          background-color: var(--quill-toolbar-bg, #f9fafb);
          border-radius: 0.75rem 0.75rem 0 0;
          padding: 12px;
        }
        .dark .ql-toolbar.ql-snow {
          --quill-border: #262626;
          --quill-toolbar-bg: #171717;
        }
        .ql-container.ql-snow {
          border: none !important;
          background-color: transparent;
        }
        .ql-editor {
          min-height: 200px;
          font-size: 1rem;
          color: var(--quill-text, #111827);
        }
        .dark .ql-editor {
          --quill-text: #f9fafb;
        }
        .dark .ql-picker-label, .dark .ql-picker-item, .dark .ql-stroke {
          color: #a3a3a3 !important;
          stroke: #a3a3a3 !important;
        }
        .dark .ql-fill {
          fill: #a3a3a3 !important;
        }
        .dark .ql-picker-options {
          background-color: #171717 !important;
          border-color: #262626 !important;
        }
        .ql-editor p {
          margin-bottom: 0.5rem;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
