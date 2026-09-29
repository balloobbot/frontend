import { marked } from "marked";
import { describe, expect, it } from "vitest";
import type { RepositoryInfo } from "../../../src/data/marketplace/repository";
import { markdownWithRepositoryContext } from "../../../src/panels/marketplace/tools/markdown";

const repository = {
  id: "42",
  full_name: "owner/repo",
  installed: true,
  installed_version: "v1.0.0",
  available_version: "v2.0.0",
  default_branch: "main",
} as RepositoryInfo;

describe("review: README rendering", () => {
  it("resolves assets against the installed README version", () => {
    expect(markdownWithRepositoryContext("![old](old.png)", repository)).toBe(
      "![old](https://raw.githubusercontent.com/owner/repo/v1.0.0/old.png)"
    );
  });

  it("rewrites a relative link followed by an absolute link", () => {
    expect(
      markdownWithRepositoryContext(
        "[guide](guide.md) [website](https://example.com)",
        { ...repository, installed: false }
      )
    ).toBe(
      "[guide](https://github.com/owner/repo/blob/v2.0.0/guide.md) [website](https://example.com)"
    );
  });

  it("preserves email links", () => {
    const input = "[Email](mailto:maintainer@example.com)";
    expect(markdownWithRepositoryContext(input, repository)).toBe(input);
  });

  it("preserves issue links that are already linked", () => {
    const input = "Fixed [#123](https://github.com/owner/repo/issues/123).";
    expect(markdownWithRepositoryContext(input, repository)).toBe(input);
  });

  it("preserves indented YAML code blocks", () => {
    const input = "Configuration:\n\n    color: '#123456'\n    value: 1\n";
    expect(markdownWithRepositoryContext(input, repository)).toBe(input);
  });

  it("preserves indented YAML code inside a list item", () => {
    const input = "- Configure the card:\n\n      color: '#123456'\n";
    // Verify this is a code block using the frontend's actual Markdown parser.
    expect(marked.parse(input)).toContain("<pre><code>color:");
    expect(markdownWithRepositoryContext(input, repository)).toBe(input);
  });
});
