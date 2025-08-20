'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export function SettingsPanel() {
  const {
    hourFormat,
    setHourFormat,
    showSeconds,
    setShowSeconds,
    primaryClockMode,
    setPrimaryClockMode,
    primaryClockTimezone,
    setPrimaryClockTimezone,
  } = useSettings();

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h3 className="font-semibold">General</h3>
        <Separator />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Label>Time Format</Label>
        <RadioGroup value={hourFormat} onValueChange={(value) => setHourFormat(value as '12h' | '24h')} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="12h" id="h12" />
            <Label htmlFor="h12">12-Hour</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="24h" id="h24" />
            <Label htmlFor="h24">24-Hour</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="show-seconds">Show Seconds</Label>
        <Switch id="show-seconds" checked={showSeconds} onCheckedChange={setShowSeconds} />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Primary Clock</h3>
        <Separator />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Label>Clock Mode</Label>
        <RadioGroup value={primaryClockMode} onValueChange={(value) => setPrimaryClockMode(value as 'digital' | 'analog')} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="digital" id="digital" />
            <Label htmlFor="digital">Digital</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="analog" id="analog" />
            <Label htmlFor="analog">Analog</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Label>Timezone</Label>
        <RadioGroup value={primaryClockTimezone} onValueChange={(value) => setPrimaryClockTimezone(value as 'local' | 'utc')} className="flex items-center">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local">Local</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="utc" id="utc" />
            <Label htmlFor="utc">UTC</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
