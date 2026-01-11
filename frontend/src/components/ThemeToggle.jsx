import { useId } from "react";
import { Label } from "./ui/label";
import { Switch, SwitchIndicator, SwitchWrapper } from "./ui/switch";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const id = useId();

  return (
    <div className="fixed bottom-0.5 right-8 z-50">
      <SwitchWrapper>
        <Switch id={id} size="xl" />
        <SwitchIndicator state="on">
          <Sun className="size-4 text-primary-foreground" />
        </SwitchIndicator>
        <SwitchIndicator state="off">
          <Moon className="size-4 text-muted-foreground" />
        </SwitchIndicator>
      </SwitchWrapper>
    </div>
  );
}
