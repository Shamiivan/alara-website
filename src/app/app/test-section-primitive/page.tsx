"use client";

import { Page } from "@/components/primitives/layouts";
import { Section } from "@/components/primitives/layouts/Section";
import { Card } from "@/components/primitives/layouts/Card";

export default function TestSectionPrimitive() {
  return (
    <Page title="Section Primitive Test" subtitle="Testing Section component with different spacing">
      <Section title="Small Spacing Section" spacing="sm">
        <Card>
          <p>This section uses small spacing (space-y-4)</p>
        </Card>
        <Card>
          <p>Content should be closer together</p>
        </Card>
      </Section>

      <Section title="Medium Spacing Section" subtitle="This is the default spacing" spacing="md">
        <Card>
          <p>This section uses medium spacing (space-y-6)</p>
        </Card>
        <Card>
          <p>This is the default spacing option</p>
        </Card>
      </Section>

      <Section title="Large Spacing Section" spacing="lg">
        <Card>
          <p>This section uses large spacing (space-y-8)</p>
        </Card>
        <Card>
          <p>Content should be more spread out</p>
        </Card>
      </Section>

      <Section>
        <Card>
          <p>This section has no title or subtitle</p>
        </Card>
        <Card>
          <p>Just content with default spacing</p>
        </Card>
      </Section>
    </Page>
  );
}