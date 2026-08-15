import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus } from "lucide-react";

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
import { FormBuilderProvider, useFormBuilder } from "@/contexts/form-builder";
import { cn } from "@/lib/utils";
import { ViewForm } from "@/pages/view-form";

export const Route = createFileRoute("/_form-builder")({
  component: FormBuilderLayout,
});

const modes = [
  { to: "/create", label: "Create", icon: Plus },
  { to: "/edit", label: "Edit", icon: Pencil },
] as const;

function ModeToggle() {
  const matchRoute = useMatchRoute();

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {modes.map(({ to, label, icon: Icon }) => {
        const active = matchRoute({ to });

        return (
          <Button
            key={to}
            asChild
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className={cn(!active && "text-muted-foreground")}
          >
            <Link to={to}>
              <Icon data-icon="inline-start" />
              {label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

function LeftPane() {
  return (
    <section className="relative flex flex-col gap-8 border-b border-border bg-muted/40 p-8 lg:border-r lg:border-b-0 lg:p-12 xl:p-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-medium">Form builder</h2>
          <p className="text-sm text-muted-foreground">
            Design the form, then preview it on the right.
          </p>
        </div>

        <ModeToggle />
      </div>

      <Outlet />
    </section>
  );
}

function RightPane() {
  const { formData } = useFormBuilder();

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
          <ViewForm data={formData} />
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <span>Powered by RJSF + shadcn</span>
          <span>@repo/form-tools</span>
        </CardFooter>
      </Card>
    </section>
  );
}

function FormBuilderLayout() {
  return (
    <FormBuilderProvider>
      <div className="grid min-h-svh lg:grid-cols-2">
        <LeftPane />
        <RightPane />
      </div>
    </FormBuilderProvider>
  );
}
