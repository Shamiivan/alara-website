"use client";

import { Page } from "@/components/primitives/layouts";

export default function TestPagePrimitive() {
  return (
    <Page
      title="Page Primitive Test"
      subtitle="Testing the new Page component with CSS classes"
      maxWidth="lg"
    >
      {/* First section */}
      <div className="card-base p-6">
        <h2 className="text-xl font-semibold mb-4">Section 1</h2>
        <p className="text-muted-foreground mb-4">
          This content tests the Page primitive. The component should:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Apply responsive padding via content-wrapper class</li>
          <li>Show title with page-title styling</li>
          <li>Display subtitle with page-description styling</li>
          <li>Create consistent spacing between sections</li>
        </ul>
      </div>

      {/* Second section */}
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold mb-2">Section 2</h3>
        <p className="text-muted-foreground">
          This section tests the spacing-content class between sections.
          There should be consistent vertical space above this card.
        </p>
      </div>

      {/* Grid section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <h4 className="font-semibold mb-2">Grid Item 1</h4>
          <p className="text-sm text-muted-foreground">
            Testing responsive grid layout within Page primitive
          </p>
        </div>
        <div className="card-base p-6">
          <h4 className="font-semibold mb-2">Grid Item 2</h4>
          <p className="text-sm text-muted-foreground">
            Should be 2 columns on desktop, 1 column on mobile
          </p>
        </div>
      </div>

      {/* Edge Case: Page without props */}
      <Page>
        <div className="card-base p-6">
          <p>Page with no title or subtitle</p>
        </div>
      </Page>

      {/* Edge Case: Different max widths */}
      <Page title="Small Width Test" maxWidth="sm">
        <div className="card-base p-6">
          <p>This should have a smaller max width</p>
        </div>
      </Page>

      <Page title="Extra Large Test" maxWidth="xl">
        <div className="card-base p-6">
          <p>This should have extra large max width</p>
        </div>
      </Page>

      {/* Edge Case: Custom classes */}
      <Page title="Custom Background" className="bg-accent/5">
        <div className="card-base p-6">
          <p>This page should have a subtle background tint</p>
        </div>
      </Page>
    </Page>
  );
}