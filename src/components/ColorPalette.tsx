"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ColorSwatch {
  name: string;
  variable: string;
  description: string;
  hexExample: string;
}

const ColorPalette = () => {
  const primaryColors: ColorSwatch[] = [
    {
      name: "Primary",
      variable: "--primary",
      description: "Deep Indigo - Main CTAs, headlines, key UI elements",
      hexExample: "#4F46E5",
    },
    {
      name: "Primary Light",
      variable: "--primary-light",
      description: "Soft Lavender - Light backgrounds, subtle accents",
      hexExample: "#E0E7FF",
    },
    {
      name: "Primary Dark",
      variable: "--primary-dark",
      description: "Darker Indigo - Hover states, emphasis",
      hexExample: "#3730A3",
    },
  ];

  const semanticColors: ColorSwatch[] = [
    {
      name: "Voice Accent",
      variable: "--voice-accent",
      description: "Teal - Voice interactions, audio elements",
      hexExample: "#14B8A6",
    },
    {
      name: "Secondary",
      variable: "--secondary",
      description: "Warm Purple - Secondary actions, features",
      hexExample: "#A78BFA",
    },
    {
      name: "Success",
      variable: "--success",
      description: "Soft Green - Success states, positive feedback",
      hexExample: "#10B981",
    },
    {
      name: "Accent",
      variable: "--accent",
      description: "Warm Orange - Warnings, attention elements",
      hexExample: "#F59E0B",
    },
    {
      name: "Destructive",
      variable: "--destructive",
      description: "Soft Red - Error states, destructive actions",
      hexExample: "#EF4444",
    },
  ];

  const voiceColors: ColorSwatch[] = [
    {
      name: "Voice Background",
      variable: "--voice-bg",
      description: "Light background for voice interactions",
      hexExample: "#F8FAFC",
    },
    {
      name: "Voice User",
      variable: "--voice-user",
      description: "User message bubble color",
      hexExample: "#10B981",
    },
    {
      name: "Voice AI",
      variable: "--voice-ai",
      description: "AI message bubble color",
      hexExample: "#A78BFA",
    },
  ];

  const ColorSection = ({ title, colors }: { title: string; colors: ColorSwatch[] }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <Card key={color.name} className="overflow-hidden">
            <div
              className="h-20 w-full"
              style={{ backgroundColor: `hsl(var(${color.variable}))` }}
            />
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{color.name}</h4>
                <p className="text-sm text-muted-foreground">{color.description}</p>
                <div className="space-y-1 text-xs">
                  <p className="font-mono text-muted-foreground">
                    CSS: <span className="text-foreground">var({color.variable})</span>
                  </p>
                  <p className="font-mono text-muted-foreground">
                    Hex: <span className="text-foreground">{color.hexExample}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Alara Color System</CardTitle>
          <p className="text-muted-foreground">
            A cohesive color palette designed for trust, warmth, and voice-first interactions.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <ColorSection title="Primary Brand Colors" colors={primaryColors} />
          <ColorSection title="Semantic Colors" colors={semanticColors} />
          <ColorSection title="Voice UI Colors" colors={voiceColors} />
        </CardContent>
      </Card>

      {/* Interactive Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Interactive Examples</CardTitle>
          <p className="text-muted-foreground">See the colors in action with real components.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Examples */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Button Variants</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Error Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>

          {/* Voice Bubble Examples */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Voice Conversation Bubbles</h4>
            <div className="space-y-3 max-w-md">
              <div className="bubble-user">
                <p>This is a user message using the voice-user color.</p>
              </div>
              <div className="bubble-ai">
                <p>This is an AI response using the voice-ai color.</p>
              </div>
            </div>
          </div>

          {/* Badge Examples */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Status Badges</h4>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[hsl(var(--success)/0.15)] text-success">
                Success
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[hsl(var(--accent)/0.15)] text-accent">
                Warning
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[hsl(var(--destructive)/0.15)] text-destructive">
                Error
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[hsl(var(--voice-accent)/0.15)] text-voice-accent">
                Voice Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorPalette;