import { ArrowRight, FormInput, Layers, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RjsfForm } from "./components/ui/Form";
import { CreateForm } from "./pages/create-form";
import { useState } from "react";
import type { CreateFormData } from "./schemas/create";
import { ViewForm } from "./pages/view-form";
import { EditForm } from "./pages/edit-form";

const features = [
  {
    icon: FormInput,
    title: "Schema-driven",
    description: "Define forms once, render everywhere.",
  },
  {
    icon: Layers,
    title: "Shared tools",
    description: "One package for web and API.",
  },
  {
    icon: Zap,
    title: "Fast iteration",
    description: "Ship field changes without rewrites.",
  },
] as const;

function App() {
  const [formData, setFormData] = useState<CreateFormData>();

  function handleFormSubmit(data: CreateFormData) {
    setFormData(data);
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — marketing */}
      <section className="relative flex flex-col justify-between gap-10 border-b border-border bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-12 xl:p-16">
        <CreateForm onSubmit={handleFormSubmit} />
      </section>

      {/* Right — live preview */}
      <section className="flex flex-col justify-center bg-background p-6 sm:p-10 lg:p-12">
        <Card className="mx-auto w-full max-w-md shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Live preview</CardTitle>
              <Badge variant="outline">Demo</Badge>
            </div>
            <CardDescription>
              Interact with a sample schema-rendered form on the right pane.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-(--card-spacing)">
            <EditForm formData={formData} onSubmit={handleFormSubmit} />
          </CardContent>
          <CardFooter className="justify-between text-xs text-muted-foreground">
            <span>Powered by RJSF + shadcn</span>
            <span>@repo/form-tools</span>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

export default App;
