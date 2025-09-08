"use client";

import { Page, Section, Card } from "@/components/primitives/layouts";

export default function TestAllLayouts() {
  return (
    <Page
      title="All Layout Primitives Test"
      subtitle="Testing Page, Section, and Card components together"
      maxWidth="xl"
    >
      <Section title="Overview" spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <h3 className="font-semibold mb-2">Page Primitive</h3>
            <p className="text-muted-foreground text-sm">
              Provides consistent layout with responsive padding, title, and content wrapper
            </p>
          </Card>
          <Card variant="elevated">
            <h3 className="font-semibold mb-2">Section Primitive</h3>
            <p className="text-muted-foreground text-sm">
              Groups related content with optional titles and configurable spacing
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Card Variants" subtitle="Different card styles and interactions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <h4 className="font-semibold mb-2">Default Card</h4>
            <p className="text-muted-foreground text-sm">Basic card with standard styling</p>
          </Card>

          <Card variant="elevated">
            <h4 className="font-semibold mb-2">Elevated Card</h4>
            <p className="text-muted-foreground text-sm">Enhanced shadow for emphasis</p>
          </Card>

          <Card
            variant="elevated"
            onClick={() => alert('Interactive card clicked!')}
            className="hover:scale-105 transition-transform cursor-pointer"
          >
            <h4 className="font-semibold mb-2">Interactive Card</h4>
            <p className="text-muted-foreground text-sm">Clickable with hover effects</p>
          </Card>
        </div>
      </Section>

      <Section title="Spacing Examples" spacing="md">
        <div className="space-y-6">
          <Card>
            <h4 className="font-semibold mb-2">Small Spacing Section</h4>
            <p className="text-muted-foreground text-sm">
              This content is in a section with medium spacing (default)
            </p>
          </Card>

          <Card>
            <h4 className="font-semibold mb-2">Consistent Layout</h4>
            <p className="text-muted-foreground text-sm">
              All primitives work together to create consistent, maintainable layouts
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Responsive Grid" subtitle="Cards adapt to different screen sizes">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2"></div>
              <p className="text-xs font-medium">Small</p>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full mx-auto mb-2"></div>
              <p className="text-xs font-medium">Medium</p>
            </div>
          </Card>
          <Card padding="lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-2"></div>
              <p className="text-xs font-medium">Large</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full mx-auto mb-2"></div>
              <p className="text-xs font-medium">Default</p>
            </div>
          </Card>
        </div>
      </Section>
    </Page>
  );
}