import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewForm } from "@/pages/view-form";
import { CommonForm } from "@/pages/common-form";
import { useState, type ComponentProps } from "react";
import type { CreateFormData } from "@/schemas/create";

type LeftPaneProps = {
  Component: React.ComponentType<ComponentProps<typeof CommonForm>>;
  props: ComponentProps<typeof CommonForm>;
};

function LeftPane({ Component, props }: LeftPaneProps) {
  return (
    <section className="relative flex flex-col gap-8 border-b border-border bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-12 xl:p-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-medium">Form builder</h2>
          <p className="text-sm text-muted-foreground">
            Design the form, then preview it on the right.
          </p>
        </div>
      </div>
      <Component {...props} />
    </section>
  );
}

function RightPane(props: { data: CreateFormData | undefined }) {
  return (
    <section className="flex flex-col justify-center bg-background p-6 sm:p-10 lg:p-12">
      <Card className="mx-auto w-full max-w-md shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">View form</CardTitle>
            <Badge variant="outline">
              <Eye data-icon="inline-start" />
              Read only
            </Badge>
          </div>
          <CardDescription>
            Preview the rendered form from the left pane.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-(--card-spacing)">
          <ViewForm data={props.data} isReadonly />
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <span>Powered by RJSF + shadcn</span>
          <span>@repo/form-tools</span>
        </CardFooter>
      </Card>
    </section>
  );
}

type FormLiveViewerProps = {
  Component: React.ComponentType<ComponentProps<typeof CommonForm>>;
  defaultData?: CreateFormData;
  onSave: (data: CreateFormData) => void;
};

export function FormLiveViewer({
  Component,
  defaultData,
  onSave,
}: FormLiveViewerProps) {
  const [formData, setFormData] = useState<CreateFormData | undefined>(
    defaultData,
  );

  const handleView = (data: CreateFormData) => {
    setFormData(data);
  };

  const handleSave = (data: CreateFormData) => {
    onSave(data);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <LeftPane
        Component={Component}
        props={{
          formData,
          onView: handleView,
          onSave: handleSave,
        }}
      />
      <RightPane data={formData} />
    </div>
  );
}
