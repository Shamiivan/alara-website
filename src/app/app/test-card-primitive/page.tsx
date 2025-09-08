"use client";

import { Page } from "@/components/primitives/layouts";
import { Card } from "@/components/primitives/layouts/Card";

export default function TestCardPrimitive() {
  return (
    <Page title="Card Primitive Test" subtitle="Testing Card component variants">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="default">
          <h3 className="font-semibold mb-2">Default Card</h3>
          <p className="text-muted-foreground">Uses card-base class</p>
        </Card>

        <Card variant="elevated">
          <h3 className="font-semibold mb-2">Elevated Card</h3>
          <p className="text-muted-foreground">Uses card-elevated class</p>
        </Card>

        <Card
          variant="elevated"
          onClick={() => alert('Card clicked!')}
          className="hover:scale-105 transition-transform"
        >
          <h3 className="font-semibold mb-2">Clickable Card</h3>
          <p className="text-muted-foreground">Click me!</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card padding="sm">
          <p>Small padding</p>
        </Card>
        <Card padding="md">
          <p>Medium padding (default)</p>
        </Card>
        <Card padding="lg">
          <p>Large padding</p>
        </Card>
      </div>
    </Page>
  );
}