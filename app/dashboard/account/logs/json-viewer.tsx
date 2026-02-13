"use client"

import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json"
import monokai from "react-syntax-highlighter/dist/esm/styles/hljs/monokai"

SyntaxHighlighter.registerLanguage("json", json)

interface JsonViewerProps {
  data: unknown
}

export default function JsonViewer({ data }: JsonViewerProps) {
  return (
    <SyntaxHighlighter
      language="json"
      style={monokai}
      customStyle={{ borderRadius: "0.5rem", fontSize: "0.75rem" }}
      wrapLongLines
    >
      {JSON.stringify(data, null, 2)}
    </SyntaxHighlighter>
  )
}
